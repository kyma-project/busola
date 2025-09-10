import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import StorageClassCreate from './StorageClassCreate';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/StorageClasses';

export function StorageClassList(props) {
  return (
    <ResourcesList
      {...props}
      description={ResourceDescription}
      createResourceForm={StorageClassCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default StorageClassList;
