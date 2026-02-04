export default [
  { text: 'Command Palette', link: './01-20-command-palette.md' },
  { text: 'Extensibility', link: './01-30-extensibility.md' },
  {
    text: 'Deploying and Accessing Busola in a Kubernetes Cluster',
    link: './01-40-deploy-access-kubernetes.md',
  },
  {
    text: 'Deploying and Accessing Busola in k3d',
    link: './01-41-deploy-access-k3d.md',
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
