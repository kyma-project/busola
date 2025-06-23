const fs = require('fs');
const jsyaml = require('js-yaml');
const merge = require('lodash.merge');
const path = require('path');

function getConfigDir() {
  const environment = process.env.ENVIRONMENT;
  if (environment) {
    return path.join('environments', environment);
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
      configYaml = jsyaml.load(
        fs.readFileSync('./' + configDir + '/config.yaml'),
      );

      config = merge(config, configYaml).config;
    }

    if (fs.existsSync('./config/config.yaml')) {
      const configFromMap = jsyaml.load(
        fs.readFileSync('./config/config.yaml'),
      );
      config = merge(config, configFromMap).config;
    }
  } catch (e) {
    console.warn('Error loading config:', e?.message || e);
  }

  return config;
}

module.exports = loadConfig();
