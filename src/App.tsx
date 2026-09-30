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
import { Footer } from "./sections/Footer";

export default function App() {
  return (
    <>
      <a
        href="#overview"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[var(--fiber)] focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <Header />
      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        <Hero />
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
        <Timeline />
      </main>
      <Footer />
    </>
  );
}
