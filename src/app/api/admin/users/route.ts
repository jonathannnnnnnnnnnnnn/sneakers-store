import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing env variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 500 }
      );
    }

    // Explicitly validate URL format before passing to client
    const isValidUrl = supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://");
    if (!isValidUrl) {
      return NextResponse.json(
        { error: `Invalid SUPABASE_URL format: ${supabaseUrl}` },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw new Error(authError.message);

    const { data: profileData } = await supabaseAdmin.from("profiles").select("*");
    const profileMap = new Map((profileData || []).map((p) => [p.id, p]));

    const users = (authData?.users || []).map((user) => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id,
        email: user.email || "No email",
        full_name: profile?.full_name || user.user_metadata?.full_name || "N/A",
        role: profile?.role || user.user_metadata?.role || "user",
        created_at: user.created_at,
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}