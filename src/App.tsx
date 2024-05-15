import "./App.css";
import { useEffect, useRef } from "react";
import { useControls } from "leva";
import { ViewerRef, SrcObj, Viewer, ControlPanel } from "../index";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

function App() {
  const viewerRef = useRef<ViewerRef>(null);
  const loadedUrlsRef = useRef<string[]>([]);

  // https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Models-showcase.md
  // https://github.com/google/model-viewer/tree/master/packages/modelviewer.dev/assets
  const [{ src }, _setLevaControls] = useControls(() => ({
    src: {
      options: {
        "National Gallery Highlights": {
          url: "https://media.nga.gov/public/manifests/nga_highlights.json",
          type: "iiif",
        },
        "Codex Forster": {
          url: "https://iiif.vam.ac.uk/collections/MSL:1876:Forster:141:II/manifest.json",
          type: "iiif",
        },
        "Design Archives": {
          url: "https://culturedigitalskills.org/presentation/designarchives-collection-5-05-24.json",
          type: "iiif",
        },
        "Shakespeare First Folio": {
          url: "https://iiif.bodleian.ox.ac.uk/iiif/manifest/390fd0e8-9eae-475d-9564-ed916ab9035c.json",
          type: "iiif",
        },
        "Wunder der Vererbung": {
          url: "https://wellcomelibrary.org/iiif/b18035723/manifest",
          type: "iiif",
        },
      },
    },
    // Recenter: button((_get) => {
    //   viewerRef.current?.recenter();
    // }),
  }));

  // src changed
  useEffect(() => {
    // if the src is already loaded, recenter the camera
    if (loadedUrlsRef.current.includes(src.url)) {
      setTimeout(() => {
        viewerRef.current?.recenter();
      }, 100);
    }
  }, [src]);

  return (
    <div id="container">
      <div id="control-panel">
        <ControlPanel></ControlPanel>
      </div>
      <div id="viewer">
        <Viewer
          ref={viewerRef}
          src={src}
          onLoad={(src: SrcObj) => {
            console.log(`src loaded`, src);
            // add loaded urls to array of already loaded urls
            loadedUrlsRef.current = [...loadedUrlsRef.current, src.url];

            // show the required statement if it exists
            src.requiredStatement && toast(src.requiredStatement);
          }}
        />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
