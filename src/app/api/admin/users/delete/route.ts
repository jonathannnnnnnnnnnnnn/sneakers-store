import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(request: Request) {
  try {
    const supabaseServer = await createClient();

    // 1. Verify caller is an authenticated admin
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: requesterProfile } = await supabaseServer
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (requesterProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. Parse target user ID
    const { targetUserId } = await request.json();

    // Protect against self-deletion
    if (targetUserId === user.id) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 3. Delete from public.profiles
    await adminSupabase.from("profiles").delete().eq("id", targetUserId);

    // 4. Completely delete user from auth.users system table
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(targetUserId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}