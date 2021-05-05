let cluster;

function saveInitParams(params) {
  const defaultParams = {
    config: {
      disabledNavigationNodes: '',
      systemNamespaces: 'istio-system knative-eventing knative-serving kube-public kube-system kyma-backup kyma-installer kyma-integration kyma-system natss kube-node-lease kubernetes-dashboard serverless-system'.split(
        ' '
      ),
    },
    features: {
      bebEnabled: false,
    },
  };
  localStorage.setItem(
    'busola.clusters',
    JSON.stringify({ ...params, ...defaultParams })
  );
  window.location = '/';
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

function toggleConfigForm(isVisible) {
  document.querySelector('#textarea-form').style.display = isVisible
    ? 'block'
    : 'none';
  document.querySelector('#file-input').style.display = isVisible
    ? 'flex'
    : 'none';
}

function toggleBackButton(isVisible) {
  document.querySelector('#back-button').style.display = isVisible
    ? 'block'
    : 'none';
}

function toggleError(isVisible) {
  document.querySelector('#error').style.display = isVisible ? 'block' : 'none';
}

function displayInitialView() {
  toggleError(false);
  toggleOIDCForm(false);
  toggleConfigForm(true);
  toggleBackButton(false);
}
function handleKubeconfigAdded(kubeconfig) {
  try {
    cluster = {
      name: kubeconfig.clusters[0].name,
      server: kubeconfig.clusters[0].cluster.server,
      'certificate-authority-data':
        kubeconfig.clusters[0].cluster['certificate-authority-data'],
    };
    const user = kubeconfig.users[0].user;
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
      toggleConfigForm(false);
      toggleBackButton(true);
    }
  } catch (e) {
    toggleError(true);
    console.warn(e);
  }
}

async function onKubeconfigPasted(kubeconfig, type) {
  displayInitialView();
  try {
    const kubeconfigParsed = jsyaml.load(kubeconfig);
    handleKubeconfigAdded(kubeconfigParsed, 'textarea');
  } catch (e) {
    toggleError(true);
    console.warn(e);
  }
}

async function onKubeconfigUploaded(file) {
  document.querySelector('#file-name').textContent = file.name;
  displayInitialView();
  try {
    const kubeconfigParsed = jsyaml.load(await readFile(file));
    handleKubeconfigAdded(kubeconfigParsed, 'file');
  } catch (e) {
    toggleError(true);
    console.warn(e);
  }
}

function onOidcFormSubmit(e) {
  e.preventDefault();
  const issuerUrlValue = document.querySelector('#issuer-url').value;
  const issuerUrl = issuerUrlValue.replace(/\/$/, '');

  const auth = {
    issuerUrl,
    clientId: document.querySelector('#client-id').value,
    scope: document.querySelector('#scopes').value,
    responseType: 'id_token',
  };
  saveInitParams({ cluster, auth });
}

function onTextareaFormSubmit(e) {
  e.preventDefault();
  const kubeconfig = document.querySelector('#textarea-kubeconfig').value;
  onKubeconfigPasted(kubeconfig, true);
}
function onGoBack(e) {
  e.preventDefault();
  displayInitialView();
}

document
  .querySelector('#upload-kubeconfig')
  .addEventListener('change', (e) => onKubeconfigUploaded(e.target.files[0]));
document
  .querySelector('#oidc-form')
  .addEventListener('submit', onOidcFormSubmit);
document
  .querySelector('#textarea-form')
  .addEventListener('submit', onTextareaFormSubmit);
document.querySelector('#back-button').addEventListener('click', onGoBack);

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
