import type { Metadata } from "next";
import SceneLight from "@/components/scene-light";
import "@fontsource-variable/manrope";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "./globals.css";
import "../components/site-shell.css";
import "../components/scene-light.css";
import "../components/site-entrance.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://colord.dev"),
  applicationName: "colord",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
  title: "colord — Powerful color tools. Ridiculously small.",
  description:
    "A tiny, fast, dependency-free JavaScript library for color manipulation and conversion. Explore colors, build palettes, and ship less JavaScript.",
  openGraph: {
    siteName: "colord",
    title: "colord — Powerful color tools. Ridiculously small.",
    description:
      "A tiny yet powerful JavaScript library for color manipulations and conversions. 1.8 kB. Zero dependencies.",
    type: "website",
    url: "https://colord.dev",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "colord — Powerful color tools. Ridiculously small. 1.8 kB · Zero dependencies.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/og.png",
        alt: "colord — Powerful color tools. Ridiculously small. 1.8 kB · Zero dependencies.",
      },
    ],
  },
  alternates: { canonical: "https://colord.dev" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SceneLight />
      </body>
    </html>
  );
}
