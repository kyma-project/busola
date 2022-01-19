import jsyaml from 'js-yaml';

export async function loadPV() {
  return await new Promise(resolve => {
    cy.fixture('test-persistent-volumes.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}
