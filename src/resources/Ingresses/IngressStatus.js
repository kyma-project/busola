import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConditionList } from 'shared/components/ConditionList/ConditionList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { spacing } from '@ui5/webcomponents-react-base';
import './IngressStatus.scss';

export const IngressStatus = ({ resource }) => {
  const { t } = useTranslation();
  const ingresses = useMemo(() => {
    return resource?.status?.loadBalancer?.ingress?.map(ingress => ingress);
  }, [resource]);

  return ingresses ? (
    <ConditionList
      className="load-balancers"
      conditions={ingresses.map(ingress => ({
        header: {
          titleText: ingress.hostname ? (
            <div>
              <span
                style={{ ...spacing.sapUiTinyMarginEnd }}
                className="title bsl-has-color-status-4"
              >
                {`${t('ingresses.labels.host-name')}:`}
              </span>
              {`${ingress.hostname}`}
            </div>
          ) : (
            <div>
              <span
                style={{ ...spacing.sapUiTinyMarginEnd }}
                className="title bsl-has-color-status-4"
              >
                {`${t('ingresses.labels.ip')}:`}
              </span>
              {`${ingress.ip}`}
            </div>
          ),
        },
        customContent: [
          ingress.hostname
            ? {
                header: t('ingresses.labels.host-name'),
                value: ingress.hostname,
                className: 'load-balancers__content',
              }
            : null,
          ingress.ip
            ? {
                header: t('ingresses.labels.ip'),
                value: ingress.ip,
                className: 'load-balancers__content',
              }
            : null,
          {
            header: t('ingresses.labels.ports'),
            value: ingress.ports ? (
              <ConditionList
                conditions={ingress?.ports?.map(port => {
                  return {
                    header: {
                      titleText: port.port,
                      status: port.error ? 'Error' : '',
                    },
                    customContent: [
                      port.protocol
                        ? {
                            header: t('ingresses.labels.protocol'),
                            value: port.protocol,
                          }
                        : null,
                      port.error
                        ? {
                            header: 'Error',
                            value: port.error,
                          }
                        : null,
                    ],
                  };
                })}
              />
            ) : (
              EMPTY_TEXT_PLACEHOLDER
            ),
            className: ingress.ports ? '' : 'load-balancers__content',
          },
        ],
      }))}
    />
  ) : (
    <div
      className="content bsl-has-color-text-1"
      style={{
        ...spacing.sapUiSmallMarginBegin,
        ...spacing.sapUiSmallMarginBottom,
      }}
    >
      {EMPTY_TEXT_PLACEHOLDER}
    </div>
  );
};
