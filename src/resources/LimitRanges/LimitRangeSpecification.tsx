import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

type FlatLimitProps = {
  resource: string;
  min: string;
  max: string;
  default: string;
  defaultRequest: string;
  maxLimitRequestRatio: string;
};

const emptyLimit = [
  {
    type: EMPTY_TEXT_PLACEHOLDER,
    props: [
      {
        resource: EMPTY_TEXT_PLACEHOLDER,
        max: EMPTY_TEXT_PLACEHOLDER,
        min: EMPTY_TEXT_PLACEHOLDER,
        default: EMPTY_TEXT_PLACEHOLDER,
        defaultRequest: EMPTY_TEXT_PLACEHOLDER,
      },
    ],
  },
];

export default function LimitRangeSpecification({
  resource,
}: {
  resource: any;
}) {
  const { t } = useTranslation();

  const transLimits = useMemo(() => {
    if (!resource.spec?.limits) return emptyLimit;

    return resource.spec?.limits?.map((limit: any) => {
      const keys = [
        'max',
        'min',
        'default',
        'defaultRequest',
        'maxLimitRequestRatio',
      ];

      const resourceTypes = new Set<string>(
        keys.flatMap(key => (limit[key] ? Object.keys(limit[key]) : [])),
      );

      const props = Array.from(resourceTypes).map(resourceType => {
        const entry: any = { resource: resourceType };

        keys.forEach(key => {
          if (limit[key] && limit[key][resourceType] !== undefined) {
            entry[key] = limit[key][resourceType];
          }
        });

        return entry;
      });

      return {
        type: limit.type,
        props: props.length > 0 ? props : emptyLimit[0].props,
      };
    });
  }, [resource]);

  const headerRenderer = () => [
    t('limit-ranges.headers.resource'),
    t('limit-ranges.headers.min'),
    t('limit-ranges.headers.max'),
    t('limit-ranges.headers.default-request'),
    t('limit-ranges.headers.default'),
    t('limit-ranges.headers.max-ratio'),
  ];

  const rowRenderer = ({
    resource,
    min,
    max,
    default: defaultValue,
    defaultRequest,
    maxLimitRequestRatio,
  }: FlatLimitProps) => {
    return [
      resource || EMPTY_TEXT_PLACEHOLDER,
      min || EMPTY_TEXT_PLACEHOLDER,
      max || EMPTY_TEXT_PLACEHOLDER,
      defaultValue || EMPTY_TEXT_PLACEHOLDER,
      defaultRequest || EMPTY_TEXT_PLACEHOLDER,
      maxLimitRequestRatio || EMPTY_TEXT_PLACEHOLDER,
    ];
  };

  return (
    <UI5Panel title={t('limit-ranges.headers.limits')} headerActions={null}>
      {transLimits.map((limit: { type: string; props: FlatLimitProps[] }) => {
        return (
          <GenericList
            title={limit.type || ''}
            entries={limit.props || []}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            searchSettings={{
              showSearchField: false,
            }}
          />
        );
      })}
    </UI5Panel>
  );
}
