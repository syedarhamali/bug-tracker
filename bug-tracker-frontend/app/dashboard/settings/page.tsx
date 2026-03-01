"use client";

import { useEffect, useState } from "react";
import { authApi, type User } from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const u = await authApi.me();
        setUser(u);
        setFirstName(u.firstName ?? "");
        setLastName(u.lastName ?? "");
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const updated = await authApi.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      setUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("bug_tracker_user", JSON.stringify(updated));
      }
      setProfileMsg({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setProfileMsg({ type: "err", text: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "err", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "err", text: "New password must be at least 6 characters" });
      return;
    }
    setPasswordSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: "ok", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ type: "err", text: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <p className="text-slate-600 dark:text-slate-400">Could not load your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Profile
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update your name. Email cannot be changed here.
          </p>
        </div>
        <form onSubmit={handleProfileSubmit} className="p-6">
          {profileMsg && (
            <div
              className={`mb-4 rounded-xl px-4 py-3 text-sm ${profileMsg.type === "ok" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}
            >
              {profileMsg.text}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className={inputClass + " cursor-not-allowed opacity-70"}
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Email is set by your sign-in method and cannot be edited here.
            </p>
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="btn-primary mt-6"
          >
            {profileSaving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Password
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {user.hasPassword
              ? "Change your password. You'll need your current password."
              : "You sign in with Google. Password sign-in is not available for this account."}
          </p>
        </div>
        <div className="p-6">
          {user.hasPassword ? (
            <form onSubmit={handlePasswordSubmit}>
              {passwordMsg && (
                <div
                  className={`mb-4 rounded-xl px-4 py-3 text-sm ${passwordMsg.type === "ok" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}
                >
                  {passwordMsg.text}
                </div>
              )}
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={passwordSaving}
                className="btn-primary mt-6"
              >
                {passwordSaving ? "Updating…" : "Change password"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              To use email and password sign-in, you would need to create a new account with email on the sign-up page.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
