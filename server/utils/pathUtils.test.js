import test from 'node:test';
import assert from 'node:assert/strict';

import { isPathSameOrInside, normalizeFsPathForCompare, pathsBelongToSameProject } from './pathUtils.js';

test('normalizeFsPathForCompare handles empty input', () => {
  assert.equal(normalizeFsPathForCompare(''), '');
  assert.equal(normalizeFsPathForCompare('   '), '');
  assert.equal(normalizeFsPathForCompare(null), '');
});

test('isPathSameOrInside basic containment', () => {
  if (process.platform === 'win32') {
    assert.equal(isPathSameOrInside('C:\\Repo\\Proj', 'C:\\Repo\\Proj\\sub'), true);
    assert.equal(isPathSameOrInside('C:\\Repo\\Proj', 'D:\\Repo\\Proj\\sub'), false);
    return;
  }

  assert.equal(isPathSameOrInside('/tmp/proj', '/tmp/proj/sub'), true);
  assert.equal(isPathSameOrInside('/tmp/proj', '/var/tmp/proj'), false);
});

test('pathsBelongToSameProject tolerates normalization differences', () => {
  if (process.platform !== 'win32') {
    assert.equal(pathsBelongToSameProject('/tmp/proj', '/tmp/proj/child'), true);
    assert.equal(pathsBelongToSameProject('/tmp/proj/child', '/tmp/proj'), true);
    return;
  }

  // Case-insensitive on Windows
  assert.equal(pathsBelongToSameProject('C:\\Repo\\Proj', 'c:\\repo\\proj\\sub'), true);

  // Long path prefix
  assert.equal(pathsBelongToSameProject('\\\\?\\C:\\Repo\\Proj', 'C:\\Repo\\Proj\\sub'), true);

  // UNC long path prefix
  assert.equal(
    pathsBelongToSameProject('\\\\?\\UNC\\SERVER\\Share\\Path', '\\\\server\\share\\path\\child'),
    true
  );
});

