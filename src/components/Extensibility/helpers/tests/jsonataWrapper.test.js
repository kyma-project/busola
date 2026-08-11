import { escapeKebabCase } from '../jsonataWrapper';

describe('escapeKebabCase', () => {
  it('regular path', () => {
    const expression = '$root.spec.myRegularPath';
    expect(escapeKebabCase(expression)).toBe('$root.spec.myRegularPath');
  });

  it('kebab path', () => {
    const expression = '$root.spec.my-kebab-path';
    expect(escapeKebabCase(expression)).toBe('$root.spec.`my-kebab-path`');
  });

  it('kebab path and regular path', () => {
    const expression = '$root.spec.my-kebab-path.subPath';
    expect(escapeKebabCase(expression)).toBe(
      '$root.spec.`my-kebab-path`.subPath',
    );
  });

  it('multiple kebab paths', () => {
    const expression = '$root.spec.my-kebab-path.sub-path';
    expect(escapeKebabCase(expression)).toBe(
      '$root.spec.`my-kebab-path`.`sub-path`',
    );
  });

  it('direct follow-up 1', () => {
    const expression = '$root.spec.my-kebab-path.subPath!=true';
    expect(escapeKebabCase(expression)).toBe(
      '$root.spec.`my-kebab-path`.subPath!=true',
    );
  });

  it('direct follow-up 2', () => {
    const expression = '$root.spec.my-kebab-path.subPath != true';
    expect(escapeKebabCase(expression)).toBe(
      '$root.spec.`my-kebab-path`.subPath != true',
    );
  });

  it('numeric expression 1', () => {
    const expression = '4 - 6';
    expect(escapeKebabCase(expression)).toBe('4 - 6');
  });

  it('numeric expression 2', () => {
    const expression = '$item.value1 - $item.value2';
    expect(escapeKebabCase(expression)).toBe('$item.value1 - $item.value2');
  });

  it('numeric expression 3', () => {
    const expression = '$item.value-one - $item.value-two';
    expect(escapeKebabCase(expression)).toBe(
      '$item.`value-one` - $item.`value-two`',
    );
  });

  it('string literal 1', () => {
    const expression = "hello, 'this-is-a-string', some-path";
    expect(escapeKebabCase(expression)).toBe(
      "hello, 'this-is-a-string', `some-path`",
    );
  });

  it('string literal 2', () => {
    const expression = 'hello, "this-is-a-string", some-path';
    expect(escapeKebabCase(expression)).toBe(
      'hello, "this-is-a-string", `some-path`',
    );
  });

  it('string literal 3', () => {
    const expression = 'hello, `this-is-a-string`, some-path';
    expect(escapeKebabCase(expression)).toBe(
      'hello, `this-is-a-string`, `some-path`',
    );
  });
});
