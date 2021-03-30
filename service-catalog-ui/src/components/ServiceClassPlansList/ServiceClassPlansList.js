import React from 'react';

import LuigiClient from '@luigi-project/client';

import { serviceClassConstants } from 'helpers/constants';
import PropTypes from 'prop-types';
import { Spinner, PageHeader, GenericList, Tooltip } from 'react-shared';
import { getResourceDisplayName, isService } from 'helpers';
import { sortByDisplayName } from 'helpers/sorting';
import { Badge, Link } from 'fundamental-react';
import './ServiceClassPlansList.scss';

const DOC_TYPES_COLORS = new Map([
  ['openapi', undefined],
  ['asyncapi', 'success'],
  ['odata', 'warning'],
]);

const goToDetails = (item, serviceClassId) => {
  if (!serviceClassId) return null;

  return LuigiClient.linkManager()
    .fromClosestContext()
    .navigate(`details/${serviceClassId}/plan/${item.name}`);
};

export const DocTypesList = ({ plan }) => (
  <>
    {Array.from(getPlanDocTypes(plan).entries()).map(([type, count]) => (
      <div
        key={type}
        aria-label="doc-type-badge"
        className="doc-type-badge dont-break-words"
      >
        <Tooltip
          content={
            count > 1
              ? `There are ${count} ${type} specs in this plan.`
              : `There is one ${type} spec in this plan.`
          }
        >
          <Badge type={DOC_TYPES_COLORS.get(type)}>
            {type}
            {count > 1 && (
              <span
                role="link"
                className="fd-counter fd-counter--notification "
                aria-label="api-type-count"
              >
                {count}
              </span>
            )}
          </Badge>
        </Tooltip>
      </div>
    ))}
  </>
);

DocTypesList.propTypes = {
  plan: PropTypes.shape({
    assetGroup: PropTypes.object,
    clusterAssetGroup: PropTypes.object,
  }),
};

function getPlanDocTypes(plan) {
  const typesMap = new Map();
  let assetKey = 'assetGroup';

  if (plan.clusterAssetGroup) assetKey = 'clusterAssetGroup';
  else if (plan.assetGroup) assetKey = 'assetGroup';
  else return typesMap;

  plan[assetKey].assets.forEach(({ type }) =>
    typesMap.set(type, (typesMap.has(type) ? typesMap.get(type) : 0) + 1),
  );
  return typesMap;
}

export default function ServiceClassPlansList({ name }) {
  return 'plan list';
  // const namespace = LuigiClient.getContext().namespaceId;

  // const {
  //   data: queryData,
  //   loading: queryLoading,
  //   error: queryError,
  // } = useQuery(getServiceClassPlans, {
  //   variables: {
  //     namespace,
  //     name,
  //   },
  //   fetchPolicy: 'no-cache',
  // });

  // if (queryLoading) {
  //   return <Spinner />;
  // }

  // if (queryError) {
  //   return (
  //     <div className="empty-list">
  //       {serviceClassConstants.errorServiceClassPlansList}
  //     </div>
  //   );
  // }

  // const headerRenderer = () => ['', ''];

  // const rowRenderer = item => [
  //   <div>
  //     <Link
  //       className="link link--bold"
  //       data-test-id="plan-name"
  //       onClick={() => goToDetails(item, serviceClass.name)}
  //     >
  //       {getResourceDisplayName(item)}
  //     </Link>
  //     <p>{item.description}</p>
  //   </div>,
  //   <DocTypesList plan={item} />,
  // ];

  // const serviceClass = queryData.clusterServiceClass || queryData.serviceClass;

  // if (!serviceClass) {
  //   return (
  //     <div className="empty-list"> {serviceClassConstants.noClassText}</div>
  //   );
  // }

  // const breadcrumbItems = [
  //   {
  //     name: `${serviceClassConstants.title} - ${
  //       isService({ labels: serviceClass.labels }) ? 'Services' : 'Add-Ons'
  //     }`,
  //     path: '/',
  //     params: {
  //       selectedTab: isService({ labels: serviceClass.labels })
  //         ? 'services'
  //         : 'addons',
  //     },
  //   },
  //   {
  //     name: '',
  //   },
  // ];

  // return (
  //   <article>
  //     <PageHeader
  //       title={getResourceDisplayName(serviceClass)}
  //       breadcrumbItems={breadcrumbItems}
  //     />
  //     <GenericList
  //       title="Choose Service Class Plan"
  //       entries={serviceClass.plans.sort(sortByDisplayName)}
  //       headerRenderer={headerRenderer}
  //       rowRenderer={rowRenderer}
  //       showSearchField={false}
  //       showHeader={false}
  //     />
  //   </article>
  // );
}
