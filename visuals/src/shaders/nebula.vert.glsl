// Camera-facing billboards drawn with InstancedMesh: one draw call for every cloud.

attribute vec3 aColor;
attribute float aSeed;

varying vec2 vUv;
varying vec3 vColor;
varying float vSeed;

void main() {
  vUv = uv;
  vColor = aColor;
  vSeed = aSeed;

  // Center and uniform scale from the instance transform.
  mat4 world = modelMatrix * instanceMatrix;
  vec3 center = world[3].xyz;
  float scale = length(world[0].xyz);

  // Camera right/up in world space are the first two rows of the view matrix.
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 worldPosition = center + (right * position.x + up * position.y) * scale;

  gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1.0);
}
