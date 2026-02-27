const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const WidgetConfig = require("../models/WidgetConfig");
const auth = require("../middleware/auth");

const pendingTrello = new Map();
const TRELLO_KEY = process.env.TRELLO_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

function cleanupPending() {
  const now = Date.now();
  for (const [code, data] of pendingTrello.entries()) {
    if (data.expiresAt < now) pendingTrello.delete(code);
  }
}

// POST /integrations/trello/connect - get Trello OAuth URL (auth required)
router.post("/trello/connect", auth, async (req, res) => {
  try {
    if (!TRELLO_KEY) {
      return res.status(503).json({ error: "Trello integration is not configured" });
    }
    const { widgetId } = req.body;
    if (!widgetId) return res.status(400).json({ error: "widgetId required" });
    const config = await WidgetConfig.findOne({ _id: widgetId, userId: req.user._id });
    if (!config) return res.status(404).json({ error: "Widget not found" });
    const code = crypto.randomBytes(16).toString("hex");
    pendingTrello.set(code, {
      userId: req.user._id.toString(),
      widgetId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    cleanupPending();
    const returnUrl = `${FRONTEND_URL}/dashboard/widget/${widgetId}/trello-callback?state=${code}`;
    const redirectUrl =
      `https://trello.com/1/authorize?key=${TRELLO_KEY}&return_url=${encodeURIComponent(returnUrl)}` +
      `&scope=read,write&expiration=never&name=Bug%20Tracker&response_type=token`;
    res.json({ redirectUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /integrations/trello/callback - save token after user authorized (state from connect)
router.post("/trello/callback", async (req, res) => {
  try {
    const { state, token } = req.body;
    if (!state || !token) return res.status(400).json({ error: "state and token required" });
    const pending = pendingTrello.get(state);
    if (!pending || pending.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired link. Please try connecting again." });
    }
    pendingTrello.delete(state);
    const config = await WidgetConfig.findOneAndUpdate(
      { _id: pending.widgetId, userId: pending.userId },
      {
        $set: {
          trelloToken: token,
          sendToTrello: true,
          trelloApiKey: TRELLO_KEY || null,
        },
      },
      { new: true }
    );
    if (!config) return res.status(404).json({ error: "Widget not found" });
    res.json({ success: true, widgetId: config._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
