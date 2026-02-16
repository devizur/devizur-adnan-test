"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useSignUp, useOAuthSignIn } from "@/lib/api/hooks";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const signUpMutation = useSignUp();
    const oauthSignInMutation = useOAuthSignIn();

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();
        
        try {
            const result = await signUpMutation.mutateAsync({
                name,
                email,
                password,
                confirmPassword,
            });
            
            // Store token in localStorage
            localStorage.setItem("authToken", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            // Also store in Redux
            dispatch(setCredentials({ token: result.token, user: result.user }));
            
            // Redirect to home page or dashboard
            router.push("/");
        } catch (error) {
            console.error("Sign up failed:", error);
        }
    };

    const handleOAuthSignIn = async (provider: "google" | "facebook") => {
        try {
            const result = await oauthSignInMutation.mutateAsync(provider);
            
            // Store token in localStorage
            localStorage.setItem("authToken", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            // Also store in Redux
            dispatch(setCredentials({ token: result.token, user: result.user }));
            
            // Redirect to home page or dashboard
            router.push("/");
        } catch (error) {
            console.error(`${provider} sign up failed:`, error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 min-h-screen w-full overflow-y-auto bg-[#121212] text-white flex items-center justify-center p-4">
          
            <div className="pointer-events-none absolute left-[20%] top-[-5%] size-40 rounded-full bg-gradient-to-br from-[#d4d428] to-[#9e9e16] shadow-[0_0_40px_rgba(255,255,0,0.3)] opacity-90 blur-sm" />
            <div className="pointer-events-none absolute right-[20%] top-[10%] size-24 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-80" />

           
            <div className="z-10 w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Sign Up.
                    </h1>
                    <p className="text-sm text-zinc-400">
                        Create your account to get started
                    </p>
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
                        {oauthSignInMutation.isPending ? "Signing up..." : "Continue with Google"}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => handleOAuthSignIn("facebook")}
                        disabled={oauthSignInMutation.isPending}
                        variant="outline"
                        className="w-full h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] text-zinc-200 hover:bg-[#252525] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFacebook className="size-5 mr-2 text-[#1877F2]" />
                        {oauthSignInMutation.isPending ? "Signing up..." : "Continue with Facebook"}
                    </Button>
                </div>

                <div className="relative flex items-center justify-center">
                    <span className="text-xs text-zinc-500 uppercase">or</span>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
                    />
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
                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
                    />
                    
                    {(signUpMutation.isError || oauthSignInMutation.isError) && (
                        <p className="text-sm text-red-500">
                            {signUpMutation.error?.message || oauthSignInMutation.error?.message || "Sign up failed. Please try again."}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={signUpMutation.isPending}
                        variant="primary"
                        className="w-full h-12 rounded-lg"
                    >
                        {signUpMutation.isPending ? "Creating Account..." : "Sign Up."}
                    </Button>
                </form>

                <div className="space-y-4 text-center text-sm">
                    <div className="text-zinc-400">
                        Already have an account?{" "}
                        <Link
                            href="/sign-in"
                            className="font-medium text-white hover:underline decoration-zinc-500 underline-offset-4"
                        >
                            Sign In
                        </Link>
                    </div>
                    <div className="text-xs text-zinc-500 max-w-sm mx-auto">
                        By signing up, you agree to our{" "}
                        <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors underline">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
