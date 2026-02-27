const axios = require("axios");

async function createTrelloCard(apiKey, token, listId, payload) {
  if (!apiKey || !token || !listId) {
    throw new Error("Trello API key, token, and list ID are required");
  }
  const name = (payload.title || "Bug Report").substring(0, 16384);
  const desc = [
    `**Description:**\n${payload.description || "N/A"}`,
    `**Page URL:** ${payload.pageUrl || "N/A"}`,
    `**Email:** ${payload.email || "N/A"}`,
    `**User Agent:** ${payload.userAgent || "N/A"}`,
    payload.extraData && Object.keys(payload.extraData).length
      ? `**Extra data:**\n\`\`\`\n${JSON.stringify(payload.extraData, null, 2)}\n\`\`\``
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const url = `https://api.trello.com/1/cards?key=${apiKey}&token=${token}`;
  const response = await axios.post(
    url,
    {
      idList: listId.trim(),
      name,
      desc,
    },
    {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    }
  );
  if (response.status >= 400) {
    const msg =
      response.data != null
        ? typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data)
        : `HTTP ${response.status}`;
    console.error("Trello error:", response.status, msg, "(List ID used:", listId.trim() + ")");
    throw new Error(`Trello API ${response.status}: ${msg}`);
  }
}

module.exports = { createTrelloCard };
