const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const BugReport = require("../models/BugReport");
const WidgetConfig = require("../models/WidgetConfig");
const { sendToSlack } = require("../services/slack");
const { createTrelloCard } = require("../services/trello");
const { isConfigured: cloudinaryConfigured, uploadBuffer } = require("../services/cloudinary");

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Too many submissions from this IP, try again later" },
  validate: { trustProxy: false },
});

const MEDIA_MAX_BYTES = 20 * 1024 * 1024; // 20MB for short video
const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MEDIA_MAX_BYTES },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (ok) cb(null, true);
    else cb(new Error("Only images and videos are allowed"), false);
  },
});

function optionalMulter(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (ct.indexOf("multipart/form-data") !== -1) {
    return mediaUpload.single("media")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "File too large (max 20MB)" });
        return res.status(400).json({ error: err.message || "Invalid file" });
      }
      next();
    });
  }
  next();
}

router.post("/", submitLimiter, optionalMulter, async (req, res) => {
  try {
    const isMultipart = !!req.file;
    const body = req.body;
    let widgetId = body.widgetId || body.apiKey;
    let title = body.title;
    let description = body.description;
    let email = body.email;
    let pageUrl = body.pageUrl;
    let extraData = body.extraData;

    if (isMultipart && typeof extraData === "string") {
      try {
        extraData = JSON.parse(extraData);
      } catch (_) {
        extraData = {};
      }
    }

    const id = widgetId;
    if (!id) {
      return res.status(400).json({ error: "widgetId or apiKey is required" });
    }
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "Email is required" });
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

    let mediaUrl = null;
    if (req.file && cloudinaryConfigured()) {
      try {
        const result = await uploadBuffer(
          req.file.buffer,
          req.file.mimetype,
          "bug-reports"
        );
        mediaUrl = result.url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr.message);
        return res.status(500).json({ error: "Failed to upload media. Please try again." });
      }
    } else if (req.file && !cloudinaryConfigured()) {
      return res.status(503).json({ error: "Media upload is not configured" });
    }

    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers["user-agent"] || body.userAgent || null;

    const report = new BugReport({
      widgetId: config.widgetId,
      title: String(title).trim().substring(0, 200),
      description: String(description).trim(),
      email: String(email).trim().toLowerCase(),
      mediaUrl: mediaUrl || undefined,
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
      mediaUrl: report.mediaUrl,
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
