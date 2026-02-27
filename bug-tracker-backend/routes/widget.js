const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

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
