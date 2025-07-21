import fetch from 'node-fetch';
import { URL } from 'url';
import { readFile, lstatSync, readdirSync } from 'fs';
import { load, dump } from 'js-yaml';

import { task, src, dest } from 'gulp';
import { obj as _obj } from 'through2';
import concat from 'gulp-concat';
import clean from 'gulp-clean';

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

const loadExtensions = _obj(async function(extensionsFile, _, cb) {
  const list = JSON.parse(extensionsFile.contents.toString());

  const readLocalFile = filePath =>
    new Promise((resolve, reject) =>
      readFile(filePath, (err, data) => {
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
      if (lstatSync(source).isDirectory()) {
        return readdirSync(source)
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

const loadPreparedExtensions = _obj((file, _, cb) => {
  const convertYamlToObject = yamlString => {
    return load(yamlString, { json: true });
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

  const { data, metadata } = load(file.contents.toString());

  checkExtensionVersion(metadata);

  file.contents = Buffer.from(
    dump(mapValues(data, convertYamlToObject)),
  );
  cb(null, file);
});

task('clean-extensions', () => {
  const env = process.env.ENV;
  return src(`environments/temp/${env}/extensions-local`, {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean({ force: true }));
});

task('get-extensions', () => {
  return src(`environments/${process.env.ENV}/extensions.json`)
    .pipe(loadExtensions)
    .pipe(dest(`temp/${process.env.ENV}/extensions-local/-/-`)); // gulp strips the 2 last path components?
});

task('pack-extensions', () => {
  const env = process.env.ENV;
  return src(`temp/${env}/extensions-local/**/*.yaml`)
    .pipe(loadPreparedExtensions)
    .pipe(
      concat('extensions.yaml', {
        newLine: '---\n',
      }),
    )
    .pipe(dest(`build/${env}/extensions`));
});

task('clean-statics', () => {
  const env = process.env.ENV;
  return src(`environments/temp/${env}/extensions/statics-local`, {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

task('get-statics', () => {
  return src(`environments/${process.env.ENV}/statics.json`)
    .pipe(loadExtensions)
    .pipe(dest(`temp/${process.env.ENV}/statics-local/-/-`)); // gulp strips the 2 last path components?
});

task('pack-statics', () => {
  const env = process.env.ENV;
  return src(`temp/${env}/statics-local/**/*.yaml`)
    .pipe(loadPreparedExtensions)
    .pipe(
      concat('statics.yaml', {
        newLine: '---\n',
      }),
    )
    .pipe(dest(`build/${env}/extensions`));
});

task('clean-wizards', () => {
  const env = process.env.ENV;
  return src(`environments/temp/${env}/extensions/wizards-local`, {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

task('get-wizards', () => {
  return src(`environments/${process.env.ENV}/wizards.json`)
    .pipe(loadExtensions)
    .pipe(dest(`temp/${process.env.ENV}/wizards-local/-/-`)); // gulp strips the 2 last path components?
});

task('pack-wizards', () => {
  const env = process.env.ENV;
  return src(`temp/${env}/wizards-local/**/*.yaml`)
    .pipe(loadPreparedExtensions)
    .pipe(
      concat('wizards.yaml', {
        newLine: '---\n',
      }),
    )
    .pipe(dest(`build/${env}/extensions`));
});
