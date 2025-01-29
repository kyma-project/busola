# Custom Busola Web Components

Busola provides a suite of custom web components to enhance your application's functionality.

## Utility Functions

All custom web components expose methods to dynamically update their properties, attributes, and slots after initialization.
You can pass the string and boolean properties as standard HTML attributes. For example:

```HTML
<monaco-editor read-only="true"></monaco-editor>
```

You can pass functions, objects, and arrays using the `setProp` function. For example:

```JS
const editor = document.querySelector('monaco-editor');
editor.setProp('on-change', (value) => console.log('New content:', value));
```

You can pass HTML elements using the `setSlot` attribute. For example:

```JS
const dynamicPage = document.querySelector('dynamic-page-component');
const customFooter = document.createElement('div');
customFooter.textContent = 'Custom Footer Content';
dynamicPage.setSlot('footer', customFooter);
```

## Custom Web Components

- [Monaco Editor](#monaco-editor)
- [Dynamic Page](#dynamic-page)

### Monaco Editor

The Monaco Editor component is a versatile code editor. It provides features such as syntax highlighting and autocompletion. It supports the following attributes and properties. Attributes correspond to camel-cased React props when accessed programmatically.

| Parameter                         | Required | Type     | Description                                                                                                                                                                                                                |
| --------------------------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **value**                         | No       | string   | The initial code content displayed in the editor. Defaults to an empty string.                                                                                                                                             |
| **placeholder**                   | No       | string   | Specifies a short hint about the input field value.                                                                                                                                                                        |
| **language**                      | No       | string   | Specifies the programming language of the editor's content (for example, `javascript`, `json`). Defaults to `javascript`.                                                                                                  |
| **height**                        | No       | string   | Specifies the height of the component. Must include the unit (e.g., `100px`, `50vh`).                                                                                                                                      |
| **schema-id**                     | No       | string   | A unique identifier for the JSON schema used to enable autocompletion and validation. If not provided, autocompletion is disabled.                                                                                         |
| **autocompletion-disabled**       | No       | boolean  | Disables autocompletion suggestions when set to `true`.                                                                                                                                                                    |
| **read-only**                     | No       | boolean  | Specifies if the field is read-only. Defaults to `false`.                                                                                                                                                                  |
| **on-change**                     | No       | function | Callback function triggered when the content changes.                                                                                                                                                                      |
| **on-mount**                      | No       | function | Callback function triggered when the editor mounts.                                                                                                                                                                        |
| **on-blur**                       | No       | function | Callback function triggered when the editor loses focus.                                                                                                                                                                   |
| **on-focus**                      | No       | function | Callback function triggered when the editor gains focus.                                                                                                                                                                   |
| **update-value-on-parent-change** | No       | boolean  | Updates the editor content if the parent component changes its `value` prop.                                                                                                                                               |
| **options**                       | No       | object   | Custom options for configuring the Monaco Editor. Refer to the [Monaco Editor API](https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneEditorConstructionOptions.html) for available options. |
| **error**                         | No       | string   | Displays an error message in the editor when provided. If an error is displayed, it indicates that the current input is invalid, but the previous valid input will be used by the editor.                                  |

See the following example:

```HTML
<monaco-editor
    value="console.log('Hello!')"
    language="javascript"
    height="200px"
    placeholder="Write some code..."
  ></monaco-editor>
```

<img src="./assets/MonacoEditor.png" alt="Example of a Monaco Editor" width="70%" style="border: 1px solid #D2D5D9">

### Dynamic Page

The Dynamic Page web component displays content on the page, consisting of a title, a header, a content area, an optional inline edit form, and a floating footer. It supports the following attributes and properties. Attributes correspond to camel-cased React props when accessed programmatically.

| Parameter                      | Required | Type     | Description                                                                                                                                                                                       |
| ------------------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **title**                      | No       | string   | The title of the page displayed in the header.                                                                                                                                                    |
| **description**                | No       | string   | A description displayed below the title.                                                                                                                                                          |
| **actions**                    | No       | node     | Custom actions rendered in the header toolbar.                                                                                                                                                    |
| **children**                   | No       | node     | Child elements or components to be rendered within the page.                                                                                                                                      |
| **column-wrapper-class-name**  | No       | string   | Additional class names for the column wrapper, used for styling purposes.                                                                                                                         |
| **content**                    | No       | node     | Content displayed in the main section of the page.                                                                                                                                                |
| **footer**                     | No       | node     | Content displayed in the footer section.                                                                                                                                                          |
| **layout-number**              | No       | string   | Layout identifier for column management.                                                                                                                                                          |
| **layout-close-url**           | No       | string   | URL to navigate to when the column layout is closed.                                                                                                                                              |
| **inline-edit-form**           | No       | function | A function defining the inline edit form. It receives the `stickyHeaderHeight` as an argument and is expected to return a HTML element.                                                           |
| **show-yaml-tab**              | No       | boolean  | Specifies whether to show a YAML editing tab.                                                                                                                                                     |
| **protected-resource**         | No       | boolean  | Indicates whether the resource is protected.                                                                                                                                                      |
| **protected-resource-warning** | No       | node     | Warning message for protected resources.                                                                                                                                                          |
| **class-name**                 | No       | string   | Additional class names for the component, used for custom styling.                                                                                                                                |
| **custom-action-if-form-open** | No       | function | Specifies a custom action triggered when a user tries to navigate out of the Edit form tab. It receives four arguments: `isResourceEdited`, `setIsResourceEdited`, `isFormOpen`, `setIsFormOpen`. |

#### `custom-action-if-form-open`

The `custom-action-if-form-open` prop in the Dynamic Page component is a customizable callback function designed to handle specific actions when a form is open. It receives four arguments:

| Argument                | Type     | Description                                                                                                                         |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **isResourceEdited**    | object   | Indicates if the current resource has been edited. The object has the structure: `{ isEdited: boolean; discardAction?: Function; }` |
| **setIsResourceEdited** | function | A state setter function to update the `isResourceEdited` state.                                                                     |
| **isFormOpen**          | object   | Tracks the status of the inline edit form. The object has the structure: `{ formOpen: boolean; leavingForm: boolean; }`             |
| **setIsFormOpen**       | function | A state setter function to update the `isFormOpen` state.                                                                           |

See the following example:

```HTML
<dynamic-page-component
  title="Sample Page"
  description="This is a dynamic page."
  show-yaml-tab="true"
  class-name="custom-page-class"
>
```

<img src="./assets/DynamicPage.png" alt="Example of a Monaco Editor" width="50%" style="border: 1px solid #D2D5D9">

To see an exemplary configuration of the Busola custom extension feature using web components, check files in [this](examples/../../../examples/busola-web-components/README.md) example.
