
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

  const formData = await req.formData();
  const file = formData.get("profile-picture") as File;

  if (!file) {
    return new NextResponse(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createClient();
  
  const filePath = `public/${session.user.id}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    // If storage bucket doesn't exist, provide helpful message
    if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
      return new NextResponse(JSON.stringify({ 
        error: "Storage bucket not configured. Please create an 'avatars' bucket in Supabase Storage." 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new NextResponse(JSON.stringify({ error: `Failed to upload avatar: ${uploadError.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ image_url: publicUrlData.publicUrl })
    .eq("user_id", session.user.id);

  if (updateError) {
    console.error("Error updating profile:", updateError);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update profile" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return NextResponse.json({ success: true, image_url: publicUrlData.publicUrl });
}
