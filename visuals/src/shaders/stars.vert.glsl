uniform float uTime;
uniform float uPixelRatio;
uniform float uTwinkle;

attribute float aSize;
attribute float aPhase;

varying float vBrightness;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Background stars are effectively at infinity: fixed pixel size, no attenuation.
  gl_PointSize = aSize * uPixelRatio;

  float speed = 0.6 + fract(aPhase * 7.31) * 1.8;
  vBrightness = 1.0 - uTwinkle * (0.5 + 0.5 * sin(uTime * speed + aPhase * 6.2831));
}
