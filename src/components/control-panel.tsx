import "../index.css";
import { FacetsSelector } from "./facets-selector";
import { FilterSelector } from "./filter-selector";
import { LayoutSelector } from "./layout-selector";
import { SourceSelector } from "./source-selector";

export function ControlPanel() {
  return (
    <div className="px-4">
      <SourceSelector />
      <LayoutSelector />
      <FilterSelector />
      <FacetsSelector />
    </div>
  );
}
