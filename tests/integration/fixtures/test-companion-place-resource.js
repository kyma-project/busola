export const responseWithPlaceNew = `Deployment:
        <div class="yaml-block>
            <div class="yaml">
            \`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:  
  name: test-deployment  
  namespace: default
spec: 
  replicas: 1
  selector:
    matchLabels:
      app: test
  template:
    metadata:
      labels:
        app: test
    spec:
      containers:
      - name: test
        image: test:latest
\`\`\`
            </div>
            <div class="link" link-type="New">
                [Apply](/namespaces/default/Deployment)
            </div>
        </div>
`;

export const responseWithPlaceEdit = `Deployment:
        <div class="yaml-block>
            <div class="yaml">
            \`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-deployment
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: test
  template:
    metadata:
      labels:
        app: test
    spec:
      containers:
      - name: test
        image: test:latest
\`\`\`
            </div>
            <div class="link" link-type="Update">
                [Apply](/namespaces/default/Deployment/test-deployment)
            </div>
        </div>
`;
