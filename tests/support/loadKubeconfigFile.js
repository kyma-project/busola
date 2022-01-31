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

  const newUser = { ...kubeconfig?.users[0] };
  newUser.name += '-new';
  newUser.user.cluster = newUser.name;

  const oldContext = { ...kubeconfig?.contexts[0] };
  oldContext.name += '-old';

  const newContext = { ...kubeconfig?.contexts[0] };
  newContext.name += '-new';
  newContext.context.cluster = newCluster.name;
  newContext.context.user = newUser.name;

  const newKubeconfig = {
    ...kubeconfig,
    'current-context': oldContext.name,
    contexts: [oldContext, newContext],
    clusters: [...kubeconfig.clusters, newCluster],
    users: [...kubeconfig.users, newUser],
  };
  return newKubeconfig;
}
