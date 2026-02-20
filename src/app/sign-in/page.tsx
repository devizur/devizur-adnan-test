"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRequestOtp, useVerifyOtp } from "@/lib/api/hooks";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";

type Step = "email" | "otp";

export default function SignInPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const router = useRouter();
    const dispatch = useAppDispatch();

    const requestOtpMutation = useRequestOtp();
    const verifyOtpMutation = useVerifyOtp();

    const handleSendOtp = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await requestOtpMutation.mutateAsync({ email: email.trim() });
            setStep("otp");
            setOtp("");
        } catch (error) {
            console.error("Send OTP failed:", error);
        }
    };

    const handleVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await verifyOtpMutation.mutateAsync({
                email: email.trim(),
                otp: otp.trim(),
            });
            dispatch(setCredentials({ token: result.token, user: result.user }));
            router.push("/");
        } catch (error) {
            console.error("Verify OTP failed:", error);
        }
    };

    const backToEmail = () => {
        setStep("email");
        setOtp("");
        requestOtpMutation.reset();
        verifyOtpMutation.reset();
    };

    const errorMessage =
        requestOtpMutation.error?.message ||
        verifyOtpMutation.error?.message;

    return (
        <div className="fixed inset-0 z-50 min-h-screen w-full overflow-y-auto bg-[#121212] text-white flex items-center justify-center p-4">
            <div className="pointer-events-none absolute left-[20%] top-[-5%] size-40 rounded-full bg-gradient-to-br from-[#d4d428] to-[#9e9e16] shadow-[0_0_40px_rgba(255,255,0,0.3)] opacity-90 blur-sm" />
            <div className="pointer-events-none absolute right-[20%] top-[10%] size-24 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-80" />

            <div className="z-10 w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Sign In.
                    </h1>
                    <p className="text-sm text-zinc-400">
                        {step === "email"
                            ? "Enter your email and we’ll send you a one-time code."
                            : `We sent a code to ${email}. Enter it below.`}
                    </p>
                </div>

                {step === "email" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
                        />
                        {errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={requestOtpMutation.isPending}
                            variant="primary"
                            className="w-full h-12 rounded-lg"
                        >
                            {requestOtpMutation.isPending ? "Sending code…" : "Send OTP"}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <Input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6}
                            className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 text-center text-lg tracking-widest"
                        />
                        {errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={verifyOtpMutation.isPending || otp.length < 4}
                            variant="primary"
                            className="w-full h-12 rounded-lg"
                        >
                            {verifyOtpMutation.isPending ? "Verifying…" : "Verify & Sign In"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={backToEmail}
                            className="w-full h-11 rounded-lg text-zinc-400 hover:text-white"
                        >
                            Use a different email
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
