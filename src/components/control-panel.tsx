import "../index.css";
import { LayoutSelector } from "./layout-selector";
import { SourceSelector } from "./source-selector";

export function ControlPanel() {
  return (
    <div>
      <SourceSelector />
      <LayoutSelector />
    </div>
  );
}
