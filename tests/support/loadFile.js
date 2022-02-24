import jsyaml from 'js-yaml';

export async function loadFile(FILE_NAME, single = true) {
  const load = single ? jsyaml.load : jsyaml.loadAll;
  return await new Promise(resolve => {
    cy.fixture(FILE_NAME).then(fileContent => resolve(load(fileContent)));
  });
}
