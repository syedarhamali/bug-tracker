const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const BugReport = require("../models/BugReport");
const WidgetConfig = require("../models/WidgetConfig");
const User = require("../models/User");
const { getLimits } = require("../config/plans");
const { sendToSlack } = require("../services/slack");
const { createTrelloCard } = require("../services/trello");

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Too many submissions from this IP, try again later" },
  validate: { trustProxy: false },
});

router.post("/", submitLimiter, async (req, res) => {
  try {
    const { widgetId, apiKey, title, description, email, pageUrl, extraData } = req.body;
    const id = widgetId || apiKey;
    if (!id) {
      return res.status(400).json({ error: "widgetId or apiKey is required" });
    }
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }
    if (description.length < 10 || description.length > 5000) {
      return res.status(400).json({ error: "Description must be between 10 and 5000 characters" });
    }

    const config = await WidgetConfig.findOne({
      $or: [{ widgetId: id }, { apiKey: id }],
    });
    if (!config) {
      return res.status(400).json({ error: "Invalid widget" });
    }

    const owner = await User.findById(config.userId).select("plan").lean();
    const plan = (owner && owner.plan) || "free";
    const limits = getLimits(plan);
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const widgetIds = await WidgetConfig.distinct("widgetId", { userId: config.userId });
    const reportsThisMonth = await BugReport.countDocuments({
      widgetId: { $in: widgetIds },
      createdAt: { $gte: startOfMonth },
    });
    if (reportsThisMonth >= limits.reportsPerMonth) {
      return res.status(402).json({
        error: "Report limit reached for this account this month. The site owner can upgrade for more.",
        code: "REPORT_LIMIT",
      });
    }

    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers["user-agent"] || null;

    const report = new BugReport({
      widgetId: config.widgetId,
      title: String(title).trim().substring(0, 200),
      description: String(description).trim(),
      email: email ? String(email).trim().toLowerCase() : null,
      pageUrl: pageUrl || null,
      userAgent,
      extraData: extraData && typeof extraData === "object" ? extraData : {},
      ipAddress,
    });
    await report.save();

    const payload = {
      title: report.title,
      description: report.description,
      email: report.email,
      pageUrl: report.pageUrl,
      userAgent: report.userAgent,
      extraData: report.extraData,
    };

    const promises = [];
    if (config.sendToSlack && config.slackWebhookUrl) {
      promises.push(sendToSlack(config.slackWebhookUrl, payload).catch((e) => console.error("Slack error:", e.message)));
    }
    if (config.sendToTrello && config.trelloApiKey && config.trelloToken && config.trelloListId) {
      promises.push(
        createTrelloCard(config.trelloApiKey, config.trelloToken, config.trelloListId, payload).catch((e) =>
          console.error("Trello error:", e.message)
        )
      );
    }
    await Promise.all(promises);

    res.status(201).json({ message: "Bug report submitted successfully", reportId: report._id });
  } catch (err) {
    console.error("Bug report error:", err);
    res.status(500).json({ error: "An error occurred while submitting the bug report" });
  }
});

module.exports = router;
