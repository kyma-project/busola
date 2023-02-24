/**
 * @jest-environment node
 */
import compiler from './compiler.js';

test('Should read multi-file yaml', async () => {
  jest.useFakeTimers();
  jest.setTimeout(9999999);
  const stats = await compiler('example.multi-file.yml');
  const output = stats.toJson({ source: true }).modules[0].source;

  expect(output).toBe('[{"file":1},{"file":2},{"file":["1 yaml"]}]');
});
