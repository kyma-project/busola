import i18next from 'i18next';
import { config } from '../config';
import { loadExternalModule } from './loadExternalModule';
import { toSearchParamsString } from './../navigation/static-navigation-model';

export async function loadPlugins() {
  try {
    return (
      (
        await fetch(config.pluginsUrl + '/merged-manifest.json').then(r =>
          r.json(),
        )
      ).plugins || []
    );
  } catch (e) {
    console.warn('Cannot load plugins', e);
    return [];
  }
}

export function createPluginNodes(viewPlugins, scope, viewGroup) {
  return viewPlugins
    .flatMap(p =>
      p.createNavigationEntries({
        language: i18next.language,
        viewUrl: config.coreUIModuleUrl,
        scope,
        viewGroup,
        toSearchParamsString,
      }),
    )
    .filter(Boolean);
}

export async function loadViewPlugins(plugins) {
  const promises = plugins
    .filter(p => p.tags.includes('view'))
    .map(async p => {
      try {
        const viewModule = await loadExternalModule(p.path);
        return {
          ...p,
          createNavigationEntries: viewModule.createNavigationEntries,
        };
      } catch (e) {
        console.warn('Cannot load plugin', p?.name, e);
        return null;
      }
    });
  return (await Promise.all(promises)).filter(Boolean);
}
