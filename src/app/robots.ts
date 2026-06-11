import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/dashboard",
        "/login",
        "/performance",
        "/pricing",
        "/register",
        "/signals",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
