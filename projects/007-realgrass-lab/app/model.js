// Original study implementation. A seed and an instance ID fully describe a blade.
export const DEFAULTS = Object.freeze({ seed: 1337, density: 56000, wind: 1.2, height: 0.8, clouds: 0.55, moisture: 0.7, flowers: true, paused: false });
export const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export function random(seed, id, channel = 0) {
  let n = (Math.imul(id + 1, 1597334677) ^ Math.imul(seed, 3812015801) ^ Math.imul(channel + 1, 2798796415)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 2246822507);
  n = Math.imul(n ^ (n >>> 13), 3266489909);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export function createField(seed, count) {
  // Density prefixes retain their identities; changing density never moves existing blades.
  const blades = new Float32Array(count * 8);
  const blooms = [];
  for (let i = 0; i < count; i++) {
    const near = random(seed, i, 0) < 0.78;
    const x = (random(seed, i, 1) - 0.5) * (near ? 46 : 180);
    const z = random(seed, i, 2) * (near ? 56 : 170) - (near ? 37 : 153);
    const patch = 0.5 + 0.5 * Math.sin(x * 0.34 + Math.cos(z * 0.23) * 2.0);
    const height = 0.32 + random(seed, i, 3) * 0.78 + patch * 0.18;
    const angle = random(seed, i, 4) * Math.PI * 2;
    const phase = random(seed, i, 5) * Math.PI * 2;
    const hue = random(seed, i, 6);
    const flower = random(seed, i, 7) > 0.992 ? 1 : 0;
    const width = 0.035 + random(seed, i, 8) * 0.035;
    const record = [x, z, height, angle, phase, hue, flower, width];
    blades.set(record, i * 8);
    if (flower) blooms.push(...record);
  }
  return { blades, blooms: new Float32Array(blooms), count, flowerCount: blooms.length / 8 };
}

export function cameraBasis(yaw, pitch) {
  const forward = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
  const right = [Math.cos(yaw), 0, Math.sin(yaw)];
  const up = [-Math.sin(yaw) * Math.sin(pitch), Math.cos(pitch), Math.cos(yaw) * Math.sin(pitch)];
  return { forward, right, up };
}

export function groundHit(ndcX, ndcY, camera, aspect) {
  const { forward, right, up } = cameraBasis(camera.yaw, camera.pitch);
  const tangent = Math.tan(Math.PI / 6);
  const ray = forward.map((v, i) => v + right[i] * ndcX * aspect * tangent + up[i] * ndcY * tangent);
  if (ray[1] >= -0.001) return null;
  const t = -camera.y / ray[1];
  if (t <= 0 || t > 200) return null;
  return { x: camera.x + ray[0] * t, z: camera.z + ray[2] * t };
}
