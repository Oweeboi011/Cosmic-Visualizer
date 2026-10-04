// Drawn on the back faces of a slightly larger shell, so the planet hides the shell's
// center: brightest just outside the planet's limb, fading to nothing at the shell edge.

uniform vec3 uColor;
uniform float uIntensity;

varying vec3 vNormal;

void main() {
  float rim = pow(clamp(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 4.0);
  gl_FragColor = vec4(uColor * rim * uIntensity, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
