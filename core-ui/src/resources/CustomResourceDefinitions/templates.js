import * as jp from 'jsonpath';

const convert = (arg, currentPath, spec) => {
  switch (arg?.type) {
    case 'object':
      // This version will only show the required fields
      if (arg.properties && arg.required) {
        arg.required.forEach(key => {
          const localPath = `${currentPath}.${key}`;
          jp.value(spec, localPath, null);
          convert(arg.properties[key], localPath, spec);
        });
      }
      // This is an alternative version that will list all the spec properties
      // if (arg.properties) {
      //   Object.entries(arg.properties).forEach(([key, value]) => {
      //     const localPath = `${currentPath}.${key}`;
      //     jp.value(spec, localPath, null);
      //     convert(value, localPath, spec);
      //   });
      //   break;
      // }
      // jp.value(spec, currentPath, {});
      break;
    case 'array':
      jp.value(spec, currentPath, []);
      convert(arg.items, `${currentPath}[0]`, spec);
      break;
    case 'string':
      jp.value(spec, currentPath, '');
      break;
    case 'number':
    case 'integer':
      jp.value(spec, currentPath, 0);
      break;
    case 'boolean':
      jp.value(spec, currentPath, false);
      break;
    case 'null':
      jp.value(spec, currentPath, null);
      break;
    case 'x-kubernetes-int-or-string':
      jp.value(spec, currentPath, 'int-or-string');
      break;
    default:
      break;
  }
  return spec;
};

export function createTemplate(crd) {
  const spec = {};
  const currentVersion = crd.spec.versions.find(ver => ver.storage);

  return {
    apiVersion: `${crd.spec.group}/${currentVersion.name}`,
    kind: crd.spec.names.kind,
    metadata: {
      name: '',
      namespace: crd.spec.scope === 'Namespaced' ? 'default' : undefined,
    },
    spec:
      convert(
        currentVersion.schema?.openAPIV3Schema?.properties?.spec,
        '$',
        spec,
      ) || {},
  };
}

export function createCustomResourceDefinitionsTemplate(namespace) {
  return {
    apiVersion: 'apiextensions.k8s.io/v1',
    kind: 'CustomResourceDefinition',
    metadata: {
      name: '',
    },
    spec: {
      group: '',
      scope: namespace ? 'Namespaced' : 'Cluster',
      versions: [
        {
          name: '',
          served: true,
          storage: true,
          schema: {
            openAPIV3Schema: {
              type: {},
              properties: {
                spec: {
                  type: {},
                  properties: {
                    cronSpec: {
                      type: '',
                    },
                    image: {
                      type: '',
                    },
                    replicas: {
                      type: 1,
                    },
                  },
                },
              },
            },
          },
        },
      ],
      names: {
        plural: '',
        singular: '',
        kind: '',
        shortNames: [''],
        categories: [''],
      },
    },
  };
}
