export default [
  { text: 'Command Palette', link: './01-20-command-palette.md' },
  {
    text: 'Extensibility',
    link: './extensibility/README.md',
    collapsed: true,
    items: [
      { text: 'List Columns', link: './extensibility/20-list-columns.md' },
      {
        text: 'Details Summary',
        link: './extensibility/30-details-summary.md',
      },
      { text: 'Form Fields', link: './extensibility/40-form-fields.md' },
      {
        text: 'List and Details Widgets',
        link: './extensibility/50-list-and-details-widgets.md',
      },
      { text: 'Form Widgets', link: './extensibility/60-form-widgets.md' },
      {
        text: 'Widget Injection',
        link: './extensibility/70-widget-injection.md',
      },
      {
        text: 'Custom Extensions',
        link: './extensibility/80-custom-extensions.md',
      },
      { text: 'Datasources', link: './extensibility/90-datasources.md' },
      { text: 'JSONata', link: './extensibility/100-jsonata.md' },
      {
        text: 'JSONata Preset Functions',
        link: './extensibility/101-jsonata-preset-functions.md',
      },
      { text: 'Presets', link: './extensibility/110-presets.md' },
      {
        text: 'Resource Extensions',
        link: './extensibility/120-resource-extensions.md',
      },
      {
        text: 'Additional Sections Resources',
        link: './extensibility/130-additional-sections-resources.md',
      },
      {
        text: 'Static Extensions',
        link: './extensibility/140-static-extensions.md',
      },
      { text: 'Translations', link: './extensibility/150-translations.md' },
    ],
  },
  {
    text: 'Troubleshooting Guides',
    link: './troubleshooting-guides/README.md',
    collapsed: true,
    items: [
      {
        text: 'Cannot Connect to Cluster',
        link: './troubleshooting-guides/cannot-connect-to-cluster.md',
      },
      {
        text: 'Cannot Find Resource',
        link: './troubleshooting-guides/cannot-find-resource.md',
      },
      {
        text: 'Connectivity Issues K3d',
        link: './troubleshooting-guides/connectivity-issues-k3d.md',
      },
      { text: 'SSL Issue', link: './troubleshooting-guides/ssl-issue.md' },
    ],
  },
  {
    text: 'Technical Reference',
    link: './technical-reference/README.md',
    collapsed: true,
    items: [
      {
        text: 'Configuration',
        link: './technical-reference/configuration.md',
      },
      {
        text: 'Feature Flags',
        link: './technical-reference/feature-flags.md',
      },
    ],
  },
];
