import { SrcObj } from "@/types";
import { Html, useProgress } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function Loader({
  onLoad,
  src,
}: {
  onLoad?: (src: SrcObj) => void;
  src: SrcObj;
  setLoading: (loading: boolean) => void;
}) {
  const { gl } = useThree();
  const { progress } = useProgress();
  if (progress === 100) {
    setTimeout(() => {
      if (onLoad) {
        onLoad(src);
      }
    }, 1);
  }

  return (
    <Html
      wrapperClass="loading"
      calculatePosition={() => {
        return [gl.domElement.clientWidth / 2, gl.domElement.clientHeight / 2];
      }}
    >
      <div className="flex justify-center">
        <div className="h-1 w-24 bg-black rounded-full overflow-hidden transform translate-x-[-50%]">
          <div
            className="h-full bg-white"
            style={{
              width: `${Math.ceil(progress)}%`,
            }}
          />
        </div>
      </div>
    </Html>
  );
}
