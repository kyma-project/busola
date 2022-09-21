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
gulp.task('copy-themes', function() {
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

gulp.task('pack-extensions', function() {
  const convertYamlToObject = yamlString => {
    return jsyaml.load(yamlString, { json: true });
  };

  const loadExtensions = through2.obj(function(file, _, cb) {
    const { data } = jsyaml.load(file.contents.toString());
    file.contents = Buffer.from(
      jsyaml.dump(mapValues(data, convertYamlToObject)),
    );
    cb(null, file);
  });

  const intoConfigMap = through2.obj(function(file, _, cb) {
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
  extensions.yaml: |-`;

    file.contents = Buffer.from(`${configMapHeader}
${extensions}
  `);
    cb(null, file);
  });

  return gulp
    .src('extensions/**/*.yaml')
    .pipe(loadExtensions)
    .pipe(
      concat('builtin-resource-extensions.configmap.yaml', {
        newLine: '---\n',
      }),
    )
    .pipe(intoConfigMap)
    .pipe(gulp.dest('./resources/web/'));

  // return gulp
  //   .src('extensions/**/*.yaml')
  //   .pipe(loadExtensions)
  //   .pipe(
  //     concat('extensions.yaml', {
  //       newLine: '---\n',
  //     }),
  //   )
  //   .pipe(gulp.dest('./core/src/assets/extensions'))
  //   .pipe(intoConfigMap)
  //   .pipe(rename('builtin-resource-extensions.configmap.yaml'))
  //   .pipe(gulp.dest('./resources/web/'));
});
