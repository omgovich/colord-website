import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://colord.dev", changeFrequency: "monthly", priority: 1 },
    {
      url: "https://colord.dev/index.md",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://colord.dev/docs/api.md",
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
