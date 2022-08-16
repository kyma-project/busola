import jsonata from 'jsonata';
import { getPerResourceDefs } from 'shared/helpers/getResourceDefs';

export function getResourceGraphConfig(t, context) {
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
