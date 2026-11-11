import { Header, Footer } from "@/components/ui";
import Playground from "@/components/playground";
import ProofSection from "@/components/proof-section";
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Playground />
        <ProofSection />
      </main>
      <Footer />
    </>
  );
}
