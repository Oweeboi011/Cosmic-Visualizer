// `fbm` is prepended from noise.glsl (see scene/Nebula.ts).

uniform float uTime;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vColor;
varying float vSeed;

void main() {
  vec2 p = vUv - 0.5;
  float falloff = 1.0 - smoothstep(0.15, 0.5, length(p));
  if (falloff <= 0.0) discard;

  // Slowly evolving, domain-warped noise reads as billowing gas.
  vec3 q = vec3(p * 2.6 + vSeed * 17.0, uTime * 0.015 + vSeed * 3.0);
  float warp = fbm(q);
  float density = fbm(q + vec3(warp * 1.6, warp * 1.2, 0.0));
  density = smoothstep(0.48, 0.9, density) * falloff;

  gl_FragColor = vec4(vColor * density * uOpacity, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
