import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';
import { Text, Title } from '@ui5/webcomponents-react';
import { FilteredEntriesType } from 'shared/components/GenericList/components/TableBody';

export type Selector = {
  matchLabels: Record<string, string>;
  matchExpressions: FilteredEntriesType[];
};

export type LabelSelectorProps = {
  selector: Selector;
  title: string;
};

export const LabelSelector = ({ selector, title }: LabelSelectorProps) => {
  const { t } = useTranslation();

  if (!selector) {
    return null;
  }

  if (selector.matchLabels)
    return (
      <>
        <Title className="sap-margin-x-small sap-margin-y-tiny" size="H6">
          {title}
        </Title>
        <LayoutPanelRow
          name={t('network-policies.headers.match-labels')}
          value={
            <Tokens
              tokens={
                Object.entries(selector.matchLabels).map(
                  ([key, value]) => `${key}=${value}`,
                ) || []
              }
            />
          }
        />
      </>
    );

  if (selector.matchExpressions) {
    const headerRenderer = () => [
      t('network-policies.headers.key'),
      t('network-policies.headers.operator'),
      t('network-policies.headers.values'),
    ];
    const rowRenderer = ({ key = '', operator = '', values = [] }) => [
      key,
      operator,
      <Tokens key="tokens" tokens={values} />,
    ];

    return (
      <GenericList
        title={title || t('network-policies.headers.pod-selector')}
        entries={selector.matchExpressions || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        key="policy-types"
        searchSettings={{
          showSearchField: false,
        }}
      />
    );
  }

  // selector defined but empty
  return (
    <>
      <Title className="sap-margin-x-small sap-margin-y-tiny" size="H6">
        {title || t('network-policies.headers.pod-selector')}
      </Title>
      <Text className="sap-margin-begin-small sap-margin-bottom-small">
        {t('network-policies.present-but-empty')}
      </Text>
    </>
  );
};
