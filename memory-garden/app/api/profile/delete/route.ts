
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createClient();
  
  // First, delete the user's profile from the 'user_profiles' table
  const { error: deleteProfileError } = await supabase
    .from("user_profiles")
    .delete()
    .eq("user_id", session.user.id);

  if (deleteProfileError) {
    console.error("Error deleting user profile:", deleteProfileError);
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete user data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Note: With NextAuth, we don't need to handle Supabase auth signout
  // The client will handle NextAuth signOut

  return NextResponse.json({ success: true });
}
