import jsyaml from 'js-yaml';

export async function loadHPA() {
  return await new Promise(resolve => {
    cy.fixture('test-HPA.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}

export async function loadRandomHPA(namespaceName) {
  const HPA = await loadHPA();
  const newHPA = { ...HPA };

  newHPA.metadata.namespace = namespaceName;

  return newHPA;
}
