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

  newCRD.metadata.name = crdName;
  newCRD.spec.names.plural = crdPluralName;

  return newCRD;
}
