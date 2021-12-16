import jsyaml from 'js-yaml';
const RANDOM_NUMBER = Math.random()
  .toString()
  .substr(2, 4);

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
  newIngress.spec.rules[0].host = `${RANDOM_NUMBER}${newIngress.spec.rules[0].host}`;
  newIngress.spec.rules[0].http.paths[0].path = `${newIngress.spec.rules[0].http.paths[0].path}${RANDOM_NUMBER}`;
  newIngress.spec.rules[0].http.paths[1].path = `${newIngress.spec.rules[0].http.paths[1].path}${RANDOM_NUMBER}`;

  return newIngress;
}
