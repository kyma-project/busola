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

// LIBRARIES
const libraries = ['shared'];

// Installing libraries
libraries.forEach(lib => {
  gulp.task(`${lib}:install`, async () => {
    const packageName = path.resolve(__dirname, `./${lib}`);
    await install(packageName);
  });
});
gulp.task(
  'install:libraries',
  gulp.parallel(libraries.map(lib => `${lib}:install`)),
);

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

// CI libraries
libraries.forEach(lib => {
  gulp.task(`${lib}:ci`, async () => {
    const packageName = path.resolve(__dirname, `./${lib}`);
    await ci(packageName);
  });
});
gulp.task('ci:libraries', gulp.parallel(libraries.map(lib => `${lib}:ci`)));

const ci = async dir => {
  log.info(
    `Clean installing dependencies of ${clc.magenta(
      dir.replace(__dirname, ''),
    )}`,
  );

  try {
    await exec(`npm ci`, {
      cwd: dir,
    });
  } catch (err) {
    log.error(`Failed installing dependencies of ${dir}`);
    throw err;
  }
};

// Building libraries
libraries.forEach(lib => {
  gulp.task(`${lib}:build`, async () => {
    const packageName = path.resolve(__dirname, `./${lib}`);
    await build(packageName);
  });
});
gulp.task('build:libraries', gulp.series(libraries.map(lib => `${lib}:build`)));

const build = async dir => {
  log.info(`Building library ${clc.magenta(dir.replace(__dirname, ''))}`);

  try {
    await exec(`npm run build`, {
      cwd: dir,
    });
  } catch (err) {
    log.error(`Failed building library ${dir}`);
    throw err;
  }
};

// Watching libraries
gulp.task('watch:libraries', () => {
  libraries.forEach(lib => {
    gulp.watch([`./${lib}/src/**/*`], gulp.parallel(`${lib}:build`));
  });
});

// APPS
const apps = ['core', 'core-ui', 'service-catalog-ui', 'backend'];

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
  { path: 'sap_horizon/css_variables.css', name: 'horizon' },
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
        .pipe(gulp.dest(`./core-ui/public/themes/@sap-theming`))
        .pipe(gulp.dest(`./service-catalog-ui/public/themes/@sap-theming`)),
    ),
  );
});
