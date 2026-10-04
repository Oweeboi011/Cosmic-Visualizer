uniform float uSize;        // particle size in world units
uniform float uPointScale;  // viewport height (device px) / (2 * tan(fov / 2))
uniform float uRadius;
uniform vec3 uCoreColor;
uniform vec3 uArmColor;

attribute float aScale;

varying vec3 vColor;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation: a world-sized point projects to this many pixels at its depth.
  gl_PointSize = uSize * aScale * uPointScale / -mvPosition.z;

  // Warm core fading into blue arms, by distance from the galactic center.
  float t = clamp(length(position.xz) / uRadius, 0.0, 1.0);
  vColor = mix(uCoreColor, uArmColor, smoothstep(0.0, 0.55, t));
  // The dense core would saturate under additive blending; dim per-particle there.
  vColor *= mix(0.55, 1.0, smoothstep(0.0, 0.25, t));
}
