import type { AIClient } from './types';
import { openaiClientFactory } from './providers/openai';
import { groqClientFactory } from './providers/groq';
import { anthropicClientFactory } from './providers/anthropic';
import { localClientFactory } from './providers/local';
import type { RuntimeConfig } from '../config/manager';

export const createAIClient = (cfg: RuntimeConfig): AIClient => {
  const opts = { timeout: cfg.timeout, proxy: cfg.proxy, model: cfg.model };

  switch (cfg.provider) {
    case 'openai':
      if (!cfg.openaiApiKey) throw new Error('OpenAI API key missing for provider openai');
      return openaiClientFactory(cfg.openaiApiKey, opts);
    case 'groq':
      if (!cfg.groqApiKey) throw new Error('Groq API key missing for provider groq');
      return groqClientFactory(cfg.groqApiKey, opts);
    case 'anthropic':
      if (!cfg.anthropicApiKey) throw new Error('Anthropic API key missing for provider anthropic');
      return anthropicClientFactory(cfg.anthropicApiKey, opts);
    case 'local':
      if (!cfg.localModelUrl) throw new Error('Local provider requires LOCAL_MODEL_URL in config');
      return localClientFactory(cfg.localModelUrl, opts);
    default:
      throw new Error(`Unsupported provider: ${String(cfg.provider)}`);
  }
};
