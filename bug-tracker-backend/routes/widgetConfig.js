const express = require("express");
const router = express.Router();
const axios = require("axios");
const WidgetConfig = require("../models/WidgetConfig");
const BugReport = require("../models/BugReport");
const auth = require("../middleware/auth");
const { getLimits } = require("../config/plans");
const TRELLO_KEY = process.env.TRELLO_API_KEY;

router.get("/", auth, async (req, res) => {
  try {
    const configs = await WidgetConfig.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: configs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, domain } = req.body;
    if (!name || !domain) {
      return res.status(400).json({ error: "Name and domain are required" });
    }
    const plan = req.user.plan || "free";
    const limits = getLimits(plan);
    const count = await WidgetConfig.countDocuments({ userId: req.user._id });
    if (count >= limits.widgets) {
      return res.status(402).json({
        error: "Widget limit reached for your plan. Upgrade to add more widgets.",
        code: "WIDGET_LIMIT",
        limit: limits.widgets,
      });
    }
    const config = new WidgetConfig({
      name,
      domain: domain.replace(/^https?:\/\//, "").split("/")[0],
      userId: req.user._id,
    });
    await config.save();
    res.status(201).json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/trello/boards", auth, async (req, res) => {
  try {
    const config = await WidgetConfig.findOne({ _id: req.params.id, userId: req.user._id });
    if (!config) return res.status(404).json({ error: "Widget not found" });
    if (!config.trelloToken || !TRELLO_KEY) {
      return res.status(400).json({ error: "Connect Trello first" });
    }
    const { data } = await axios.get(
      `https://api.trello.com/1/members/me/boards?key=${TRELLO_KEY}&token=${config.trelloToken}&fields=name,id`
    );
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

router.post("/:id/test-slack", auth, async (req, res) => {
  try {
    const config = await WidgetConfig.findOne({ _id: req.params.id, userId: req.user._id });
    if (!config) return res.status(404).json({ error: "Widget not found" });
    if (!config.slackWebhookUrl) return res.status(400).json({ error: "Add a Slack webhook first" });
    const axios = require("axios");
    await axios.post(
      config.slackWebhookUrl,
      { text: "✅ *Bug Tracker test* – If you see this, Slack is connected." },
      { headers: { "Content-Type": "application/json" } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.message || err.message });
  }
});

router.get("/:id/trello/lists", auth, async (req, res) => {
  try {
    const boardId = req.query.boardId;
    if (!boardId) return res.status(400).json({ error: "boardId required" });
    const config = await WidgetConfig.findOne({ _id: req.params.id, userId: req.user._id });
    if (!config) return res.status(404).json({ error: "Widget not found" });
    if (!config.trelloToken || !TRELLO_KEY) {
      return res.status(400).json({ error: "Connect Trello first" });
    }
    const { data } = await axios.get(
      `https://api.trello.com/1/boards/${boardId}/lists?key=${TRELLO_KEY}&token=${config.trelloToken}&fields=name,id`
    );
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const config = await WidgetConfig.findOne({ _id: req.params.id, userId: req.user._id });
    if (!config) return res.status(404).json({ error: "Widget not found" });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.sendToSlack === "boolean") updates.sendToSlack = req.body.sendToSlack;
    if (typeof req.body.slackWebhookUrl !== "undefined") updates.slackWebhookUrl = req.body.slackWebhookUrl || null;
    if (typeof req.body.sendToTrello === "boolean") updates.sendToTrello = req.body.sendToTrello;
    if (typeof req.body.trelloApiKey !== "undefined") updates.trelloApiKey = req.body.trelloApiKey || null;
    if (typeof req.body.trelloToken !== "undefined") updates.trelloToken = req.body.trelloToken || null;
    if (typeof req.body.trelloListId !== "undefined") updates.trelloListId = req.body.trelloListId || null;
    if (typeof req.body.trelloBoardId !== "undefined") updates.trelloBoardId = req.body.trelloBoardId || null;
    if (req.body.name) updates.name = req.body.name;
    if (req.body.domain) updates.domain = req.body.domain.replace(/^https?:\/\//, "").split("/")[0];

    const config = await WidgetConfig.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true }
    );
    if (!config) return res.status(404).json({ error: "Widget not found" });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const config = await WidgetConfig.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!config) return res.status(404).json({ error: "Widget not found" });
    res.json({ message: "Widget deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/reports", auth, async (req, res) => {
  try {
    const config = await WidgetConfig.findOne({ _id: req.params.id, userId: req.user._id });
    if (!config) return res.status(404).json({ error: "Widget not found" });
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      BugReport.find({ widgetId: config.widgetId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BugReport.countDocuments({ widgetId: config.widgetId }),
    ]);
    res.json({ data: reports, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
