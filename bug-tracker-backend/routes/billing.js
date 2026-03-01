const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const LEMON_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const LEMON_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
const LEMON_VARIANT_PRO = process.env.LEMON_SQUEEZY_VARIANT_PRO;
const LEMON_VARIANT_TEAM = process.env.LEMON_SQUEEZY_VARIANT_TEAM;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Create a Lemon Squeezy checkout for recurring subscription.
 * Returns { url } to redirect the user to pay.
 */
router.post("/checkout", auth, async (req, res) => {
  if (!LEMON_API_KEY || !LEMON_STORE_ID) {
    return res.status(503).json({ error: "Recurring billing is not configured" });
  }
  const plan = req.body.plan === "team" ? "team" : "pro";
  const variantId = plan === "team" ? LEMON_VARIANT_TEAM : LEMON_VARIANT_PRO;
  if (!variantId) {
    return res.status(400).json({ error: `Plan "${plan}" is not available for card subscription` });
  }
  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMON_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            store_id: Number(LEMON_STORE_ID),
            variant_id: Number(variantId),
            product_options: {
              redirect_url: `${FRONTEND_URL}/dashboard?upgraded=1`,
            },
            checkout_data: {
              custom: {
                user_id: String(req.user._id),
              },
              email: req.user.email || undefined,
              name: [req.user.firstName, req.user.lastName].filter(Boolean).join(" ") || undefined,
            },
          },
        },
      }),
    });
    const data = await response.json();
    const url = data?.data?.attributes?.url;
    if (!url) {
      console.error("Lemon Squeezy checkout error:", data);
      return res.status(502).json({ error: "Could not create checkout" });
    }
    res.json({ url });
  } catch (err) {
    console.error("Billing checkout error:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

module.exports = router;
