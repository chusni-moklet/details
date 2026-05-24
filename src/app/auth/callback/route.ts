import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSchoolEmail, slugify } from "@/lib/utils";
import type { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get("code");
  const next     = searchParams.get("next") ?? "/dashboard";
  const oauthErr = searchParams.get("error");

  if (oauthErr) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(oauthErr)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  // Collect cookies to set
  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach((c) => cookiesToSet.push(c));
        },
      },
    }
  );

  const { data, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !data.user) {
    console.error("[callback] session error:", sessionError?.message);
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
  }

  const email = data.user.email ?? "";
  console.log("[callback] email:", email, "cookies to set:", cookiesToSet.length);

  if (!isSchoolEmail(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/login?error=access_denied`);
  }

  // Upsert user + teacher
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!existingUser) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("users").insert({
      id: data.user.id, email, role: "teacher",
    });

    const fullName =
      (data.user.user_metadata?.full_name as string | undefined) ??
      email.split("@")[0];
    const baseSlug = slugify(fullName);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: ex } = await supabase
        .from("teachers").select("id").eq("slug", slug).single();
      if (!ex) break;
      slug = `${baseSlug}-${counter++}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("teachers").insert({
      user_id:   data.user.id,
      slug,
      full_name: fullName,
      photo_url: (data.user.user_metadata?.avatar_url as string | undefined) ?? null,
    });
  }

  // Build redirect response and attach ALL session cookies
  const response = NextResponse.redirect(`${origin}${next}`);

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...(options as Parameters<typeof response.cookies.set>[2]),
      // Force these settings for localhost compatibility
      httpOnly: true,
      sameSite: "lax",
      secure: false,   // false for localhost (http)
      path: "/",
    });
  });

  console.log("[callback] set", cookiesToSet.length, "cookies → redirect to", next);
  return response;
}
