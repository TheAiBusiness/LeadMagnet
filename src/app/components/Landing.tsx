import { useRef, useEffect } from "react";
import { useLocation } from "react-router";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Benefits } from "./Benefits";
import { Process } from "./Process";
import { FAQ } from "./FAQ";
import { Contact } from "./Contact";
import { Legal } from "./Legal";
import { Footer } from "./Footer";
import { MobileBottomCTA } from "./MobileBottomCTA";
import { WhatsAppButton } from "./WhatsAppButton";

export function Landing() {
  const processRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const scrollToProcess = () => {
    processRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <Header />
      <Hero onProcessClick={scrollToProcess} />
      <Benefits />
      <div ref={processRef}>
        <Process id="casos" />
      </div>
      <FAQ />
      <Contact />
      <Legal />
      <Footer />
      <MobileBottomCTA />
      <WhatsAppButton />
      <div className="h-20 md:h-0" />
    </div>
  );
}
