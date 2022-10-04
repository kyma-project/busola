const path = require('path');
const gulp = require('gulp');
const rename = require('gulp-rename');
const childProcess = require('child_process');
const log = require('fancy-log');
const clc = require('cli-color');
const { promisify } = require('util');
const through2 = require('through2');
const jsyaml = require('js-yaml');
const { mapValues } = require('lodash');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const fetch = require('node-fetch');

const exec = promisify(childProcess.exec);

process.on('unhandledRejection', err => {
  throw err;
});

const install = async dir => {
  log.info(
    `Installing dependencies of ${clc.magenta(dir.replace(__dirname, ''))}`,
  );

  try {
    await exec(`npm install`, {
      cwd: dir,
    });
  } catch (err) {
    log.error(`Failed installing dependencies of ${dir}`);
    throw err;
  }
};

// APPS
const apps = ['core', 'core-ui', 'backend'];

// Installing apps
apps.forEach(app => {
  gulp.task(`${app}:install`, async () => {
    const packageName = path.resolve(__dirname, `./${app}`);
    await install(packageName);
  });
});
gulp.task('install:apps', gulp.parallel(apps.map(app => `${app}:install`)));

// THEMES

const THEMES = [
  { path: 'sap_fiori_3_hcb/css_variables.css', name: 'hcb' },
  { path: 'sap_fiori_3_dark/css_variables.css', name: 'dark' },
  { path: 'sap_fiori_3_hcw/css_variables.css', name: 'hcw' },
  { path: 'sap_fiori_3_light_dark/css_variables.css', name: 'light_dark' },
  { path: 'sap_fiori_3/css_variables.css', name: 'default' },
];
gulp.task('copy-themes', () => {
  return Promise.all(
    THEMES.map(({ path, name }) =>
      gulp
        .src(
          'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/' +
            path,
        )
        .pipe(rename(name + '.css'))
        .pipe(gulp.dest(`./core-ui/public/themes/@sap-theming`)),
    ),
  );
});

gulp.task('clean-extensions', () => {
  return gulp
    .src('extensions/downloads', { read: false, allowEmpty: true })
    .pipe(clean());
});

gulp.task('download-extensions', () => {
  const loadExtensions = through2.obj(async function(extensionsFile, _, cb) {
    const list = JSON.parse(extensionsFile.contents.toString());

    const requests = list.map(({ url }) =>
      fetch(url)
        .then(res => res.text())
        .then(contents => ({
          contents,
          name: url.substr(url.lastIndexOf('/') + 1),
        })),
    );

    const results = await Promise.all(requests);

    results.forEach(({ contents, name }) => {
      const file = extensionsFile.clone();
      file.contents = Buffer.from(contents);
      file.path = name;
      this.push(file);
    });
    cb();
  });

  return gulp
    .src('extensions/extensions.json')
    .pipe(loadExtensions)
    .pipe(gulp.dest('extensions/downloads/-')); // gulp strips the last path component
});

gulp.task('pack-extensions', () => {
  const convertYamlToObject = yamlString => {
    return jsyaml.load(yamlString, { json: true });
  };

  const checkExtensionVersion = metadata => {
    // also update Extensibility/migration.js
    const SUPPORTED_VERSIONS = ['0.4', '0.5'];

    const version = metadata.labels?.['busola.io/extension-version'];
    if (!SUPPORTED_VERSIONS.includes(version)) {
      throw Error(
        `Unsupported version ${clc.magenta(version)} for ${clc.magenta(
          metadata.name,
        )} extension.`,
      );
    }
  };

  const loadExtensions = through2.obj((file, _, cb) => {
    const { data, metadata } = jsyaml.load(file.contents.toString());

    checkExtensionVersion(metadata);

    file.contents = Buffer.from(
      jsyaml.dump(mapValues(data, convertYamlToObject)),
    );
    cb(null, file);
  });

  const intoConfigMap = through2.obj((file, _, cb) => {
    const addIndent = str =>
      str
        .split('\n')
        .map(s => `    ${s}`)
        .join('\n');

    const extensions = addIndent(file.contents.toString());

    const configMapHeader = `kind: ConfigMap
apiVersion: v1
metadata:
  name: busola-builtin-resource-extensions
  labels:
    app.kubernetes.io/name: busola-builtin-resource-extensions
    busola.io/extension: builtin-resources
data:
  extensions.yaml: |-
`;

    file.contents = Buffer.from(configMapHeader + extensions);
    cb(null, file);
  });

  return gulp
    .src('extensions/**/*.yaml')
    .pipe(loadExtensions)
    .pipe(
      concat('extensions.yaml', {
        newLine: '---\n',
      }),
    )
    .pipe(gulp.dest('core/src/assets/extensions'))
    .pipe(rename('builtin-resource-extensions.configmap.yaml'))
    .pipe(intoConfigMap)
    .pipe(gulp.dest('resources/extensions-patch/'));
});
