"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Pizza, BadgeCheck } from "lucide-react";

// shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function VerifyOtpPage() {
  // Hide navbar on this page
  useEffect(() => {
    document.body.classList.add("hide-navbar");
    return () => document.body.classList.remove("hide-navbar");
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ dialog state
  const [successOpen, setSuccessOpen] = useState(false);

  // ✅ resend cooldown (seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const e = searchParams.get("email") || "";
    setEmail(e);
  }, [searchParams]);

  // ✅ countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const t = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // ✅ Verified successfully -> open dialog (instead of alert)
      setLoading(false);
      setSuccessOpen(true);
    } catch (err) {
      setError("Something went wrong: " + err.message);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // prevent resend during cooldown
    if (resendCooldown > 0) return;

    setError("");
    setInfo("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setInfo("OTP sent again! Please check your email.");

      // ✅ start 60s cooldown AFTER successful resend
      setResendCooldown(60);

      setLoading(false);
    } catch (err) {
      setError("Something went wrong: " + err.message);
      setLoading(false);
    }
  };

  const goDashboard = () => router.push("/dashboard");

  const resendLabel =
    resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP";

  return (
    <>
      {/* ✅ Success Dialog */}
      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          setSuccessOpen(open);
          // If user closed it (X / outside click / ESC) → redirect to login
          if (!open) router.push("/auth/login");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                <BadgeCheck className="h-5 w-5 text-green-600" />
              </span>
              Email verified 🎉
            </DialogTitle>
            <DialogDescription className="mt-2">
              Your email has been verified successfully.
              <br />
              Welcome to QR Menu System!
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSuccessOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-primary hover:bg-green-600"
              onClick={goDashboard}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MOBILE wrapper */}
      <div className="md:hidden min-h-screen bg-white flex items-center justify-center px-0">
        <div className="w-full min-h-screen p-8 flex flex-col justify-center">
          <div className="flex items-center justify-center flex-col mb-6">
            <div className="text-5xl mb-2">
              <Pizza size={48} color="#00c951" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verify Email
            </h1>
            <p className="text-gray-600 text-center">
              Enter the OTP code we sent to your email
            </p>
          </div>

          <form onSubmit={handleVerify}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* OTP */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Error / Info */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {info}
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            {/* Resend Button with cooldown */}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || !email || resendCooldown > 0}
              className="w-full mt-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : resendLabel}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm mb-3 mr-1">
              Already verified?
            </span>
            <Link href="/auth/login" className="text-green-600">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* DESKTOP wrapper (green gradient bg) */}
      <div className="hidden md:flex min-h-screen bg-gradient-to-br from-green-50 to-green-100 items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center flex-col mb-6">
            <div className="text-5xl mb-2">
              <Pizza size={48} color="#00c951" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verify Email
            </h1>
            <p className="text-gray-600 text-center">
              Enter the OTP code we sent to your email
            </p>
          </div>

          <form onSubmit={handleVerify}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* OTP */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Error / Info */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {info}
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            {/* Resend Button with cooldown */}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || !email || resendCooldown > 0}
              className="w-full mt-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : resendLabel}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm mb-3 mr-1">
              Already verified?
            </span>
            <Link href="/auth/login" className="text-green-600">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
