import { createContext } from "react";
import type { L, Lang } from "./lang";

export interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (copy: L) => string;
}

export const LangContext = createContext<LangValue | null>(null);
