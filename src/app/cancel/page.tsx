import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CancelPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-xl font-semibold text-white mb-2">Payment cancelled</h1>
      <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-6">
        No charge was made. You can return to your cart and try again when you’re ready.
      </p>
      <Button asChild variant="outline" className="border-gray-700 text-gray-200 rounded-xl min-h-11">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
