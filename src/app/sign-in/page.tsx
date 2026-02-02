"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useSignIn, useOAuthSignIn } from "@/lib/api/hooks";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    
    const signInMutation = useSignIn();
    const oauthSignInMutation = useOAuthSignIn();

    const handleSignIn = async (e: FormEvent) => {
        e.preventDefault();
        
        try {
            const result = await signInMutation.mutateAsync({
                email,
                password,
            });
            
            // Store token in localStorage
            localStorage.setItem("authToken", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            
            // Redirect to home page or dashboard
            router.push("/");
        } catch (error) {
            console.error("Sign in failed:", error);
        }
    };

    const handleOAuthSignIn = async (provider: "google" | "facebook") => {
        try {
            const result = await oauthSignInMutation.mutateAsync(provider);
            
            // Store token in localStorage
            localStorage.setItem("authToken", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            
            // Redirect to home page or dashboard
            router.push("/");
        } catch (error) {
            console.error(`${provider} sign in failed:`, error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 min-h-screen w-full overflow-y-auto bg-[#121212] text-white flex items-center justify-center p-4">
          
            <div className="pointer-events-none absolute left-[20%] top-[-5%] size-40 rounded-full bg-gradient-to-br from-[#d4d428] to-[#9e9e16] shadow-[0_0_40px_rgba(255,255,0,0.3)] opacity-90 blur-sm" />
            <div className="pointer-events-none absolute right-[20%] top-[10%] size-24 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-80" />

           
            <div className="z-10 w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Sign In.
                    </h1>
                </div>

                <div className="space-y-4">
                    <Button
                        type="button"
                        onClick={() => handleOAuthSignIn("google")}
                        disabled={oauthSignInMutation.isPending}
                        variant="outline"
                        className="w-full h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] text-zinc-200 hover:bg-[#252525] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FcGoogle className="size-5 mr-2" />
                        {oauthSignInMutation.isPending ? "Signing in..." : "Continue with Google"}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => handleOAuthSignIn("facebook")}
                        disabled={oauthSignInMutation.isPending}
                        variant="outline"
                        className="w-full h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] text-zinc-200 hover:bg-[#252525] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFacebook className="size-5 mr-2 text-[#1877F2]" />
                        {oauthSignInMutation.isPending ? "Signing in..." : "Continue with Facebook"}
                    </Button>
                </div>

                <div className="relative flex items-center justify-center">
                    <span className="text-xs text-zinc-500 uppercase">or</span>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
                    />
                    
                    {(signInMutation.isError || oauthSignInMutation.isError) && (
                        <p className="text-sm text-red-500">
                            {signInMutation.error?.message || oauthSignInMutation.error?.message || "Sign in failed. Please try again."}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={signInMutation.isPending}
                        variant="primary"
                        className="w-full h-12 rounded-lg"
                    >
                        {signInMutation.isPending ? "Signing In..." : "Sign In."}
                    </Button>
                </form>

                <div className="space-y-4 text-center text-sm">
                    <div className="text-zinc-400">
                        don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-medium text-white hover:underline decoration-zinc-500 underline-offset-4"
                        >
                            Create a account
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/forgot-password"
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
