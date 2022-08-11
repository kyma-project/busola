import jsonata from 'jsonata';
import pluralize from 'pluralize';
import { resources } from 'resources';

export function getResourceDefs(defType, t, context, key) {
  return resources
    .filter(resource => resource.resourceType === defType)
    .map(resource => {
      return resource[key](t, context);
    })
    .flat();
}

export function getPerResourceDefs(defType, t, context) {
  return Object.fromEntries(
    resources
      .filter(resource => !!resource[defType])
      .map(resource => {
        const kind = pluralize(resource.resourceType, 1);
        const value = resource[defType](t, context);
        return [kind, value];
      }),
  );
}

export function getResourceGraphConfig(t, context) {
  const builtinResourceGraphConfig = getPerResourceDefs(
    'resourceGraphConfig',
    t,
    context,
  );

  const customResourcesGraphConfig = Object.fromEntries(
    context.customResources
      .map(cR => ({
        kind: cR.general?.resource?.kind,
        resourceGraph: cR.resourceGraph,
      }))
      .filter(data => data.kind && data.resourceGraph)
      .map(cR => {
        const kind = cR.kind;
        const relation = {
          depth: cR.resourceGraph.depth,
          relations: Object.keys(cR.resourceGraph.matchers || {}).map(kind => ({
            kind,
          })),
          matchers: Object.fromEntries(
            Object.entries(cR.resourceGraph.matchers || {}).map(
              ([relatedKind, relationFormula]) => {
                const matchFn = (cR, relatedResource) => {
                  try {
                    const expression = jsonata(relationFormula);
                    expression.assign('current', cR);
                    expression.assign('item', relatedResource);
                    // console.log({
                    //   relationFormula,
                    //   cR,
                    //   relatedResource,
                    //   wynik: expression.evaluate(),
                    // });
                    return !!expression.evaluate();
                  } catch (e) {
                    console.warn(e);
                    return false;
                  }
                };
                return [relatedKind, matchFn];
              },
            ),
          ),
        };

        // for (const kind in cR.resourceGraph.matchers) {
        //   if (builtinResourceGraphConfig[kind]) {
        //     builtinResourceGraphConfig[kind].relations.push({ kind: cR.kind });
        //   }
        // }

        return [kind, relation];
      }),
  );

  // console.log({ ...builtinResourceGraphConfig, ...customResourcesGraphConfig });
  return { ...builtinResourceGraphConfig, ...customResourcesGraphConfig };
}
