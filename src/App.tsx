import { Header } from "./components/Header";
import { Hero } from "./sections/Hero";
import { Overview } from "./sections/Overview";
import { Connections } from "./sections/Connections";
import { LagMacsec } from "./sections/LagMacsec";
import { Vifs } from "./sections/Vifs";
import { Gateway } from "./sections/Gateway";
import { Routing } from "./sections/Routing";
import { Resiliency } from "./sections/Resiliency";
import { Security } from "./sections/Security";
import { Operations } from "./sections/Operations";
import { Pricing } from "./sections/Pricing";
import { Patterns } from "./sections/Patterns";
import { Timeline } from "./sections/Timeline";
import { WhyHard } from "./sections/WhyHard";
import { Myths } from "./sections/Myths";
import { Glossary } from "./sections/Glossary";
import { Footer } from "./sections/Footer";

export default function App() {
  return (
    <>
      <a
        href="#why"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-[var(--fiber)] focus:px-4 focus:py-2 focus:text-[var(--on-accent)]"
      >
        Skip to content
      </a>
      <Header />
      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        <Hero />
        <div className="relative">
          {/* The fibre Hikari travels along; every section is a stop on it. */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[1.05rem] w-1 rounded-full bg-[repeating-linear-gradient(to_bottom,var(--fiber)_0_14px,transparent_14px_24px)] opacity-60 sm:left-[1.3rem]"
          />
          <WhyHard />
          <Overview />
          <Connections />
          <LagMacsec />
          <Vifs />
          <Gateway />
          <Routing />
          <Resiliency />
          <Security />
          <Operations />
          <Pricing />
          <Patterns />
          <Myths />
          <Timeline />
          <Glossary />
        </div>
      </main>
      <Footer />
    </>
  );
}
