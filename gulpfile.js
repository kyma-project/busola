const path = require('path');
const gulp = require('gulp');
const rename = require('gulp-rename');
const childProcess = require('child_process');
const log = require('fancy-log');
const clc = require('cli-color');
const { promisify } = require('util');

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
