import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import { PersistentVolumeStatus } from './PersistentVolumeStatus';
import PersistentVolumeCreate from './PersistentVolumeCreate';
import { useUrl } from 'hooks/useUrl';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/PersistentVolumes';
import { Link } from 'shared/components/Link/Link';

export function PersistentVolumeList(props) {
  const { t } = useTranslation();
  const { resourceUrl } = useUrl();

  const { data: storageClasses } = useGetList()(
    '/apis/storage.k8s.io/v1/storageclasses',
  );

  const { data: persistentVolumeClaims } = useGetList()(
    '/api/v1/persistentvolumeclaims',
  );

  const customColumns = [
    {
      header: t('pv.headers.storage-class'),
      value: pv =>
        storageClasses?.find(
          ({ metadata }) => metadata.name === pv.spec?.storageClassName,
        ) ? (
          <Link
            url={resourceUrl({
              kind: 'StorageClass',
              metadata: {
                name: pv.spec?.storageClassName,
              },
            })}
          >
            {pv.spec?.storageClassName}
          </Link>
        ) : (
          <p>{pv.spec?.storageClassName || EMPTY_TEXT_PLACEHOLDER}</p>
        ),
    },
    {
      header: t('pv.headers.capacity'),
      value: pv => pv.spec?.capacity?.storage || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pv.headers.claim'),
      value: pv =>
        persistentVolumeClaims?.find(
          ({ metadata }) => metadata.name === pv.spec?.claimRef?.name,
        ) ? (
          <Link
            url={resourceUrl(
              {
                kind: 'PersistentVolumeClaim',
                metadata: {
                  name: pv.spec?.claimRef?.name,
                },
              },
              { namespace: pv.spec?.claimRef?.namespace },
            )}
          >
            {pv.spec?.claimRef?.name}
          </Link>
        ) : (
          <p>{pv.spec?.claimRef?.name || EMPTY_TEXT_PLACEHOLDER}</p>
        ),
    },
    {
      header: t('common.headers.status'),
      value: pv => (
        <span style={{ wordBreak: 'keep-all' }}>
          <PersistentVolumeStatus status={pv.status} />
        </span>
      ),
    },
  ];

  return (
    <ResourcesList
      disableMargin={props.disableMargin}
      resourceTitle={t('pv.title')}
      customColumns={customColumns}
      description={ResourceDescription}
      {...props}
      createResourceForm={PersistentVolumeCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default PersistentVolumeList;
