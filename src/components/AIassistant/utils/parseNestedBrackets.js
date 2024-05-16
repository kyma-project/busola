// input:   "{sample}{string {with}}{multiple {nested{braces}}}"
// output:  ["{sample}", "{string {with}}", "{multiple {nested{braces}}}"]
export function parseNestedBrackets(text) {
  const output = [];
  let openBraces = 0;
  let startIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '{') {
      if (openBraces === 0) {
        startIndex = i;
      }
      openBraces++;
    }
    if (char === '}') {
      openBraces--;
      if (openBraces === 0) {
        output.push(text.substring(startIndex, i + 1));
      }
    }
  }
  return output;
}
