import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://details-beta.vercel.app";

  const supabase = await createClient();
  const { data } = await supabase
    .from("teachers")
    .select("slug, created_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Array<{ slug: string; created_at: string }>;

  const teacherUrls: MetadataRoute.Sitemap = rows.map((t) => ({
    url:              `${appUrl}/teacher/${t.slug}`,
    lastModified:     new Date(t.created_at),
    changeFrequency:  "weekly",
    priority:         0.8,
  }));

  return [
    { url: appUrl,                      lastModified: new Date(), changeFrequency: "daily",  priority: 1   },
    { url: `${appUrl}/teachers`,        lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
    { url: `${appUrl}/hall-of-fame`,    lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...teacherUrls,
  ];
}
