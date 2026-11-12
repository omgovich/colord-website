import { Header, Footer } from "@/components/ui";
import Playground from "@/components/playground";
import ProofSection from "@/components/proof-section";
import { SiteEntrance } from "@/components/site-entrance";
export default function Home() {
  return (
    <SiteEntrance>
      <Header />
      <main>
        <Playground />
        <ProofSection />
      </main>
      <Footer />
    </SiteEntrance>
  );
}
