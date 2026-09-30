import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { LangProvider } from "./i18n/LangContext";
import { NAV } from "./content/nav";
import { EVENTS } from "./content/timeline";

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
      /router and a VPC/,
    );
    await userEvent.click(screen.getByRole("button", { name: "日本語" }));
    expect(document.documentElement.lang).toBe("ja");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("自社ルーター");
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
});
