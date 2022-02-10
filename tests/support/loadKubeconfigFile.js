import jsyaml from 'js-yaml';

export async function loadKubeconfig() {
  return new Promise(resolve => {
    cy.fixture('kubeconfig.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}
