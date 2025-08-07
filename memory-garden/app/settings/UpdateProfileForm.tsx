"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import Link from "next/link";

interface UpdateProfileFormProps {
  userProfile: UserProfile;
}

export default function UpdateProfileForm({ userProfile }: UpdateProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      setIsSubmitting(true);
      const response = await fetch("/api/profile/delete", {
        method: "POST",
      });

      if (response.ok) {
        // On successful deletion, NextAuth session is cleared on the server.
        // We need to force a client-side sign out to clear the local session and redirect.
        window.location.href = "/auth/signin";
      } else {
        console.error("Failed to delete account");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ← Back to Home
        </Link>
      </div>
      <div>
        <button
          onClick={handleDeleteAccount}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}