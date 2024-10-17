"use client";

import { useAppContext } from "@/lib/hooks/use-app-context";
import { OptionSelector } from "./option-selector";
import { AppState } from "@/Store";
import { SrcObj } from "@/types";
import { config } from "@/Config";

export function SourceSelector() {
  let src: SrcObj | null = useAppContext((state: AppState) => state.src);
  const setSrc = useAppContext((state: AppState) => state.setSrc);

  const srcs: SrcObj[] = config.srcs;

  // set default src
  if (!src) {
    (src = srcs[0]), setSrc(src);
  }

  return (
    <OptionSelector
      label="Source"
      value={src.id}
      onChange={(id: string) => {
        const nextSrc: SrcObj = srcs.find((src) => src.id === id)!;
        console.log("nextSrc", nextSrc);
        setSrc(nextSrc);
      }}
      options={srcs.map((src) => {
        return {
          label: src.label,
          value: src.id,
        };
      })}
      description="Set the source."
    />
  );
}
