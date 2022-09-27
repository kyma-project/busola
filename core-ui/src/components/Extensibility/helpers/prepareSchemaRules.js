const eqPath = (a, b) => JSON.stringify(b) === JSON.stringify(a);

export function prepareSchemaRules(ruleDefs) {
  const root = { path: [], children: [] };
  let stack = [root];

  const extractRules = (
    { path, var: varName, ...ruleDef },
    parentPath,
    index,
  ) => {
    const fullPath = (path
      ? [
          ...parentPath,
          ...(Array.isArray(path)
            ? path
            : path?.replace(/\[]/g, '.[]')?.split('.') || []),
        ]
      : [...parentPath, varName ? `$${varName}` : `custom${index}`]
    ).filter(item => !!item);

    let lastArrayIndex;
    fullPath.reduce((acc, step, index) => {
      const myPath = [...acc, step];
      if (step === '[]') lastArrayIndex = index;

      if (!stack[index + 1] || !eqPath(stack[index + 1].path, myPath)) {
        if (stack[index + 1]) {
          stack = stack.slice(0, index + 1);
        }

        const stackTop = stack[index];
        const rule =
          index === fullPath.length - 1
            ? {
                ...ruleDef,
                var: varName,
                custom: !path,
                path: myPath,
                children: [],
                itemVars: [],
              }
            : {
                var: varName,
                path: myPath,
                children: [],
                itemVars: [],
              };
        stackTop.children.push(rule);
        stack.push(rule);
      }
      return myPath;
    }, []);

    if (lastArrayIndex) {
      const lastArrayRule = stack[lastArrayIndex + 1];
      if (varName) lastArrayRule.itemVars.push(varName);
      stack
        .slice(lastArrayIndex + 1)
        .forEach(item => (item.itemVars = lastArrayRule.itemVars));
    }

    ruleDef.children?.forEach((subDef, index) =>
      extractRules(subDef, fullPath, index),
    );
  };

  ruleDefs.forEach((subDef, index) => extractRules(subDef, [], index));

  return root;
}
