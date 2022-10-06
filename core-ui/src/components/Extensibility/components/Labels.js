import { useGetPlaceholder } from 'components/Extensibility/helpers';
import { isNil } from 'lodash';
import { Labels as BusolaLabels } from 'shared/components/Labels/Labels';
import { Tokens } from 'shared/components/Tokens';

export function Labels({ schema, value, structure }) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  const isSimpleType = value => {
    return (
      typeof value === 'boolean' ||
      typeof value === 'string' ||
      typeof value === 'number'
    );
  };

  switch (true) {
    case isNil(value):
      return emptyLeafPlaceholder;
    case Array.isArray(value):
      return <Tokens tokens={value} />;
    case isSimpleType(value):
      return value;
    default:
      return <BusolaLabels labels={value} />;
  }
}

Labels.inline = true;
Labels.array = true;
Labels.copiable = true;
