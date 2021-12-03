import jsyaml from 'js-yaml';

export async function loadKubeconfig() {
  return new Promise(resolve => {
    cy.fixture('kubeconfig.yaml').then(fileContent =>
      resolve(jsyaml.load(fileContent)),
    );
  });
}

export async function loadMultipleContextKubeconfig() {
  const kubeconfig = await loadKubeconfig();
  const newContext = { ...kubeconfig?.contexts[0] };
  newContext.name += '-new';
  const newKubeconfig = {
    ...kubeconfig,
    contexts: [...kubeconfig.contexts, newContext],
  };
  return newKubeconfig;
}
