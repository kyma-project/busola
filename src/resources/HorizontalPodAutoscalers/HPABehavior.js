import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { GenericList } from 'shared/components/GenericList/GenericList';

const Scale = ({ scale, key }) => {
  const { t } = useTranslation();

  if (!scale) return null;

  const rowRenderer = policy => {
    return [policy.type, policy.value, policy.periodSeconds];
  };

  return (
    <LayoutPanel className="fd-margin--md " key={`hpa-behavior-${key}`}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t(`hpas.headers.${key}`)} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('hpas.headers.stabilization-window-seconds')}
          value={scale.stabilizationWindowSeconds ?? EMPTY_TEXT_PLACEHOLDER}
        />
        <LayoutPanelRow
          name={t('hpas.headers.select-policy')}
          value={scale.selectPolicy ?? EMPTY_TEXT_PLACEHOLDER}
        />
      </LayoutPanel.Body>
      {scale?.policies && (
        <GenericList
          searchSettings={{ showSearchField: false }}
          entries={scale.policies}
          key={`behavior-${key}`}
          title={t(`hpas.headers.${key}`)}
          headerRenderer={() => [
            t('hpas.headers.type'),
            t('hpas.headers.value'),
            t('hpas.headers.period-seconds'),
          ]}
          rowRenderer={rowRenderer}
        />
      )}
    </LayoutPanel>
  );
};

export const HPABehavior = ({ spec }) => {
  const { t } = useTranslation();

  if (!spec?.behavior) return null;

  const scaleUp = spec?.behavior?.scaleUp;
  const scaleDown = spec?.behavior?.scaleDown;

  return (
    <LayoutPanel className="fd-margin--md " key="hpa-behavior">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('hpas.headers.behavior')} />
      </LayoutPanel.Header>
      {scaleUp && Scale({ scale: scaleUp, key: 'scale-up' })}
      {scaleDown && Scale({ scale: scaleDown, key: 'scale-down' })}
    </LayoutPanel>
  );
};
