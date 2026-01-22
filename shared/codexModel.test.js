import test from 'node:test';
import assert from 'node:assert/strict';
import { CODEX_MODELS } from './modelConstants.js';
import { isSupportedCodexModel, resolveCodexModelPreference } from './codexModel.js';

test('isSupportedCodexModel: validates against CODEX_MODELS.OPTIONS', () => {
  assert.equal(isSupportedCodexModel(CODEX_MODELS.DEFAULT), true);
  assert.equal(isSupportedCodexModel('not-a-real-model'), false);
  assert.equal(isSupportedCodexModel(null), false);
});

test('resolveCodexModelPreference: prefers stored model over cli model', () => {
  const resolved = resolveCodexModelPreference({ storedModel: 'o3', cliModel: 'gpt-5.2' });
  assert.deepEqual(resolved, { model: 'o3', source: 'storage', cliModel: 'gpt-5.2', modelSupported: true });
});

test('resolveCodexModelPreference: uses supported cli model when no stored model', () => {
  const resolved = resolveCodexModelPreference({ storedModel: null, cliModel: 'o4-mini' });
  assert.deepEqual(resolved, { model: 'o4-mini', source: 'cli', cliModel: 'o4-mini', modelSupported: true });
});

test('resolveCodexModelPreference: falls back when cli model unsupported', () => {
  const resolved = resolveCodexModelPreference({ storedModel: null, cliModel: 'gpt-9999' });
  assert.deepEqual(resolved, {
    model: CODEX_MODELS.DEFAULT,
    source: 'fallback',
    cliModel: 'gpt-9999',
    modelSupported: false
  });
});

test('resolveCodexModelPreference: default when no stored and no cli model', () => {
  const resolved = resolveCodexModelPreference({ storedModel: null, cliModel: null });
  assert.deepEqual(resolved, { model: CODEX_MODELS.DEFAULT, source: 'default', cliModel: null, modelSupported: true });
});

