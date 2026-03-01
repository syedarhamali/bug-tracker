const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/User");

const WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) return false;
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "utf8"), Buffer.from(signature || "", "utf8"));
  } catch {
    return false;
  }
}

function getCustomUserId(payload) {
  try {
    const data = payload?.meta?.custom_data;
    return data?.user_id || null;
  } catch {
    return null;
  }
}

function getSubscriptionAttributes(payload) {
  try {
    return payload?.data?.attributes || {};
  } catch {
    return {};
  }
}

router.post("/", (req, res) => {
  const signature = req.headers["x-signature"];
  const eventName = req.headers["x-event-name"];
  const rawBody =
    Buffer.isBuffer(req.body) ? req.body.toString("utf8") : typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  if (!verifySignature(rawBody, signature)) {
    return res.status(401).send("Invalid signature");
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).send("Invalid JSON");
  }

  const userId = getCustomUserId(payload);
  const attrs = getSubscriptionAttributes(payload);
  const variantId = attrs.variant_id;

  const run = async () => {
    if (!userId) return;

    const planFromVariant =
      process.env.LEMON_SQUEEZY_VARIANT_TEAM && Number(variantId) === Number(process.env.LEMON_SQUEEZY_VARIANT_TEAM)
        ? "team"
        : process.env.LEMON_SQUEEZY_VARIANT_PRO && Number(variantId) === Number(process.env.LEMON_SQUEEZY_VARIANT_PRO)
          ? "pro"
          : null;

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_payment_success":
      case "subscription_resumed":
      case "subscription_payment_recovered":
        if (planFromVariant) {
          await User.findByIdAndUpdate(userId, { plan: planFromVariant });
        }
        break;
      case "subscription_cancelled":
      case "subscription_expired":
      case "subscription_payment_failed":
        await User.findByIdAndUpdate(userId, { plan: "free" });
        break;
      default:
        break;
    }
  };

  run().catch((e) => console.error("Lemon Squeezy webhook error:", e));
  res.status(200).send("OK");
});

module.exports = router;
