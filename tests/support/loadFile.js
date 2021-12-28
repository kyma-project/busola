import jsyaml from 'js-yaml';

export async function loadFile(FILE_NAME) {
  return await new Promise(resolve => {
    cy.fixture(FILE_NAME).then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}

export async function loadRandomCRD(crdPluralName, crdName) {
  const CRD = await loadFile('test-customresourcedefinisions.yaml');
  const newCRD = { ...CRD };

  newCRD.spec.group = `${crdPluralName}.example.com`;
  newCRD.metadata.name = crdName;
  newCRD.spec.names.plural = crdPluralName;

  return newCRD;
}

export async function loadSubscription(NAMESPACE) {
  const SUB = await loadFile('test-eventsubscription.yaml');
  const newSUB = { ...SUB };
  newSUB.spec.sink = `http://in-cluster-eventing-publisher.${NAMESPACE}.svc.cluster.local`;
  return newSUB;
}

export async function loadCRInstance(crdPluralName) {
  const CR = await loadFile('test-custom-resource-instance.yaml');

  const newCR = { ...CR };
  newCR.metadata.namespace = Cypress.env('NAMESPACE_NAME');
  newCR.apiVersion = `${crdPluralName}.example.com/v1`;
  return newCR;
}
