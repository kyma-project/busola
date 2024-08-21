import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConditionList } from 'shared/components/ConditionList/ConditionList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { spacing } from '@ui5/webcomponents-react-base';
import './IngressStatus.scss';
import { Label } from 'shared/ResourceForm/components/Label';
import { Badge } from 'components/Extensibility/components/Badge';

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
            <div className="load-balancers__header">
              {`${ingress.hostname}`}
              <Badge value={`${t('ingresses.labels.host-name')} `} />
            </div>
          ) : (
            <div className="load-balancers__header">
              {`${ingress.ip}`}
              <Badge value={`${t('ingresses.labels.ip')} `} />
            </div>
          ),
        },
        customContent: [
          ...(ingress.hostname
            ? [
                {
                  header: t('ingresses.labels.host-name'),
                  value: ingress.hostname,
                  className: 'load-balancers__content',
                },
              ]
            : []),
          ...(ingress.ip
            ? [
                {
                  header: t('ingresses.labels.ip'),
                  value: ingress.ip,
                  className: 'load-balancers__content',
                },
              ]
            : []),
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
                        : {},
                      ...(port.error
                        ? [
                            {
                              header: 'Error',
                              value: port.error,
                            },
                          ]
                        : []),
                    ],
                  };
                })}
              />
            ) : (
              EMPTY_TEXT_PLACEHOLDER
            ),
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
