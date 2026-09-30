import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { LangProvider } from "./i18n/LangContext";
import { NAV } from "./content/nav";
import { EVENTS } from "./content/timeline";
import { GLOSSARY, GLOSSARY_BY_ID } from "./content/glossary";
import { MYTHS } from "./content/myths";
import { TRAPS } from "./content/traps";

const renderApp = (initial?: "en" | "ja") =>
  render(
    <LangProvider initial={initial}>
      <App />
    </LangProvider>,
  );

describe("App", () => {
  it("renders every section the nav links to", () => {
    const { container } = renderApp();
    for (const n of NAV)
      expect(container.querySelector(`section#${n.id}`)).not.toBeNull();
  });

  it("defaults to English and switches to Japanese", async () => {
    renderApp();
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Follow one photon/,
    );
    await userEvent.click(screen.getByRole("button", { name: "日本語" }));
    expect(document.documentElement.lang).toBe("ja");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("光の粒");
    expect(localStorage.getItem("cross-connect:lang")).toBe("ja");
  });

  it("the BGP lab reacts to a failed path", async () => {
    renderApp();
    const lab = screen.getByRole("heading", {
      name: /Path selection lab/,
    }).parentElement!;
    // Active/active by default: both DX paths win.
    const winner = () => within(lab).getByText(/^Traffic goes via/).textContent;
    expect(winner()).toBe("Traffic goes via: DX-A + DX-B");
    const [dxA, dxB] = within(lab).getAllByRole("checkbox", { name: "up" });
    await userEvent.click(dxA);
    expect(winner()).toBe("Traffic goes via: DX-B");
    // Both DX paths gone: the VPN takes over.
    await userEvent.click(dxB);
    expect(winner()).toBe("Traffic goes via: VPN");
  });

  it("has both languages for every timeline entry", () => {
    for (const e of EVENTS) {
      expect(e.text.en.length).toBeGreaterThan(0);
      expect(e.text.ja.length).toBeGreaterThan(0);
    }
  });

  it("glossary entries are complete and cross-links resolve", () => {
    const ids = new Set(NAV.map((n) => n.id));
    for (const e of GLOSSARY) {
      expect(e.def.en && e.def.ja && e.en && e.ja).toBeTruthy();
      expect(ids.has(e.see)).toBe(true);
      if (e.notTo) expect(GLOSSARY_BY_ID[e.notTo.id]).toBeDefined();
    }
    for (const x of TRAPS) expect(ids.has(x.stop)).toBe(true);
  });

  it("a glossary term opens and closes with Escape", async () => {
    renderApp();
    const why = document.querySelector("section#why") as HTMLElement;
    const btn = within(why).getByRole("button", { name: "LOA-CFA" });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(within(why).getByRole("note")).toHaveTextContent(/work permit/);
    await userEvent.keyboard("{Escape}");
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("the myth quiz scores answers", async () => {
    renderApp();
    const quiz = document.querySelector("section#myths") as HTMLElement;
    // Q1 (encrypted by default) is a myth.
    const [, myth] = within(quiz).getAllByRole("button", { name: "Myth" });
    expect(MYTHS[0].truth).toBe(false);
    await userEvent.click(within(quiz).getAllByRole("button", { name: "Myth" })[0]);
    expect(within(quiz).getByText(/^Right!/)).toBeInTheDocument();
    expect(within(quiz).getByText(/1 of 1 correct/)).toBeInTheDocument();
    expect(myth).toBeDefined();
  });
});
