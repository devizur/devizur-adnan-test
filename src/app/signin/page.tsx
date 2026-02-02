import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function SignInPage() {
    return (
        <div className="fixed inset-0 z-50 min-h-screen w-full overflow-y-auto bg-[#121212] text-white flex items-center justify-center p-4">
            {/* Background Spheres */}
            <div className="pointer-events-none absolute left-[20%] top-[-5%] size-40 rounded-full bg-gradient-to-br from-[#d4d428] to-[#9e9e16] shadow-[0_0_40px_rgba(255,255,0,0.3)] opacity-90 blur-sm" />
            <div className="pointer-events-none absolute right-[20%] top-[10%] size-24 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-80" />

            {/* Main Container */}
            <div className="z-10 w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Sign In.
                    </h1>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="w-full h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] text-zinc-200 hover:bg-[#252525] hover:text-white transition-all duration-300"
                    >
                        <FcGoogle className="size-5 mr-2" />
                        Continue with Google
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] text-zinc-200 hover:bg-[#252525] hover:text-white transition-all duration-300"
                    >
                        <FaFacebook className="size-5 mr-2 text-[#1877F2]" />
                        Continue with Facebook
                    </Button>
                </div>

                <div className="relative flex items-center justify-center">
                    <span className="text-xs text-zinc-500 uppercase">or</span>
                </div>

                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder="E-mail Phone Number"
                        className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        className="h-12 rounded-lg border-zinc-800 bg-[#1a1a1a] px-4 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
                    />
                </div>

                <Button
                    className="w-full h-12 rounded-lg bg-[#FFEC00] text-black font-bold hover:bg-[#E6D500] hover:shadow-[0_0_20px_rgba(255,236,0,0.3)] transition-all duration-300"
                >
                    Sign In.
                </Button>

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
