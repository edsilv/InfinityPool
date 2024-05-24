import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function Loader() {
  const { gl } = useThree();

  return (
    <Html
      wrapperClass="loading"
      calculatePosition={() => {
        return [gl.domElement.clientWidth / 2, gl.domElement.clientHeight / 2];
      }}
    >
      <div className="spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
      </div>
    </Html>
  );
}
