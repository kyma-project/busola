import jsyaml from 'js-yaml';

export function loadFile(FILE_NAME, single = true) {
  const load = single ? jsyaml.load : jsyaml.loadAll;
  return new Promise(resolve => {
    cy.fixture(FILE_NAME).then(fileContent => resolve(load(fileContent)));
  });
}

function parseYamlToJs(content) {
  let object = null;
  try {
    object = jsyaml.load(content);
  } catch (e) {
    const message = 'A jsyaml.load() call failed, attempting jsyaml.loadAll()';
    cy.log(e, message);
    console.log(e, message);
  }
  if (!object) {
    try {
      object = jsyaml.loadAll(content);
    } catch (e) {
      cy.log(e);
      console.log(e);
    }
  }
  return object;
}

async function loadFiles(...fileNames) {
  const getAFileFromDisk = fileName =>
    new Promise(resolve =>
      cy.fixture(fileName).then(content => resolve(parseYamlToJs(content))),
    );
  const filesContent = await Promise.all(fileNames.map(getAFileFromDisk));

  return filesContent.flat();
}

Cypress.Commands.add('loadFiles', (...fileNames) => {
  cy.log('Load Files');
  return cy.wrap(loadFiles(...fileNames));
});
