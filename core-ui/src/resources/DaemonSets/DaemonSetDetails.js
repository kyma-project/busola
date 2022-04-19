import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Selector } from 'shared/components/Selector/Selector';
import { DaemonSetStatus } from './DaemonSetStatus';
import { DaemonSetCreate } from './DaemonSetCreate';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';

const Tolerations = resource => {
  const { t, i18n } = useTranslation();

  const headerRenderer = () => [
    t('daemon-sets.tolerations.key'),
    t('daemon-sets.tolerations.operator'),
    t('daemon-sets.tolerations.effect'),
    t('daemon-sets.tolerations.toleration-seconds'),
  ];
  const rowRenderer = entry => [
    entry.key || EMPTY_TEXT_PLACEHOLDER,
    entry.operator || EMPTY_TEXT_PLACEHOLDER,
    entry.effect || EMPTY_TEXT_PLACEHOLDER,
    entry.tolerationSeconds || EMPTY_TEXT_PLACEHOLDER,
  ];
  const textSearchProperties = [
    'key',
    'operator',
    'effect',
    'toleration-seconds',
  ];
  return (
    <GenericList
      title={t('daemon-sets.tolerations.title')}
      entries={resource.spec.template.spec.tolerations || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="daemon-set-tolerations"
      textSearchProperties={textSearchProperties}
      i18n={i18n}
    />
  );
};

export function DaemonSetDetails(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledBy ownerReferences={resource.metadata.ownerReferences} />
      ),
    },
    {
      header: t('common.headers.pods'),
      value: resource => <DaemonSetStatus daemonSet={resource} />,
    },
  ];

  const MatchSelector = daemonSet => (
    <Selector
      namespace={daemonSet.metadata.namespace}
      labels={daemonSet.spec?.selector?.matchLabels}
      expressions={daemonSet.spec?.selector?.matchExpressions}
      selector={daemonSet.spec?.selector}
    />
  );

  const DaemonSetPodTemplate = daemonSet => (
    <PodTemplate template={daemonSet.spec.template} />
  );

  return (
    <ResourceDetails
      customComponents={[Tolerations, MatchSelector, DaemonSetPodTemplate]}
      customColumns={customColumns}
      createResourceForm={DaemonSetCreate}
      {...props}
    />
  );
}
export default DaemonSetDetails;
