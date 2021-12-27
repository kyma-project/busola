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
