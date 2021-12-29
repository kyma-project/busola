import jsyaml from 'js-yaml';

export async function loadCRD() {
  return await new Promise(resolve => {
    cy.fixture('test-customresourcedefinisions.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}

export async function loadRandomCRD(crdPluralName, crdName) {
  const CRD = await loadCRD();
  const newCRD = { ...CRD };

  newCRD.spec.group = `${crdPluralName}.example.com`;
  newCRD.metadata.name = crdName;
  newCRD.spec.names.plural = crdPluralName;

  return newCRD;
}

export async function loadCRInstance(crdPluralName) {
  const CR = await new Promise(resolve => {
    cy.fixture('test-custom-resource-instance.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
  const newCR = { ...CR };
  newCR.metadata.namespace = Cypress.env('NAMESPACE_NAME');
  newCR.apiVersion = `${crdPluralName}.example.com/v1`;
  return newCR;
}
