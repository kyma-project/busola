import jsyaml from 'js-yaml';

export async function loadPVFile() {
  return await new Promise(resolve => {
    cy.fixture('test-persistent-volumes.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}

export async function loadPV(namespaceName) {
  // const PV =;

  return await loadPVFile();
}
