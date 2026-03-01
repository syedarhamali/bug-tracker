const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("../db/db");
const authRoutes = require("../routes/auth");
const widgetConfigRoutes = require("../routes/widgetConfig");
const bugReportRoutes = require("../routes/bug-report");
const widgetRoutes = require("../routes/widget");
const integrationsRoutes = require("../routes/integrations");
const billingRoutes = require("../routes/billing");
const lemonsqueezyWebhook = require("../routes/lemonsqueezy-webhook");

dotenv.config();
const app = express();
app.set("trust proxy", true);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(morgan("combined"));
app.use("/webhooks/lemonsqueezy", express.raw({ type: "application/json" }), lemonsqueezyWebhook);
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, true);
    },
    credentials: true,
  })
);

connectDB();

app.get("/", (req, res) => res.json({ message: "Bug Tracker API running" }));

app.use("/auth", authRoutes);
app.use("/billing", billingRoutes);
app.use("/widget-config", widgetConfigRoutes);
app.use("/integrations", integrationsRoutes);
app.use("/bug-report", bugReportRoutes);
app.use("/widget", widgetRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
