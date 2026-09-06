import { createClient } from "@/lib/supabase/client"; // adjust to your supabase client path

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  // Check metadata role OR fall back to hardcoded admin email
  const isRoleAdmin = user.user_metadata?.role === "admin";
  const isAdminEmail = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return isRoleAdmin || isAdminEmail;
}