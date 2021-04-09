let cluster;

function saveInitParams(params) {
  const defaultParams = {
    config: {
      disabledNavigationNodes: '',
      systemNamespaces:
        'istio-system knative-eventing knative-serving kube-public kube-system kyma-backup kyma-installer kyma-integration kyma-system natss kube-node-lease kubernetes-dashboard serverless-system',
    },
    features: {
      bebEnabled: false,
    },
  };
  localStorage.setItem(
    'busola.init-params',
    JSON.stringify({ ...params, ...defaultParams })
  );
  window.location = '/home';
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsText(file);
  });
}

function toggleOIDCForm(isVisible) {
  document.querySelector('#oidc-form').style.display = isVisible
    ? 'block'
    : 'none';
}

function toggleError(isVisible) {
  document.querySelector('#error').style.display = isVisible ? 'block' : 'none';
}

async function onKubeconfigUploaded(file) {
  document.querySelector('#file-name').textContent = file.name;
  toggleError(false);
  toggleOIDCForm(false);
  try {
    const kk = jsyaml.load(await readFile(file));
    cluster = {
      server: kk.clusters[0].cluster.server,
      'certificate-authority-data':
        kk.clusters[0].cluster['certificate-authority-data'],
    };
    const user = kk.users[0].user;
    const token = user.token;
    const clientCA = user['client-certificate-data'];
    const clientKeyData = user['client-key-data'];
    if (token || (clientCA && clientKeyData)) {
      saveInitParams({
        cluster,
        rawAuth: {
          idToken: token,
          'client-certificate-data': clientCA,
          'client-key-data': clientKeyData,
        },
      });
    } else {
      toggleOIDCForm(true);
    }
  } catch (e) {
    toggleError(true);
    console.warn(e);
  }
}

function onOidcFormSubmit(e) {
  e.preventDefault();
  const auth = {
    issuerUrl: document.querySelector('#issuer-url').value,
    clientId: document.querySelector('#client-id').value,
    scope: 'openid',
    responseType: 'id_token',
  };
  saveInitParams({ cluster, auth });
}

document
  .querySelector('#upload-kubeconfig')
  .addEventListener('change', (e) => onKubeconfigUploaded(e.target.files[0]));
document
  .querySelector('#oidc-form')
  .addEventListener('submit', onOidcFormSubmit);

const dropArea = document.querySelector('#file-input');
const dragOverClass = 'file-input-drag-over';
dropArea.addEventListener('dragenter', () =>
  dropArea.classList.add(dragOverClass)
);
dropArea.addEventListener('dragleave', () =>
  dropArea.classList.remove(dragOverClass)
);
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove(dragOverClass);
  onKubeconfigUploaded(e.dataTransfer.files[0]);
});
