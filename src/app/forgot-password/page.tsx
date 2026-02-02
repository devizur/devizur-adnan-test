"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForgotPassword } from "@/lib/api/hooks";
import { useState, FormEvent } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const forgotPasswordMutation = useForgotPassword();

    const handleForgotPassword = async (e: FormEvent) => {
        e.preventDefault();
        
        try {
            await forgotPasswordMutation.mutateAsync({ email });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Forgot password failed:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 min-h-screen w-full overflow-y-auto bg-[#121212] text-white flex items-center justify-center p-4">
          
            <div className="pointer-events-none absolute left-[20%] top-[-5%] size-40 rounded-full bg-gradient-to-br from-[#d4d428] to-[#9e9e16] shadow-[0_0_40px_rgba(255,255,0,0.3)] opacity-90 blur-sm" />
            <div className="pointer-events-none absolute right-[20%] top-[10%] size-24 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-80" />

           
            <div className="z-10 w-full max-w-md space-y-8">
                {!isSubmitted ? (
                    <>
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                Forgot Password?
                            </h1>
                            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                                No worries! Enter your email address and we&apos;ll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <Input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
                            />
                            
                            {forgotPasswordMutation.isError && (
                                <p className="text-sm text-red-500">
                                    {forgotPasswordMutation.error?.message || "Failed to send reset email. Please try again."}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={forgotPasswordMutation.isPending}
                                className="w-full h-12 rounded-lg bg-primary-1 text-black font-bold hover:bg-primary-1-hover hover:shadow-[0_0_20px_rgba(255,236,0,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </form>

                        <div className="text-center text-sm">
                            <Link
                                href="/sign-in"
                                className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="m12 19-7-7 7-7" />
                                    <path d="M19 12H5" />
                                </svg>
                                Back to Sign In
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary-1/10 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#FFEC00"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                                    <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
                                </svg>
                            </div>
                            
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Check Your Email
                            </h1>
                            
                            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                                We&apos;ve sent a password reset link to
                            </p>
                            
                            <p className="text-base text-white font-medium">
                                {email}
                            </p>
                            
                            <p className="text-sm text-zinc-500 max-w-sm mx-auto pt-2">
                                Please check your inbox and click the link to reset your password. The link will expire in 24 hours.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Link href="/sign-in">
                                <Button className="w-full h-12 rounded-lg bg-primary-1 text-black font-bold hover:bg-primary-1-hover hover:shadow-[0_0_20px_rgba(255,236,0,0.3)] transition-all duration-300">
                                    Back to Sign In
                                </Button>
                            </Link>
                            
                            <div className="text-center text-sm mt-3">
                                <span className="text-zinc-400">
                                    Didn&apos;t receive the email?{" "}
                                </span>
                                <button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        forgotPasswordMutation.reset();
                                    }}
                                    className="text-white hover:underline decoration-zinc-500 underline-offset-4 font-medium"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
