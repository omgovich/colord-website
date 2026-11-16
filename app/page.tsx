import { Header, Footer } from "@/components/ui";
import Playground from "@/components/playground";
import ProofSection from "@/components/proof-section";
import { SiteEntrance } from "@/components/site-entrance";

const software = {
  "@context": "https://schema.org",
  "@type": ["SoftwareSourceCode", "SoftwareApplication"],
  "@id": "https://colord.dev/#software",
  name: "colord",
  url: "https://colord.dev/",
  description:
    "A tiny, fast, zero-dependency JavaScript library for color manipulation and conversion. Immutable API, TypeScript types and opt-in plugins. 1.8 kB Brotli-compressed core.",
  codeRepository: "https://github.com/omgovich/colord",
  downloadUrl: "https://www.npmjs.com/package/colord",
  programmingLanguage: ["JavaScript", "TypeScript"],
  runtimePlatform: "Browsers and Node.js",
  operatingSystem: "Cross-platform",
  applicationCategory: "DeveloperApplication",
  license: "https://github.com/omgovich/colord/blob/master/LICENSE.md",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  softwareHelp: {
    "@type": "TechArticle",
    url: "https://colord.dev/docs/api.md",
    name: "colord API reference",
  },
  sameAs: [
    "https://github.com/omgovich/colord",
    "https://www.npmjs.com/package/colord",
  ],
};

export default function Home() {
  return (
    <SiteEntrance>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(software).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main>
        <Playground />
        <ProofSection />
      </main>
      <Footer />
    </SiteEntrance>
  );
}
