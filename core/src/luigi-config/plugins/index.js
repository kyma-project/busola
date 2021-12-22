import i18next from 'i18next';
import { config } from '../config';
import { loadExternalModule } from './loadExternalModule';
import { toSearchParamsString } from './../navigation/static-navigation-model';
import * as jp from 'jsonpath';
import { reloadNavigation } from '../navigation/navigation-data-init';

const PLUGIN_SETTINGS_KEY = 'busola.plugins';
let busolaData = null; // todo

function loadPluginSettings() {
  return JSON.parse(localStorage.getItem(PLUGIN_SETTINGS_KEY)) || [];
}

function savePluginSettings(plugins) {
  localStorage.setItem(
    PLUGIN_SETTINGS_KEY,
    JSON.stringify(plugins.map(({ name, isEnabled }) => ({ name, isEnabled }))),
  );
}

// todo DRY
const resolvers = {
  //leave the structure for the future when we add new options
  apiGroup: (selector, data) =>
    data?.groupVersions.find(g => g.includes(selector.apiGroup)),
};

function resolveSelector(selector, data) {
  if (!resolvers[selector.type]) {
    throw Error('Unkown selector type ' + selector.type);
  } else {
    return resolvers[selector.type](selector, data);
  }
}

function resolvePluginStatus(plugin) {
  try {
    plugin.isActive =
      plugin.isEnabled &&
      plugin.selectors.every(selector => resolveSelector(selector, busolaData));
  } catch (e) {
    console.warn(e);
  }
}

export function uglySetPluginData(data) {
  busolaData = data;
}

export function refreshPlugins(plugins) {
  plugins.forEach(resolvePluginStatus);
}

export async function loadPlugins() {
  try {
    const settings = loadPluginSettings();
    return (
      (
        await fetch(config.pluginsUrl + '/merged-manifest.json').then(r =>
          r.json(),
        )
      ).plugins || []
    ).map(plugin => ({
      ...plugin,
      isEnabled: settings.find(p => p.name === plugin.name)?.isEnabled || false,
      isActive: resolvePluginStatus(plugin),
    }));
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
    .filter(p => p.isActive)
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

export const communicationEntries = {
  'busola.set-plugins': async ({ plugins }) => {
    savePluginSettings(plugins);
    refreshPlugins(plugins);
    await reloadNavigation();
  },
};
