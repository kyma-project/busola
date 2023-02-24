import path from 'path';
import { glob } from 'glob';

function asyncGlob(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, matches) => {
      if (err) reject(err);
      else resolve(matches);
    });
  });
}

/**
 * @see https://webpack.js.org/contribute/writing-a-loader
 * @param {string} source a json string
 * @returns {string} a json string
 */
export default async function multiFile(source) {
  const def = JSON.parse(source);
  const result = await Promise.all(
    def.files.map(async pattern => {
      const matches = await asyncGlob(pattern, {
        cwd: path.dirname(this.resourcePath),
      });
      return Promise.all(
        matches.map(match => {
          const filePath = path.resolve(path.dirname(this.resourcePath), match);
          this.addDependency(filePath);
          return this.importModule(filePath);
        }),
      );
    }),
  );
  return JSON.stringify(result.flat());
}
