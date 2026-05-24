import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://details-beta.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/teachers", "/teacher/", "/hall-of-fame"],
        disallow: ["/dashboard", "/admin", "/api/", "/auth/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
