import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // Initialize Supabase Server Client with Cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component or API route.
            }
          },
        },
      }
    );

    // Verify authenticated user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { userId, total, items, stripeSessionId } = body;

    const targetUserId = user?.id || userId;

    if (!targetUserId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order data or unauthenticated user" },
        { status: 400 }
      );
    }

    if (stripeSessionId) {
      const { data: existingOrder, error: lookupError } = await supabase
        .from("orders")
        .select("*")
        .eq("stripe_session_id", stripeSessionId)
        .maybeSingle();

      if (lookupError) {
        console.error("Order deduplication lookup failed:", lookupError.message);
        return NextResponse.json({ error: lookupError.message }, { status: 500 });
      }

      if (existingOrder) {
        return NextResponse.json({ success: true, order: existingOrder, existing: true });
      }
    }

    // Insert order securely into database
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: targetUserId,
        total: total,
        status: "PAID",
        items: items,
        ...(stripeSessionId ? { stripe_session_id: stripeSessionId } : {}),
      })
      .select();

    if (error) {
      if (error.code === "23505" && stripeSessionId) {
        const { data: existingOrder, error: duplicateLookupError } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_session_id", stripeSessionId)
          .maybeSingle();

        if (!duplicateLookupError && existingOrder) {
          return NextResponse.json({ success: true, order: existingOrder, existing: true });
        }

        console.error(
          "Duplicate order detected, but existing order lookup failed:",
          duplicateLookupError?.message || "Existing order was not found"
        );
      }

      console.error("🔴 Server Order Insert Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}