// @ts-nocheck

import * as THREE from "three";
import { useFrame, extend } from "@react-three/fiber";
import { useRef } from "react";
import { shaderMaterial } from "@react-three/drei";

const CustomMaterial = shaderMaterial(
  {
    time: 0,
    map: null,
    brightness: 1.0,
    contrast: 1.0,
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
  uniform float brightness;
  uniform float contrast;

  in vec2 vUv;
  flat in int instanceID;

  void main() {
    vec4 color = texture( map, vec3( vUv, instanceID ) );
    if (color.a < 0.5) discard;

    color.rgb *= brightness;
    color.rgb = ((color.rgb - 0.5) * max(contrast, 0.0)) + 0.5;

    gl_FragColor.rgba = color;
    // gl_FragColor.rgba = vec4(vec3(0.), 1.);
  }

  `
);

// This is the 🔑 that HMR will renew if this file is edited
// It works for THREE.ShaderMaterial as well as for drei/shaderMaterial
// @ts-ignore
CustomMaterial.key = THREE.MathUtils.generateUUID();

extend({ CustomMaterial });

const ThumbnailMaterial = (props) => {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.time += delta;
  });

  return (
    <customMaterial
      ref={ref}
      key={CustomMaterial.key}
      time={3}
      brightness={1.0}
      contrast={1.0}
      {...props}
    />
  );
};

export default ThumbnailMaterial;
