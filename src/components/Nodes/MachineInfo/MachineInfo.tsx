import { useTranslation } from 'react-i18next';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import './MachineInfo.scss';
import { FormItem, Label, Text } from '@ui5/webcomponents-react';

interface NodeAddress {
  type: string;
  address: string;
}

interface MachineInfoProps {
  nodeInfo?: {
    operatingSystem?: string;
    osImage?: string;
    architecture?: string;
    kubeletVersion?: string;
  };
  capacity?: {
    memory?: string;
    cpu?: string;
    pods?: string;
  };
  addresses?: NodeAddress[];
  spec?: {
    providerID?: string;
    podCIDRs?: string[];
  };
  gpus: number;
}

export function MachineInfo({
  nodeInfo,
  capacity,
  addresses,
  spec,
  gpus,
}: MachineInfoProps) {
  const formattedMemory = capacity?.memory
    ? Math.round((parseInt(capacity.memory) / 1024 / 1024) * 10) / 10
    : 0;
  const { t } = useTranslation();

  return (
    <ResourceDetailsCard
      className="machine-info"
      titleText={t('node-details.machine-info.title')}
      content={
        <>
          <FormItem
            labelContent={
              <Label showColon>
                {t('node-details.machine-info.operating-system')}
              </Label>
            }
          >
            <Text>{`${nodeInfo?.operatingSystem} (${nodeInfo?.osImage})`}</Text>
          </FormItem>
          <FormItem
            labelContent={
              <Label showColon>{t('node-details.machine-info.provider')}</Label>
            }
          >
            <Text>{spec?.providerID || EMPTY_TEXT_PLACEHOLDER}</Text>
          </FormItem>
          <FormItem
            labelContent={
              <Label showColon>
                {t('node-details.machine-info.architecture')}
              </Label>
            }
          >
            <Text>{nodeInfo?.architecture || EMPTY_TEXT_PLACEHOLDER}</Text>
          </FormItem>
          <FormItem
            labelContent={
              <Label showColon>{t('node-details.machine-info.cpus')}</Label>
            }
          >
            <Text>{capacity?.cpu || EMPTY_TEXT_PLACEHOLDER}</Text>
          </FormItem>
          {gpus > 0 && (
            <FormItem
              labelContent={
                <Label showColon>
                  {t('node-details.machine-info.nvidia-gpus')}
                </Label>
              }
            >
              <Text>{gpus}</Text>
            </FormItem>
          )}
          <FormItem
            labelContent={
              <Label showColon>{t('node-details.machine-info.memory')}</Label>
            }
          >
            <Text>{`${formattedMemory} ${t(
              'node-details.machine-info.gib',
            )}`}</Text>
          </FormItem>
          <FormItem
            labelContent={
              <Label showColon>
                {t('node-details.machine-info.pods-capacity')}
              </Label>
            }
          >
            <Text>{capacity?.pods || EMPTY_TEXT_PLACEHOLDER}</Text>
          </FormItem>
          <FormItem
            labelContent={<Label showColon>{t('node-details.pod-cidr')}</Label>}
          >
            <Text>{spec?.podCIDRs?.join(',') || EMPTY_TEXT_PLACEHOLDER}</Text>
          </FormItem>
          <FormItem
            labelContent={
              <Label showColon>
                {t('node-details.machine-info.kubelet-version')}
              </Label>
            }
          >
            <Text>{nodeInfo?.kubeletVersion || EMPTY_TEXT_PLACEHOLDER}</Text>
          </FormItem>
          <FormItem
            labelContent={
              <Label showColon>
                {t('node-details.machine-info.internal-ip')}
              </Label>
            }
          >
            <Text>
              {addresses?.find((a) => a.type === 'InternalIP')?.address ||
                EMPTY_TEXT_PLACEHOLDER}
            </Text>
          </FormItem>
          <FormItem
            labelContent={
              <Label showColon>{t('node-details.machine-info.hostname')}</Label>
            }
          >
            <Text>
              {addresses?.find((a) => a.type === 'Hostname')?.address ||
                EMPTY_TEXT_PLACEHOLDER}
            </Text>
          </FormItem>
        </>
      }
    />
  );
}
