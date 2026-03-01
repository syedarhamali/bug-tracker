const mongoose = require("mongoose");
const crypto = require("crypto");

const widgetConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    widgetId: { type: String, unique: true, sparse: true },
    apiKey: { type: String, unique: true, sparse: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sendToSlack: { type: Boolean, default: false },
    slackWebhookUrl: { type: String, default: null },
    sendToTrello: { type: Boolean, default: false },
    trelloApiKey: { type: String, default: null },
    trelloToken: { type: String, default: null },
    trelloListId: { type: String, default: null },
    trelloBoardId: { type: String, default: null },
    visible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

widgetConfigSchema.pre("save", function (next) {
  if (!this.widgetId) {
    this.widgetId = "w_" + crypto.randomBytes(8).toString("hex");
  }
  if (!this.apiKey) {
    this.apiKey = "bt_" + crypto.randomBytes(16).toString("hex");
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("WidgetConfig", widgetConfigSchema);
