import "../index.css";
import { FacetsSelector } from "./facets-selector";
import { LayoutSelector } from "./layout-selector";
import { SourceSelector } from "./source-selector";

export function ControlPanel() {
  return (
    <div className="px-4">
      <SourceSelector />
      <LayoutSelector />
      <FacetsSelector />
    </div>
  );
}
