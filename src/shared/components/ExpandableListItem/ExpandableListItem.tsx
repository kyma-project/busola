import { ReactNode, useState } from 'react';
import { Icon, StandardListItem } from '@ui5/webcomponents-react';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';
import './ExpandableListItem.scss';

type ExpandableListItemProps = {
  header: string | ReactNode;
  status?: string;
  content?: string;
  customContent?: CustomContent[];
};

export type CustomContent = {
  header: string;
  value: string;
  className?: string;
};

export const ExpandableListItem = ({
  header,
  status,
  content,
  customContent,
}: ExpandableListItemProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <StandardListItem
        onClick={() => setExpanded(!expanded)}
        className="expandable-item"
      >
        <div className="expandable-item__header">
          {expanded ? (
            <Icon
              name="slim-arrow-down"
              design="Information"
              style={spacing.sapUiTinyMarginEnd}
            />
          ) : (
            <Icon
              name="slim-arrow-right"
              design="Information"
              style={spacing.sapUiTinyMarginEnd}
            />
          )}
          {header}
          {status && (
            <StatusBadge
              type={status === 'True' ? 'Success' : 'Error'}
              className={'header__status-badge'}
            >
              {status}
            </StatusBadge>
          )}
        </div>
      </StandardListItem>
      {expanded && (
        <>
          {content && (
            <div
              className="expandable-item__message"
              style={{
                ...spacing.sapUiSmallMarginBeginEnd,
                ...spacing.sapUiTinyMarginTopBottom,
              }}
            >
              <div className="title bsl-has-color-status-4 ">
                {`${t('common.headers.message')}:`}
              </div>
              {content}
            </div>
          )}
          {customContent &&
            customContent.map((element, index) => (
              <div
                className={`expandable-item__message ${
                  element?.className ? element.className : ''
                }`}
                style={{
                  ...spacing.sapUiSmallMarginBeginEnd,
                  ...spacing.sapUiTinyMarginTopBottom,
                }}
                key={index}
              >
                {element?.header && (
                  <div className="title bsl-has-color-status-4 ">
                    {`${element?.header}:`}
                  </div>
                )}
                {element?.value}
              </div>
            ))}
        </>
      )}
    </>
  );
};
