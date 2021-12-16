import jsyaml from 'js-yaml';

export async function loadDR() {
  return await new Promise(resolve => {
    cy.fixture('test-custom-destination-rule.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}

export async function loadRandomDR(drName, namespaceName) {
  const DR = await loadDR();
  const newDR = { ...DR };

  newDR.metadata.name = drName;
  newDR.metadata.namespace = namespaceName;

  return newDR;
}
