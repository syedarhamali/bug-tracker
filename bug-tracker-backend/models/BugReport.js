const mongoose = require("mongoose");

const bugReportSchema = new mongoose.Schema(
  {
    widgetId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    email: { type: String, trim: true, lowercase: true },
    pageUrl: { type: String, default: null },
    userAgent: { type: String, default: null },
    extraData: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "rejected"],
      default: "open",
    },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true }
);

bugReportSchema.index({ widgetId: 1, createdAt: -1 });

module.exports = mongoose.model("BugReport", bugReportSchema);
