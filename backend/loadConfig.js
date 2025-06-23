const fs = require('fs');
const jsyaml = require('js-yaml');
const merge = require('lodash.merge');
const path = require('path');

function joinPaths(...paths) {
  const cleaned = paths.filter(Boolean).map(part => {
    while (part.startsWith('/')) part = part.slice(1);
    while (part.endsWith('/')) part = part.slice(0, -1);
    return part;
  });

  return path.join('.', ...cleaned);
}

function getConfigDir() {
  const environment = process.env.ENVIRONMENT;
  if (environment) {
    return joinPaths('environments', environment);
  }
  return '';
}

function loadConfig() {
  let config = {};

  try {
    const defaultConfig = jsyaml.load(
      fs.readFileSync('./settings/defaultConfig.yaml'),
    );

    config = defaultConfig.config;

    const configDir = getConfigDir();
    let configYaml = {};
    if (configDir) {
      configYaml = jsyaml.load(fs.readFileSync(configDir + '/config.yaml'));
      config = merge(config, configYaml).config;
    }
    console.log(configYaml);

    if (fs.existsSync('./config/config.yaml')) {
      const configFromMap = jsyaml.load(
        fs.readFileSync('./config/config.yaml'),
      );
      config = merge(config, configFromMap).config;
    }
  } catch (e) {
    console.error('Error loading config:', e?.message || e);
  }
  console.log(config);
  return config;
}

module.exports = loadConfig();
