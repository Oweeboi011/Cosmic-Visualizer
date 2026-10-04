varying vec3 vColor;

void main() {
  // Soft round point with a bright center.
  float d = length(gl_PointCoord - 0.5);
  float strength = pow(1.0 - smoothstep(0.0, 0.5, d), 3.0);
  if (strength < 0.01) discard;

  // Additive blending: color carries the intensity, alpha is unused.
  gl_FragColor = vec4(vColor * strength, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
