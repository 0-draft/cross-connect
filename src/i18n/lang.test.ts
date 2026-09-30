import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, isLang, resolveInitialLang } from "./lang";

describe("resolveInitialLang", () => {
  it("defaults to English", () => {
    expect(DEFAULT_LANG).toBe("en");
    expect(resolveInitialLang("", null)).toBe("en");
  });

  it("prefers ?lang= over storage", () => {
    expect(resolveInitialLang("?lang=ja", "en")).toBe("ja");
    expect(resolveInitialLang("?lang=en", "ja")).toBe("en");
  });

  it("falls back to storage, ignoring junk", () => {
    expect(resolveInitialLang("?lang=fr", "ja")).toBe("ja");
    expect(resolveInitialLang("", "de")).toBe("en");
  });

  it("isLang narrows only supported codes", () => {
    expect(isLang("ja")).toBe(true);
    expect(isLang("JA")).toBe(false);
    expect(isLang(1)).toBe(false);
  });
});
