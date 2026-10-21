import test from 'node:test';
import assert from 'node:assert/strict';
import { createField, cameraBasis, groundHit } from '../model.js';

test('returning to a seed restores the exact field, while another seed changes it', () => {
  const first = createField(1337, 500);
  assert.deepEqual(first, createField(1337, 500));
  assert.notDeepEqual(first.blades, createField(1338, 500).blades);
});

test('raising density retains existing plant identities and adds valid geometry', () => {
  const small = createField(5, 200);
  const large = createField(5, 1200);
  assert.deepEqual(small.blades, large.blades.slice(0, small.blades.length));
  assert.ok(large.blades.every(Number.isFinite));
  assert.equal(large.blooms.length % 8, 0);
  assert.ok(large.flowerCount > 0);
  for (let i = 0; i < large.count; i++) assert.ok(large.blades[i * 8 + 2] > 0);
});

test('camera basis remains orthonormal at grazing and overhead angles', () => {
  for (const pitch of [-1.2, -0.08, 0.7]) {
    const { forward, right, up } = cameraBasis(0.8, pitch);
    const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
    for (const vector of [forward, right, up]) assert.ok(Math.abs(dot(vector, vector) - 1) < 1e-10);
    assert.ok(Math.abs(dot(forward, up)) < 1e-10);
    assert.ok(Math.abs(dot(forward, right)) < 1e-10);
  }
});

test('brush projects onto the ground and rejects rays above the horizon', () => {
  const camera = { x: 0, y: 2, z: 10, yaw: 0, pitch: -Math.PI / 4 };
  const hit = groundHit(0, 0, camera, 1.6);
  assert.ok(Math.abs(hit.x) < 1e-10);
  assert.ok(Math.abs(hit.z - 8) < 1e-10);
  assert.equal(groundHit(0, 0, { ...camera, pitch: 0.3 }, 1.6), null);
});
