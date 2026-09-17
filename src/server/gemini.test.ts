import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { call } = vi.hoisted(() => ({ call: vi.fn() }));
vi.mock('@google/genai', () => ({ GoogleGenAI: class { models = { generateContent: call }; } }));
import { generateContent, geminiKey, geminiModel, groundingModel } from './gemini';
beforeEach(() => { vi.stubEnv('GEMINI_API_KEY', 'real-test-key'); vi.stubEnv('GOOGLE_AI_STUDIO_API_KEY', ''); });
afterEach(() => { vi.unstubAllEnvs(); call.mockReset(); });
describe('Gemini configuration and retries', () => {
  it('ignores example placeholder keys and honours a usable alias', () => {
    vi.stubEnv('GOOGLE_AI_STUDIO_API_KEY', 'MY_GOOGLE_AI_STUDIO_API_KEY');
    expect(geminiKey()).toBe('real-test-key');
    vi.stubEnv('GOOGLE_AI_STUDIO_API_KEY', ' studio-test-key ');
    expect(geminiKey()).toBe('studio-test-key');
  });
  it('uses server model overrides for both phases', () => {
    vi.stubEnv('GEMINI_MODEL', 'vision-model'); vi.stubEnv('GEMINI_GROUNDING_MODEL', 'search-model');
    expect(geminiModel()).toBe('vision-model'); expect(groundingModel()).toBe('search-model');
  });
  it('retries one transient failure with the same deadline', async () => {
    call.mockRejectedValueOnce({ status: 503 }).mockResolvedValueOnce({ text: 'ok' });
    await expect(generateContent({ model: 'test', contents: 'test' }, 1000)).resolves.toEqual({ text: 'ok' });
    expect(call).toHaveBeenCalledTimes(2);
    expect(call.mock.calls[0][0].config.abortSignal).toBe(call.mock.calls[1][0].config.abortSignal);
  });
  it.each([400, 403, 404, 429])('does not retry status %s', async status => {
    call.mockRejectedValue({ status });
    await expect(generateContent({ model: 'test', contents: 'test' }, 1000)).rejects.toEqual({ status });
    expect(call).toHaveBeenCalledTimes(1);
  });
  it('stops after two provider attempts', async () => {
    call.mockRejectedValue({ status: 503 });
    await expect(generateContent({ model: 'test', contents: 'test' }, 1000)).rejects.toEqual({ status: 503 });
    expect(call).toHaveBeenCalledTimes(2);
  });
});
