import jsyaml from 'js-yaml';

export async function loadCRD() {
  return await new Promise(resolve => {
    cy.fixture('test-customresourcedefinisions.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}

export async function loadRandomCRD() {
  const CRD = await loadCRD();
  const random =
    'test-' +
    Math.random()
      .toString()
      .substr(2, 8);
  const name = random + '.stable.example.com';

  const newCRD = { ...CRD };
  newCRD.metadata.name = name;
  newCRD.spec.names.plural = random;

  return newCRD;
}
