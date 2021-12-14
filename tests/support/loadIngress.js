import jsyaml from 'js-yaml';

export async function loadIngress() {
  return await new Promise(resolve => {
    cy.fixture('test-ingress.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}

export async function loadRandomIngress(name, namespace) {
  const Ingress = await loadIngress();
  const newIngress = { ...Ingress };

  newIngress.metadata.name = name;
  newIngress.metadata.namespace = namespace;

  return newIngress;
}
