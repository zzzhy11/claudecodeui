import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeFsPathForCompare, isPathSameOrInside, pathsBelongToSameProject } from './pathUtils.js';

test('normalizeFsPathForCompare handles basic paths', () => {
  const normalized = normalizeFsPathForCompare('C:\\Repo\\Project\\');
  assert.ok(normalized.toLowerCase().includes('c:\\repo\\project'));
  assert.ok(!normalized.endsWith('\\'));
});

test('normalizeFsPathForCompare strips Windows long path prefix', () => {
  if (process.platform !== 'win32') {
    return;
  }
  assert.equal(
    normalizeFsPathForCompare('\\\\?\\C:\\Repo\\Project'),
    normalizeFsPathForCompare('C:\\Repo\\Project')
  );
});

test('normalizeFsPathForCompare strips Windows UNC long path prefix', () => {
  if (process.platform !== 'win32') {
    return;
  }
  assert.equal(
    normalizeFsPathForCompare('\\\\?\\UNC\\Server\\Share\\Proj'),
    normalizeFsPathForCompare('\\\\Server\\Share\\Proj')
  );
});

test('isPathSameOrInside returns true for subdirectories', () => {
  const parent = process.platform === 'win32' ? 'C:\\Repo\\Project' : '/repo/project';
  const child = process.platform === 'win32' ? 'C:\\Repo\\Project\\sub' : '/repo/project/sub';
  assert.equal(isPathSameOrInside(parent, child), true);
});

test('pathsBelongToSameProject matches in either direction', () => {
  const root = process.platform === 'win32' ? 'C:\\Repo\\Project' : '/repo/project';
  const sub = process.platform === 'win32' ? 'C:\\Repo\\Project\\sub' : '/repo/project/sub';
  assert.equal(pathsBelongToSameProject(root, sub), true);
  assert.equal(pathsBelongToSameProject(sub, root), true);
});

