# _translations_ section

This optional section contains all available languages formatted for [i18next](https://www.i18next.com/) either as YAML or JSON, based on their paths. When a name is provided for a widget, that value can be used as the key, and the value is the translation for a specific language.

In addition, if no name is provided, form widgets automatically try to fetch a translation based on their full **path** attribute (always starting from the root object `spec.property...`), and if that fails, they use a prettified version of the last path item as their name (for example `spec.itemDescription` is prettified to "Item Description"), and by extension as a potential translation key.

## Example

```yaml
en:
  category: My category
  name: My Resource
  metadata:
    name: Name
  spec:
    items: Items
de:
  category: meine Kategorie
  name: Meine Ressource
  metadata:
    name: Name
  spec:
    items: Artikel
```
