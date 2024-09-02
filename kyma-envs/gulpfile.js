const fetch = require('node-fetch');
const URL = require('url').URL;
const fs = require('fs');
const jsyaml = require('js-yaml');

const gulp = require('gulp');
const through2 = require('through2');
const concat = require('gulp-concat');
const clean = require('gulp-clean');

const mapValues = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );

const isUrl = str => {
  try {
    return !!new URL(str);
  } catch {
    return false;
  }
};

const loadExtensions = through2.obj(async function(extensionsFile, _, cb) {
  const list = JSON.parse(extensionsFile.contents.toString());

  const readLocalFile = filePath =>
    new Promise((resolve, reject) =>
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            contents: data.toString(),
            name: filePath.substr(filePath.lastIndexOf('/') + 1),
          });
        }
      }),
    );

  const readExternalFile = fileAddress =>
    fetch(fileAddress)
      .then(res => res.text())
      .then(contents => ({
        contents,
        name: fileAddress.substr(fileAddress.lastIndexOf('/') + 1),
      }));

  const requests = list.map(({ source }) => {
    if (isUrl(source)) {
      return readExternalFile(source);
    } else {
      if (fs.lstatSync(source).isDirectory()) {
        return fs
          .readdirSync(source)
          .map(name => readLocalFile(source + '/' + name));
      } else {
        return readLocalFile(source);
      }
    }
  });

  const results = await Promise.all(requests.flat());

  results.forEach(({ contents, name }) => {
    const file = extensionsFile.clone();
    file.contents = Buffer.from(contents);
    file.path = name;
    this.push(file);
  });
  cb();
});

const loadPreparedExtensions = through2.obj((file, _, cb) => {
  const convertYamlToObject = yamlString => {
    return jsyaml.load(yamlString, { json: true });
  };

  const checkExtensionVersion = metadata => {
    const SUPPORTED_VERSIONS = ['0.4', '0.5'];

    const version = metadata.labels?.['busola.io/extension-version'];
    if (!SUPPORTED_VERSIONS.includes(version)) {
      throw Error(
        `Unsupported version "${version}" for ${metadata.name} extension.`,
      );
    }
  };

  const { data, metadata } = jsyaml.load(file.contents.toString());

  checkExtensionVersion(metadata);

  file.contents = Buffer.from(
    jsyaml.dump(mapValues(data, convertYamlToObject)),
  );
  cb(null, file);
});

gulp.task('clean-extensions', () => {
  const env = process.env.ENV;
  return gulp
    .src(`environments/tmp/${env}/extensions-local`, {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean({ force: true }));
});

gulp.task('get-extensions', () => {
  return gulp
    .src(`environments/${process.env.ENV}/extensions.json`)
    .pipe(loadExtensions)
    .pipe(gulp.dest(`tmp/${process.env.ENV}/extensions-local/-/-`)); // gulp strips the 2 last path components?
});

gulp.task('pack-extensions', () => {
  const env = process.env.ENV;
  return gulp
    .src(`tmp/${env}/extensions-local/**/*.yaml`)
    .pipe(loadPreparedExtensions)
    .pipe(
      concat('extensions.yaml', {
        newLine: '---\n',
      }),
    )
    .pipe(gulp.dest(`build/${env}/extensions`));
});

gulp.task('clean-statics', () => {
  const env = process.env.ENV;
  return gulp
    .src(`environments/tmp/${env}/extensions/statics-local`, {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

gulp.task('get-statics', () => {
  return gulp
    .src(`environments/${process.env.ENV}/statics.json`)
    .pipe(loadExtensions)
    .pipe(gulp.dest(`tmp/${process.env.ENV}/statics-local/-/-`)); // gulp strips the 2 last path components?
});

gulp.task('pack-statics', () => {
  const env = process.env.ENV;
  return gulp
    .src(`tmp/${env}/statics-local/**/*.yaml`)
    .pipe(loadPreparedExtensions)
    .pipe(
      concat('statics.yaml', {
        newLine: '---\n',
      }),
    )
    .pipe(gulp.dest(`build${env}/extensions`));
});

gulp.task('clean-wizards', () => {
  const env = process.env.ENV;
  return gulp
    .src(`environments/tmp/${env}/extensions/wizards-local`, {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

gulp.task('get-wizards', () => {
  return gulp
    .src(`environments/${process.env.ENV}/wizards.json`)
    .pipe(loadExtensions)
    .pipe(gulp.dest(`tmp/${process.env.ENV}/wizards-local/-/-`)); // gulp strips the 2 last path components?
});

gulp.task('pack-wizards', () => {
  const env = process.env.ENV;
  return gulp
    .src(`tmp/${env}/wizards-local/**/*.yaml`)
    .pipe(loadPreparedExtensions)
    .pipe(
      concat('wizards.yaml', {
        newLine: '---\n',
      }),
    )
    .pipe(gulp.dest(`build/${env}/extensions`));
});
