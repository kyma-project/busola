import jsonata from 'jsonata';
import { useEffect } from 'react';
import { getPerResourceDefs } from 'shared/helpers/getResourceDefs';

export function useAddStyle({ styleId }) {
  useEffect(
    () => () => {
      const element = document.getElementById(styleId);
      if (element) {
        document.head.removeChild(element);
      }
    },
    [styleId],
  );

  return rule => {
    let element = document.getElementById(styleId);
    if (!element) {
      element = document.createElement('style');
      element.id = styleId;
      document.head.appendChild(element);
    }
    element.sheet.insertRule(rule);
  };
}

export function getResourceGraphConfig(t, context, addStyle) {
  const builtinResourceDefs = getPerResourceDefs(
    'resourceGraphConfig',
    t,
    context,
  );

  const builtinResourceGraphConfig = Object.fromEntries(
    Object.entries(builtinResourceDefs).map(([kind, graphConfig]) => [
      kind,
      {
        resource: { kind },
        ...graphConfig,
      },
    ]),
  );

  const customResourcesGraphConfig = Object.fromEntries(
    context.customResources
      // gather necessary fields
      .map(cR => ({
        resource: cR.general?.resource,
        dataSources: cR.dataSources,
        resourceGraph: cR.details?.resourceGraph,
      }))
      // all fields are required
      .filter(o => Object.values(o).every(Boolean))
      .map(({ resourceGraph, resource, dataSources }) => {
        if (resourceGraph.colorVariant) {
          const className = resource.kind.toLowerCase();
          const cssVariable = `--sapChart_Sequence_${resourceGraph.colorVariant}`;
          addStyle(`#graph-area .node.${className} > polygon {
                    stroke: var(${cssVariable}) !important;
                  }`);
        }

        const config = {
          depth: resourceGraph.depth,
          resource: resource,
          // bring relations[].filter from "jsonata expression format" to "normal function format"
          relations: resourceGraph.dataSources
            .map(({ source }) => dataSources[source])
            .filter(Boolean)
            .map(relation => {
              const expression = jsonata(relation.filter);
              const filter = (originalResource, possiblyRelatedResource) => {
                expression.assign('root', originalResource);
                expression.assign('item', possiblyRelatedResource);
                return expression.evaluate();
              };

              return { ...relation, filter };
            }),
        };

        return [resource.kind, config];
      }),
  );

  return { ...builtinResourceGraphConfig, ...customResourcesGraphConfig };
}
