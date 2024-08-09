import schema from 'shared/helpers/tests/fixtures/deployment-schema.json';
import { getDescription, getPartialSchema } from 'shared/helpers/schema';

describe('get description from schema', () => {
  it('Get description using full path', () => {
    //WHEN
    const desc = getDescription(schema, 'spec.description');

    expect(desc).toEqual('Order description');
  });

  it('Get description using full path with array object', () => {
    //WHEN
    const desc = getDescription(schema, 'spec.pizzas');

    expect(desc).toEqual(
      'Ordered pizzas. A single pizza definition you want to order.',
    );
  });

  it('Get description using full path with array object in path', () => {
    //WHEN
    const desc = getDescription(schema, 'spec.pizzas.name');

    expect(desc).toEqual('Name of the ordered pizza.');
  });

  it('Get description using partial schema', () => {
    //WHEN
    const partialSchema = getPartialSchema(schema, 'spec');
    const desc = getDescription(partialSchema, 'orderDetails');

    //THEN
    expect(desc).toEqual('The details of the order');
  });

  it('Get description using partial schema with array object in path', () => {
    //WHEN
    const partialSchema = getPartialSchema(schema, 'spec.pizzas');
    const desc = getDescription(partialSchema, 'namespace');

    //THEN
    expect(desc).toEqual('Namespace of the ordered pizza.');
  });

  it('Not existing description using partial schema', () => {
    //WHEN
    const partialSchema = getPartialSchema(
      schema,
      'spec.template.spec.volumes123',
    );
    const desc = getDescription(partialSchema, 'nfs.server');

    //THEN
    expect(desc).toBeNull();
  });

  it('Not existing description', () => {
    //WHEN
    const desc = getDescription(
      schema,
      'spec.deployment.spec.template.containers',
    );

    //THEN
    expect(desc).toBeNull();
  });
});
