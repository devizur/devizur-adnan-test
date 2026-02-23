"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

const WELCOME_DIALOG_SEEN_KEY = "welcome-dialog-seen";

export function WelcomeDialog() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // const seen = localStorage.getItem(WELCOME_DIALOG_SEEN_KEY);
    // if (!seen)
     setOpen(true);
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setOpen(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(WELCOME_DIALOG_SEEN_KEY, "true");
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        className="min-w-[90%] max-w-md bg-[#161616] p-0 gap-0 text-white border border-gray-800/80 rounded-2xl overflow-hidden"
      >
        <AlertDialogHeader className="px-6 pt-5 pb-4 border-b border-gray-800/80">
          <div className="flex items-center justify-between w-full">
            <AlertDialogTitle className="text-lg font-semibold text-white">
              Welcome
            </AlertDialogTitle>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="min-h-11 min-w-11 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1e1e1e] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </AlertDialogHeader>
        <div className="px-6 py-6 text-center">
          <p className="text-gray-300 text-4xl">Thanks for visiting. Enjoy your booking experience.</p>
        </div>
        <AlertDialogFooter className="px-6 py-4 border-t border-gray-800/80 bg-[#161616]">
          <AlertDialogCancel
            onClick={() => handleOpenChange(false)}
            className="m-0 min-h-11 px-4 border border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800/80 hover:border-primary-1/40 hover:text-white rounded-xl cursor-pointer transition-colors focus-visible:ring-primary-1/50"
          >
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
