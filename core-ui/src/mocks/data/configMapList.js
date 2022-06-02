import { mockGetRequest } from '../createMock';

export const configMapList = mockGetRequest(
  '/backend/api/v1/namespaces/default/configmaps',
  {
    kind: 'ConfigMapList',
    apiVersion: 'v1',
    metadata: {
      resourceVersion: '13396050',
    },
    items: [
      {
        metadata: {
          name: '333',
          namespace: 'default',
          uid: '8d5c2cda-c8bd-4f6f-bd6b-a71e143879e1',
          resourceVersion: '942773',
          creationTimestamp: '2022-04-26T11:55:33Z',
          labels: {
            'app.kubernetes.io/name': '333',
          },
          managedFields: [
            {
              manager: 'Mozilla',
              operation: 'Update',
              apiVersion: 'v1',
              time: '2022-04-26T11:55:33Z',
              fieldsType: 'FieldsV1',
              fieldsV1: {
                'f:data': { '.': {}, 'f:dfs': {} },
                'f:metadata': {
                  'f:labels': { '.': {}, 'f:app.kubernetes.io/name': {} },
                },
              },
            },
          ],
        },
        data: {
          dfs: 'fd',
        },
      },
      {
        metadata: {
          name: '6767',
          namespace: 'default',
          uid: 'f1e6f03b-d2db-449b-8424-22f87d7c8b09',
          resourceVersion: '942579',
          creationTimestamp: '2022-04-26T11:55:05Z',
          labels: {
            'app.kubernetes.io/name': '6767',
          },
          managedFields: [
            {
              manager: 'Mozilla',
              operation: 'Update',
              apiVersion: 'v1',
              time: '2022-04-26T11:55:05Z',
              fieldsType: 'FieldsV1',
              fieldsV1: {
                'f:metadata': {
                  'f:labels': { '.': {}, 'f:app.kubernetes.io/name': {} },
                },
              },
            },
          ],
        },
      },
    ],
  },
);
