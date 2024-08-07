import schema from 'shared/helpers/tests/fixtures/deployment-schema.json';
import { getDescription, getPartialSchema } from 'shared/helpers/schema';

export {};

describe('get description from schema', () => {
  it('Get description using full path', () => {
    //WHEN
    const desc = getDescription(schema, 'spec.strategy');

    expect(desc).toEqual(
      'DeploymentStrategy describes how to replace existing pods with new ones.',
    );
  });

  it('Get description using full path with array object', () => {
    //WHEN
    const desc = getDescription(schema, 'spec.template.spec.containers');

    expect(desc).toEqual(
      'List of containers belonging to the pod. Containers cannot currently be added or removed. ' +
        'There must be at least one container in a Pod. ' +
        'Cannot be updated. ' +
        'A single application container that you want to run within a pod.',
    );
  });

  it('Get description using full path with array object in path', () => {
    //WHEN
    const desc = getDescription(schema, 'spec.template.spec.containers.tty');

    expect(desc).toEqual(
      "Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. " +
        'Default is false.',
    );
  });

  it('Get description using partial schema', () => {
    //WHEN
    const partialSchema = getPartialSchema(schema, 'metadata');
    const desc = getDescription(partialSchema, 'generation');

    //THEN
    expect(desc).toEqual(
      'A sequence number representing a specific generation of the desired state. ' +
        'Populated by the system. Read-only.',
    );
  });

  it('Get description using partial schema with array object in path', () => {
    //WHEN
    const partialSchema = getPartialSchema(
      schema,
      'spec.template.spec.volumes',
    );
    const desc = getDescription(partialSchema, 'nfs.server');

    //THEN
    expect(desc).toEqual(
      'server is the hostname or IP address of the NFS server. ' +
        'More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs',
    );
  });

  it('Not existing description using partial schema', () => {
    //WHEN
    const partialSchema = getPartialSchema(
      schema,
      'spec.template.spec.volumes123',
    );
    const desc = getDescription(partialSchema, 'nfs.server');

    //THEN
    expect(desc).toEqual('Description not found');
  });

  it('Not existing description', () => {
    //WHEN
    const desc = getDescription(
      schema,
      'spec.deployment.spec.template.containers',
    );

    //THEN
    expect(desc).toEqual('Description not found');
  });
});
