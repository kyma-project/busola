import joinPaths from './path';

describe('Check path', () => {
  //GIVEN
  const tests = [
    {
      name: 'empty path',
      expected: '/',
      arguments: [],
    },
    { name: 'single argument', arguments: ['test'], expected: '/test' },
    {
      name: 'more arguments',
      arguments: ['test', 'busola', 'path'],
      expected: '/test/busola/path',
    },
  ];

  tests.forEach(test => {
    it(test.name, () => {
      //WHEN
      const result = joinPaths(...test.arguments);

      //THEN
      expect(result).toEqual(test.expected);
    });
  });
});
