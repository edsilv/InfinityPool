"use client";

import useStore from "@/Store";
import { OptionSelector } from "./option-selector";
import { Layout } from "@/types";

export function LayoutSelector() {
  const { layout, setLayout } = useStore();

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
