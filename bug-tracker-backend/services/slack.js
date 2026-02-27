const axios = require("axios");

async function sendToSlack(webhookUrl, payload) {
  if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com/")) {
    throw new Error("Invalid Slack webhook URL");
  }
  const text = [
    `*Bug Report*`,
    `*Title:* ${payload.title || "N/A"}`,
    `*Description:* ${payload.description || "N/A"}`,
    `*Page URL:* ${payload.pageUrl || "N/A"}`,
    `*Email:* ${payload.email || "N/A"}`,
    `*User Agent:* ${payload.userAgent || "N/A"}`,
    payload.extraData && Object.keys(payload.extraData).length
      ? `*Extra data:*\n\`\`\`${JSON.stringify(payload.extraData, null, 2)}\`\`\``
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  await axios.post(webhookUrl, { text }, { headers: { "Content-Type": "application/json" } });
}

module.exports = { sendToSlack };
