import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || "https://worknest.dev";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/jobs", "/terms", "/privacy", "/cookie-policy"],
      disallow: [
        "/admin/",
        "/client/",
        "/freelancer/",
        "/contracts/",
        "/messages/",
        "/notifications/",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
