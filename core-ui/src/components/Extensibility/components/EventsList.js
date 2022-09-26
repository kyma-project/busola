import { jsonataWrapper } from '../helpers/jsonataWrapper';

import { EventsList as Events } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

export function EventsList({
  value,
  structure,
  dataSource,
  originalResource,
  schema,
  ...props
}) {
  console.log('ext EventsList value', value);
  if (structure.filter) {
    const expression = jsonataWrapper(structure.filter);
    expression.assign('root', originalResource);
    // if (data.items) {
    //   data.items = data.items.filter(item => {
    //     expression.assign('item', item);
    //     return expression.evaluate();
    //   });
    // } else {
    expression.assign('item', data);
    if (!expression.evaluate()) {
      data = null;
    }
    // }
  }
  return (
    <Events
      namespace={structure.namespace}
      filter={filterByResource('CronJob', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );
}
