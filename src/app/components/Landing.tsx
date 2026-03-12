import { useRef } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Benefits } from "./Benefits";
import { Process } from "./Process";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";
import { MobileBottomCTA } from "./MobileBottomCTA";

export function Landing() {
  const processRef = useRef<HTMLDivElement>(null);

  const scrollToProcess = () => {
    processRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <Header />
      <Hero onProcessClick={scrollToProcess} />
      <Benefits />
      <div ref={processRef}>
        <Process id="casos" />
      </div>
      <FAQ />
      <Footer />
      <MobileBottomCTA />
      <div className="h-20 md:h-0" />
    </div>
  );
}
