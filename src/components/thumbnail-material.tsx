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
  // Vertex shader
  // Define output variables that will be passed to the fragment shader
  out vec2 vUv; // The UV coordinates of the current vertex
  flat out int instanceID; // The ID of the current instance

  void main() {
    // Set the UV coordinates and instance ID
    vUv = uv;
    instanceID = gl_InstanceID;

    // Compute the position of the current vertex
    // The position is transformed from model space to clip space
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }

  `,
  /* glsl */ `
  // Fragment shader
  // Define the precision for sampler2DArray
  precision highp sampler2DArray;

  // Define uniform variables that will be set from JavaScript
  uniform float time; // The current time
  uniform vec3 color; // The color of the material
  uniform sampler2DArray map; // The texture map
  uniform float brightness; // The brightness of the material
  uniform float contrast; // The contrast of the material

  // Define input variables that were passed from the vertex shader
  in vec2 vUv; // The UV coordinates of the current fragment
  flat in int instanceID; // The ID of the current instance

  void main() {
    // Sample the texture map at the UV coordinates of the current fragment
    // The third component of the texture coordinates is the instance ID
    vec4 color = texture( map, vec3( vUv, instanceID ) );

    // If the alpha component of the color is less than 0.5, discard the fragment
    if (color.a < 0.5) discard;

    // Multiply the RGB components of the color by the brightness
    color.rgb *= brightness;

    // Adjust the contrast of the color
    color.rgb = ((color.rgb - 0.5) * max(contrast, 0.0)) + 0.5;

    // Set the color of the fragment
    gl_FragColor.rgba = color;
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
