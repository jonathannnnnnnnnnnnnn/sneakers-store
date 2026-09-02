import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request) {
  try {
    const { targetUserId, newRole } = await req.json();

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: "Missing targetUserId or newRole" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Call SECURITY DEFINER RPC function to bypass RLS
    const { error: rpcError } = await supabaseAdmin.rpc("set_user_role", {
      target_user_id: targetUserId,
      new_role: newRole,
    });

    if (rpcError) {
      throw new Error(`RPC error: ${rpcError.message}`);
    }

    // 2. Sync auth metadata
    await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      user_metadata: { role: newRole },
    });

    return NextResponse.json({ success: true, role: newRole });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update role" },
      { status: 500 }
    );
  }
}