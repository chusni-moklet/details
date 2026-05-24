import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Skip all auth routes
  if (pathname.startsWith("/auth/")) {
    return supabaseResponse;
  }

  // Admin-only check (only block if definitely no user)
  if (pathname.startsWith("/admin") && user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (userData as { role: string } | null)?.role;
    if (!role || !["super_admin", "admin_jurusan"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // For dashboard: only redirect if there are NO sb- cookies at all
  // (avoids race condition where getUser() fails but cookies exist)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const hasSbCookie = request.cookies.getAll().some(
      (c) => c.name.startsWith("sb-") && c.name.includes("auth-token")
    );

    if (!user && !hasSbCookie) {
      // Definitely not logged in — no cookies at all
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    // Has cookies but getUser() failed — let the page handle it
    // This avoids the race condition after OAuth callback
    if (!user && hasSbCookie) {
      console.log("[proxy] has sb cookie but getUser failed, letting page handle:", pathname);
      return supabaseResponse;
    }
  }

  return supabaseResponse;
}
