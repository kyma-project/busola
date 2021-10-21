import { randomNameGenerator } from 'react-shared';

export function createFunctionTemplate(namespace) {
  const name = randomNameGenerator();
  return {
    apiVersion: 'serverless.kyma-project.io/v1alpha1',
    kind: 'Function',
    metadata: {
      name,
      namespace,
      labels: {
        'app.kubernetes.io/name': name,
      },
    },
    spec: {
      runtime: 'nodejs14',
      type: '',
    },
  };
}

const helloWorldJsSource = `module.exports = {
  main: function (event, context) {
    return "Hello World!";
  }
}`;
const helloWorldJsDeps = {
  name: 'hello-world',
  version: '1.0.0',
  dependencies: {},
};

const helloWorldPythonSource = `def main(event, context):
    return "Hello World"`;

const eventJsSource = `const fetch = require('node-fetch');
module.exports = { 
  main: async function (event, context) {
    const cloudEvent = {
    'ce-type': event['ce-type'] || '',
    'ce-source': event['ce-source'],
    'ce-eventtypeversion': event['ce-eventtypeversion'] || '',
    'ce-specversion': event['ce-specversion'] || '',
    'ce-id': event['ce-id'] || '',
    'ce-time': event['ce-time'] || ''
    };
    const traceHeaders = {
      'x-request-id': event.extensions.request.headers['x-request-id'] || '',
      'x-b3-traceid': event.extensions.request.headers['x-b3-traceid'] || '',
      'x-b3-spanid': event.extensions.request.headers['x-b3-spanid'] || '',
      'x-b3-parentspanid': event.extensions.request.headers['x-b3-parentspanid'] || '',
      'x-b3-sampled': event.extensions.request.headers['x-b3-sampled'] || '',
      'x-b3-Flags': event.extensions.request.headers['x-b3-Flags'] || '',
      'x-ot-span-context': event.extensions.request.headers['x-ot-span-context'] || ''
    };
    console.log(\`cloudEvent: \${JSON.stringify(cloudEvent)}\`);
    console.log(\`traceHeaders: \${JSON.stringify(traceHeaders)}\`);
    console.log(\`Event data: \${JSON.stringify(event.data)}\`);
    if(event.data.orderCode) {
      let orderUrl = \`\${process.env.GATEWAY_URL}/test/orders/\${encodeURIComponent(event.data.orderCode)}\`
      const response =  await fetch(orderUrl).then(res => res.json());
      console.log(\`Feched data GATEWAY_URL: \${JSON.stringify(response)}\`);
      return response;
    } else {
      const url = process.env['GATEWAY_URL']+event.extensions.request.originalUrl;
      console.log(\`Feched url: \${url}\`);
      return await fetch(url).then(res => res.json())
    }
  }
}`;
const eventJsDeps = {
  name: 'event-tester',
  version: '1.0.0',
  dependencies: {
    'node-fetch': 'latest',
  },
};

const htmlJsSource = `
const content = \`
<div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <!-- Heroicon name: outline/exclamation -->
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Your Kubernetes Cluster will be deleted
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete your Kubernetes Cluster? All of your data will be permanently removed. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button type="button" disabled class="opacity-50 mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
\`;
const html = \`
<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    </head>
 <body>
    \${content}
</body>
</html>
\`;
module.exports = { 
  main: function (event, context) {
    let response = event.extensions.response;
    response.setHeader('Content-Type', 'text/html');
    response.end(html);
    return;
  }
}`;
const htmlJsDeps = {
  name: 'html',
  version: '1.0.0',
  dependencies: {
    'node-fetch': 'latest',
  },
};

export function createPresets(namespace, t) {
  return [
    {
      name: t('functions.presets.hello-world-js'),
      value: {
        ...createFunctionTemplate(),
        metadata: {
          name: helloWorldJsDeps.name,
          namespace,
          labels: {
            'app.kubernetes.io/name': helloWorldJsDeps.name,
          },
        },
        spec: {
          runtime: 'nodejs14',
          type: '',
          source: helloWorldJsSource,
          deps: JSON.stringify(helloWorldJsDeps, undefined, 2),
        },
      },
    },
    {
      name: t('functions.presets.hello-world-python'),
      value: {
        ...createFunctionTemplate(),
        metadata: {
          name: helloWorldJsDeps.name,
          namespace,
          labels: {
            'app.kubernetes.io/name': helloWorldJsDeps.name,
          },
        },
        spec: {
          runtime: 'python39',
          type: '',
          source: helloWorldPythonSource,
        },
      },
    },
    {
      name: t('functions.presets.event-js'),
      value: {
        ...createFunctionTemplate(),
        metadata: {
          name: eventJsDeps.name,
          namespace,
          labels: {
            'app.kubernetes.io/name': eventJsDeps.name,
          },
        },
        spec: {
          runtime: 'nodejs14',
          type: '',
          source: eventJsSource,
          deps: JSON.stringify(eventJsDeps, undefined, 2),
        },
      },
    },
    {
      name: t('functions.presets.event-python'),
      value: {
        ...createFunctionTemplate(),
        metadata: {
          name: eventJsDeps.name,
          namespace,
          labels: {
            'app.kubernetes.io/name': eventJsDeps.name,
          },
        },
        spec: {
          runtime: 'python39',
          type: '',
          source: helloWorldPythonSource,
        },
      },
    },
    {
      name: t('functions.presets.html-js'),
      value: {
        ...createFunctionTemplate(),
        metadata: {
          name: htmlJsDeps.name,
          namespace,
          labels: {
            'app.kubernetes.io/name': htmlJsDeps.name,
          },
        },
        spec: {
          runtime: 'nodejs14',
          type: '',
          source: htmlJsSource,
          deps: JSON.stringify(htmlJsDeps, undefined, 2),
        },
      },
    },
    {
      name: t('functions.presets.html-python'),
      value: {
        ...createFunctionTemplate(),
        metadata: {
          name: htmlJsDeps.name,
          namespace,
          labels: {
            'app.kubernetes.io/name': htmlJsDeps.name,
          },
        },
        spec: {
          runtime: 'python39',
          type: '',
          source: helloWorldPythonSource,
        },
      },
    },
  ];
}
