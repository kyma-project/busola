import { vi, describe, it, expect } from 'vitest';
import { extractJsonObjectsFromChunk, readChunk } from './getChatResponse';
import { ErrorType } from '../components/Chat/types';

describe('readChunk', () => {
  const decoder = new TextDecoder();
  const sessionID = 'test-session';

  it('handles an entire JSON object in a single chunk', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"a": {"b": "c"}}\n'),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).toHaveBeenCalledTimes(1);
    expect(handleChatResponse).toHaveBeenCalledWith({ a: { b: 'c' } });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('handles two entire JSON objects in a single chunk', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            '{"a": {"b": "c"}}\n{"d": {"e": "f"}}\n',
          ),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).toHaveBeenCalledTimes(2);
    expect(handleChatResponse).toHaveBeenCalledWith({ a: { b: 'c' } });
    expect(handleChatResponse).toHaveBeenCalledWith({ d: { e: 'f' } });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('handles a partial JSON object split across two chunks', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"a": {"b": "c"'),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('}}\n'),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).toHaveBeenCalledTimes(1);
    expect(handleChatResponse).toHaveBeenCalledWith({ a: { b: 'c' } });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('handles one entire and one partial JSON object in one chunk with completion in the next', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"a": {"b": "c"}}\n{"d": {"e": "f"'),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('}}\n'),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).toHaveBeenCalledTimes(2);
    expect(handleChatResponse).toHaveBeenCalledWith({ a: { b: 'c' } });
    expect(handleChatResponse).toHaveBeenCalledWith({ d: { e: 'f' } });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('handles stream ending with incomplete JSON data', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"a": {"b": "c"'),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith({
      message: 'Stream ended with incomplete JSON data',
      type: ErrorType.FATAL,
    });
  });

  it('handles JSON chunk with error', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            '{"streamingError": {"message": "test message" }}\n',
          ),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith({
      message: 'test message',
      type: ErrorType.FATAL,
    });
  });
});

describe('extractJsonObjectsFromChunk', () => {
  it('extracts entire JSON object', () => {
    const input = '{"a": {"b": "c"}}\n';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual(['{"a": {"b": "c"}}']);
    expect(result.remainingBuffer).toBe('');
  });

  it('extracts two entire JSON objects', () => {
    const input = '{"a": {"b": "c"}}\n{"d": {"e": "f"}}\n';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual([
      '{"a": {"b": "c"}}',
      '{"d": {"e": "f"}}',
    ]);
    expect(result.remainingBuffer).toBe('');
  });

  it('handles partial JSON object', () => {
    const input = '{"a": {"b": "';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual([]);
    expect(result.remainingBuffer).toBe('{"a": {"b": "');
  });

  it('extracts one entire and one partial JSON object', () => {
    const input = '{"a": {"b": "c"}}\n{"d": {"e": "';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual(['{"a": {"b": "c"}}']);
    expect(result.remainingBuffer).toBe('{"d": {"e": "');
  });

  it('extracts multiple JSON objects with a partial object', () => {
    const input = '{"a": {"b": "c"}}\n{"d": {"e": "f"}}\n{"g": {"h": "';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual([
      '{"a": {"b": "c"}}',
      '{"d": {"e": "f"}}',
    ]);
    expect(result.remainingBuffer).toBe('{"g": {"h": "');
  });

  it('handles JSON object with internal newlines', () => {
    const input = '{"a": {\n  "b": "c"\n}}\n';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual(['{"a": {\n  "b": "c"\n}}']);
    expect(result.remainingBuffer).toBe('');
  });
});
