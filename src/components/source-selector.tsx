"use client";

import { useAppContext } from "@/lib/hooks/use-app-context";
import { OptionSelector } from "./option-selector";
import { AppState } from "@/Store";
import { SrcObj } from "@/types";
import { config } from "@/Config";

export function SourceSelector() {
  let src: SrcObj | null = useAppContext((state: AppState) => state.src);
  const setSrc = useAppContext((state: AppState) => state.setSrc);

  const srcs: { value: string; label: string }[] = config.srcs;

  if (!src) {
    src = {
      url: srcs[0].value,
      type: "iiif",
    };

    setSrc(src);
  }

  return (
    <OptionSelector
      label="Source"
      value={src.url}
      onChange={(value: string) => {
        setSrc({
          url: value,
          type: "iiif",
        });
      }}
      options={srcs}
      description="Set the source."
    />
  );
}
