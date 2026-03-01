const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName: firstName || "",
      lastName: lastName || "",
      email,
      password: hashedPassword,
    });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (!user.password) return res.status(400).json({ error: "Sign in with Google for this account" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = req.user;
    const plan = user.plan || "free";
    const limits = require("../config/plans").getLimits(plan);
    const widgetsCount = await require("../models/WidgetConfig").countDocuments({ userId: user._id });
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const widgetIds = await require("../models/WidgetConfig").distinct("widgetId", { userId: user._id });
    const reportsThisMonth = widgetIds.length
      ? await require("../models/BugReport").countDocuments({
          widgetId: { $in: widgetIds },
          createdAt: { $gte: startOfMonth },
        })
      : 0;
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      hasPassword: !!user.password,
      plan,
      usage: {
        widgets: widgetsCount,
        widgetsLimit: limits.widgets,
        reportsThisMonth,
        reportsPerMonthLimit: limits.reportsPerMonth,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/me", auth, async (req, res) => {
  try {
    const user = req.user;
    const { firstName, lastName } = req.body;
    if (firstName !== undefined) user.firstName = String(firstName).trim();
    if (lastName !== undefined) user.lastName = String(lastName).trim();
    await user.save();
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      hasPassword: !!user.password,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/password", auth, async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!user.password) {
      return res.status(400).json({ error: "Account uses Google sign-in. Set a password below to also sign in with email." });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

function getBackendOrigin() {
  if (process.env.BACKEND_ORIGIN) return process.env.BACKEND_ORIGIN.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.API_ORIGIN || `http://localhost:${process.env.PORT || 5000}`;
}

router.get("/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: "Google sign-in is not configured" });
  }
  const returnTo = req.query.returnTo === "signup" ? "signup" : "login";
  const state = Buffer.from(JSON.stringify({ returnTo })).toString("base64url");
  const backendOrigin = getBackendOrigin();
  const redirectUri = `${backendOrigin}/auth/google/callback`;
  const scope = "openid email profile";
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}&access_type=offline&prompt=consent`;
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${FRONTEND_URL}/login?error=Google+sign-in+not+configured`);
  }
  const { code, state } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=Missing+authorization+code`);
  }
  try {
    const backendOrigin = getBackendOrigin();
    const redirectUri = `${backendOrigin}/auth/google/callback`;
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { id: googleId, email, name, given_name, family_name } = userRes.data;
    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=No+email+from+Google`);
    }
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        googleId,
        firstName: given_name || (name && name.split(" ")[0]) || "",
        lastName: family_name || (name && name.split(" ").slice(1).join(" ")) || "",
        password: null,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save({ validateBeforeSave: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${FRONTEND_URL}/auth/callback#token=${encodeURIComponent(token)}`);
  } catch (err) {
    const message = err.response?.data?.error_description || err.message || "Google sign-in failed";
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(message)}`);
  }
});

module.exports = router;
