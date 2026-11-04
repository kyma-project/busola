import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import { Tokens } from 'shared/components/Tokens';
import { useUrl } from 'hooks/useUrl';
import { K8sResource } from 'types';

type VolumeISCSIProps = {
  iscsi: {
    targetPortal?: string;
    iqn?: string;
    lun?: string;
    iscsiInterface?: string;
    fsType?: string;
    portals?: string[];
    chapAuthDiscovery?: string;
    chapAuthSession?: string;
    secretRef?: {
      name: string;
    };
  };
  secret: K8sResource;
};

export const VolumeISCSI = ({ iscsi, secret }: VolumeISCSIProps) => {
  const { t } = useTranslation();
  const { resourceUrl } = useUrl();

  return (
    <>
      <ResourceDetailsFormItem
        label={t('pv.headers.type')}
        value={t('pv.iscsi.type')}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.targetPortal')}
        value={iscsi?.targetPortal || EMPTY_TEXT_PLACEHOLDER}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.iqn')}
        value={iscsi?.iqn || EMPTY_TEXT_PLACEHOLDER}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.lun')}
        value={iscsi?.lun ?? EMPTY_TEXT_PLACEHOLDER}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.iscsiInterface')}
        value={iscsi?.iscsiInterface || EMPTY_TEXT_PLACEHOLDER}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.fsType')}
        value={iscsi?.fsType || EMPTY_TEXT_PLACEHOLDER}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.portals')}
        value={<Tokens tokens={iscsi?.portals || []} />}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.chapAuthDiscovery')}
        value={iscsi?.chapAuthDiscovery || EMPTY_TEXT_PLACEHOLDER}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.chapAuthSession')}
        value={iscsi?.chapAuthSession || EMPTY_TEXT_PLACEHOLDER}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.secretRef')}
        value={
          secret && iscsi?.secretRef?.name ? (
            <Link
              url={resourceUrl(
                {
                  kind: 'Secret',
                  metadata: {
                    name: iscsi.secretRef.name,
                    // TO DO: Fix types of K8sResource to not have below properties set as required
                    uid: '',
                    creationTimestamp: '',
                    resourceVersion: '',
                    labels: {},
                  },
                },
                {
                  namespace: secret.metadata.namespace,
                },
              )}
            >
              {iscsi.secretRef.name}
            </Link>
          ) : (
            <p>{iscsi?.secretRef?.name || EMPTY_TEXT_PLACEHOLDER}</p>
          )
        }
      />
    </>
  );
};
