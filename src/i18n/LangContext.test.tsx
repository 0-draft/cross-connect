import { describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import { LangProvider } from "./LangContext";
import { useLang } from "./useLang";
import type { LangValue } from "./context";

// A test-only probe that hands the context value out through a callback.
function Probe({ onValue }: { onValue: (v: LangValue) => void }) {
  onValue(useLang());
  return null;
}

describe("LangProvider", () => {
  it("rewrites ?lang= and keeps other params and the hash", () => {
    window.history.replaceState(null, "", "/cross-connect/?x=1#routing");
    const out: { v?: LangValue } = {};
    render(
      <LangProvider>
        <Probe onValue={(v) => (out.v = v)} />
      </LangProvider>,
    );
    expect(out.v?.lang).toBe("en");
    act(() => out.v?.setLang("ja"));
    expect(window.location.pathname).toBe("/cross-connect/");
    expect(window.location.search).toBe("?x=1&lang=ja");
    expect(window.location.hash).toBe("#routing");
    expect(document.title).toMatch(/図解/);
    act(() => out.v?.setLang("en"));
    expect(window.location.search).toBe("?x=1");
  });
});
