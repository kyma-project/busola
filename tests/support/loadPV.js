import jsyaml from 'js-yaml';

export async function loadPV(name) {
  const PV = await new Promise(resolve => {
    cy.fixture('test-persistent-volumes.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
  PV.metadata.name = name;

  return PV;
}
