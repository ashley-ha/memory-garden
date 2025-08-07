
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { UserProfile } from "@/lib/types";
import UpdateProfileForm from "./UpdateProfileForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const supabase = await createClient();
  let { data: userProfile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  // If profile doesn't exist, create one
  if (error && error.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: session.user.id,
        username: session.user.name || `user_${session.user.id.slice(0, 8)}`,
        email: session.user.email,
        image_url: session.user.image
      })
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating user profile:", createError);
    } else {
      userProfile = newProfile;
    }
  } else if (error) {
    console.error("Error fetching user profile:", error);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {userProfile ? (
        <UpdateProfileForm userProfile={userProfile} />
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
