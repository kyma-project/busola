import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
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
        value={iscsi?.targetPortal}
      />
      <ResourceDetailsFormItem label={t('pv.iscsi.iqn')} value={iscsi?.iqn} />
      <ResourceDetailsFormItem label={t('pv.iscsi.lun')} value={iscsi?.lun} />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.iscsiInterface')}
        value={iscsi?.iscsiInterface}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.fsType')}
        value={iscsi?.fsType}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.portals')}
        value={<Tokens tokens={iscsi?.portals || []} />}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.chapAuthDiscovery')}
        value={iscsi?.chapAuthDiscovery}
      />
      <ResourceDetailsFormItem
        label={t('pv.iscsi.chapAuthSession')}
        value={iscsi?.chapAuthSession}
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
            iscsi?.secretRef?.name
          )
        }
      />
    </>
  );
};
