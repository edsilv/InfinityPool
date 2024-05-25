"use client";

import { useAppContext } from "@/lib/hooks/use-app-context";
import { OptionSelector } from "./option-selector";
import { Layout } from "@/types";
import { AppState } from "@/Store";

export function LayoutSelector() {
  const layout = useAppContext((state: AppState) => state.layout);
  const setLayout = useAppContext((state: AppState) => state.setLayout);

  return (
    <OptionSelector
      label="Layout"
      value={layout}
      onChange={(value: string) => {
        setLayout(value as Layout);
      }}
      options={[
        { value: "grid", label: "Grid" },
        { value: "list", label: "List" },
      ]}
      description="Set the layout."
    />
  );
}
