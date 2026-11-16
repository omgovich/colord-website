import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value:
              '</index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"',
          },
        ],
      },
      ...["/index.md", "/llms.txt", "/docs/api.md"].map(
        (source) => ({
          source,
          headers: [
            { key: "Link", value: '</llms.txt>; rel="describedby"' },
            {
              key: "Content-Type",
              value: source.endsWith(".md")
                ? "text/markdown; charset=utf-8"
                : "text/plain; charset=utf-8",
            },
          ],
        }),
      ),
    ];
  },
};
export default nextConfig;
