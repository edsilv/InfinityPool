import "./App.css";
import { useRef } from "react";
import { ViewerRef, Viewer, ControlPanel } from "../index";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "./AppProvider";

function App() {
  const viewerRef = useRef<ViewerRef>(null);

  return (
    <AppProvider>
      <div id="container">
        <div id="control-panel">
          <ControlPanel></ControlPanel>
        </div>
        <div id="viewer">
          <Viewer ref={viewerRef} />
        </div>
        <Toaster />
      </div>
    </AppProvider>
  );
}

export default App;
