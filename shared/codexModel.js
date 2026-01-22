import { CODEX_MODELS } from './modelConstants.js';

const codexModelValues = () => new Set(CODEX_MODELS.OPTIONS.map(o => o.value));

export function isSupportedCodexModel(model) {
  if (!model || typeof model !== 'string') return false;
  return codexModelValues().has(model);
}

/**
 * Resolves the effective Codex model to use.
 *
 * Precedence:
 * 1) storedModel (explicit user selection)
 * 2) cliModel (from ~/.codex/config.toml)
 * 3) CODEX_MODELS.DEFAULT
 */
export function resolveCodexModelPreference({ storedModel = null, cliModel = null } = {}) {
  if (storedModel) {
    return { model: storedModel, source: 'storage', cliModel: cliModel || null, modelSupported: true };
  }

  if (cliModel) {
    const supported = isSupportedCodexModel(cliModel);
    if (supported) {
      return { model: cliModel, source: 'cli', cliModel, modelSupported: true };
    }

    return {
      model: CODEX_MODELS.DEFAULT,
      source: 'fallback',
      cliModel,
      modelSupported: false
    };
  }

  return { model: CODEX_MODELS.DEFAULT, source: 'default', cliModel: null, modelSupported: true };
}

