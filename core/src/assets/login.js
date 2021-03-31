let cluster;

function saveInitParams(params) {
    const defaultParams = {
        config: {
            disabledNavigationNodes: '',
            systemNamespaces: 'istio-system knative-eventing knative-serving kube-public kube-system kyma-backup kyma-installer kyma-integration kyma-system natss kube-node-lease kubernetes-dashboard serverless-system'.split(
            ' ',
            ),
        },
        features: {
            bebEnabled: false,
        },
    };
    localStorage.setItem('busola.init-params', JSON.stringify({...params, ...defaultParams}));
    window.location = '/home';
}
  
function readFile(file) {
    return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsText(file);
});
}

function toggleOIDCForm(isVisible) {
    document.querySelector('#oidc-form').style.display = isVisible ? 'block' : 'none';
}

function toggleError(isVisible) {
    document.querySelector('#error').style.display = isVisible ? 'block' : 'none';
}

async function onKubeconfigUploaded(e) {
    toggleError(false);
    toggleOIDCForm(false);
    try {
        const kk = jsyaml.load(await readFile(e.target.files[0]));
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
            
    } catch(e) {
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
    saveInitParams({ cluster, auth })
}

document.querySelector('#upload-kubeconfig').addEventListener('change', onKubeconfigUploaded)
document.querySelector('#oidc-form').addEventListener('submit', onOidcFormSubmit)