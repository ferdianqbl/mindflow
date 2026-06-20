import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // If next is specified, redirect there, otherwise redirect to home dashboard
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Exchange the verification code for a session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    console.error("Auth callback session exchange error:", error.message);
  }

  // Redirect to login with error info if exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth-code-exchange-failed`);
}
