const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const WidgetConfig = require("../models/WidgetConfig");

router.get("/visibility", async (req, res) => {
  try {
    const widgetId = req.query.widgetId || req.query.apiKey;
    if (!widgetId) {
      return res.status(400).json({ error: "widgetId or apiKey required" });
    }
    const config = await WidgetConfig.findOne({
      $or: [{ widgetId }, { apiKey: widgetId }],
    }).select("visible").lean();
    if (!config) {
      return res.status(404).json({ error: "Widget not found" });
    }
    res.json({ visible: config.visible !== false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/script.js", (req, res) => {
  const scriptPath = path.join(__dirname, "..", "public", "widget.js");
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).send("Widget script not found");
  }
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.sendFile(scriptPath);
});

module.exports = router;
