### Extensibility Error Handling

There's a special error handler, that can be used when validating input from the EXT Config Maps.

When users make errors in configuration, you can display the error's message and even the responsible part of a Config Map with the `throwConfigError` handler:

```js
if (!structure || typeof structure !== 'object') {
  throwConfigError(t('extensibility.not-an-object'), structure);
}
if (!structure.path && !structure.children && !Array.isArray(structure)) {
  throwConfigError(t('extensibility.no-path-children'), structure);
}
```

If user makes an error by forgetting `path` in a widget

```json
{
  "type": "boolean",
  "name": "isSecretRecipe"
}
```

he will see a notification like:

```
Your extension configuration is incorrect.
A widget lacks one of the required properties, add either "path" or "children".
    {
    "type": "boolean",
    "name": "isSecretRecipe"
    }
```
