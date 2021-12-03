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

  const newCluster = { ...kubeconfig?.clusters[0] };
  newCluster.name += '-new';

  const newContext = { ...kubeconfig?.contexts[0] };
  newContext.name += '-new';
  newContext.context.cluster = newCluster.name;

  const newKubeconfig = {
    ...kubeconfig,
    contexts: [...kubeconfig.contexts, newContext],
    clusters: [...kubeconfig.clusters, newCluster],
  };
  return newKubeconfig;
}
