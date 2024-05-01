// @ts-nocheck

import * as THREE from "three";
import { useFrame, extend } from "@react-three/fiber";
import { useRef } from "react";
import { shaderMaterial } from "@react-three/drei";

const ColorShiftMaterial = shaderMaterial(
  {
    time: 0,
    map: null,
    color: new THREE.Color(0.05, 0.0, 0.025),
  },
  /* glsl */ `
  out vec2 vUv;
  flat out int instanceID;
  void main() {
    vUv = uv;
    instanceID = gl_InstanceID;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }

  `,
  /* glsl */ `
  precision highp sampler2DArray;

  uniform float time;
  uniform vec3 color;
  uniform sampler2DArray map;

  in vec2 vUv;
  flat in int instanceID;

  void main() {
    vec4 color = texture( map, vec3( vUv, instanceID ) );
    if (color.a < 0.5) discard;

    gl_FragColor.rgba = color;
    // gl_FragColor.rgba = vec4(vec3(0.), 1.);
  }

  `
);

// This is the 🔑 that HMR will renew if this file is edited
// It works for THREE.ShaderMaterial as well as for drei/shaderMaterial
// @ts-ignore
ColorShiftMaterial.key = THREE.MathUtils.generateUUID();

extend({ ColorShiftMaterial });

const Shader = (props) => {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.time += delta;
  });

  return (
    <colorShiftMaterial
      ref={ref}
      key={ColorShiftMaterial.key}
      time={3}
      {...props}
    />
  );
};

export default Shader;
