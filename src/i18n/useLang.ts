import { useContext } from "react";
import { LangContext, type LangValue } from "./context";

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
