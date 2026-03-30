export function createPodTemplate(namespace: string) {
  return {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      containers: [
        {
          name: '',
          image: '',
          ports: [
            {
              name: '',
              containerPort: 80,
              protocol: '',
            },
          ],
        },
      ],
    },
  };
}
