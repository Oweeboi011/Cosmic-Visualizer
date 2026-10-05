varying float vBrightness;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float strength = 1.0 - smoothstep(0.15, 0.5, d);
  if (strength < 0.01) discard;
  gl_FragColor = vec4(vec3(0.85, 0.9, 1.0) * strength * vBrightness, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
