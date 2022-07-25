import React from 'react';

import LuigiClient from '@luigi-project/client';
import { serviceClassConstants } from 'helpers/constants';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { getResourceDisplayName, isService } from 'helpers';

import { Link } from 'fundamental-react';
import './ServiceClassPlansList.scss';

const goToDetails = (planName, serviceClassName, serviceClassKind) => {
  LuigiClient.linkManager()
    .fromClosestContext()
    .withParams({
      resourceType: serviceClassKind,
    })
    .navigate(`details/${serviceClassName}/plan/${planName}`);
};

export default function ServiceClassPlansList({ serviceClass, plans }) {
  if (!plans) return <Spinner />;

  const headerRenderer = () => [''];
  const rowRenderer = plan => [
    <div>
      <Link
        className="fd-link link--bold"
        data-test-id="plan-name"
        onClick={() =>
          goToDetails(
            plan.metadata.name,
            serviceClass.metadata.name,
            serviceClass.kind,
          )
        }
      >
        {getResourceDisplayName(plan)}
      </Link>
      <p>{plan.spec.description}</p>
    </div>,
  ];

  const breadcrumbItems = [
    {
      name: `${serviceClassConstants.title} - ${
        isService(serviceClass.spec.externalMetadata?.labels)
          ? 'Services'
          : 'Add-Ons'
      }`,
      path: '/',
      params: {
        selectedTab: isService(serviceClass.spec.externalMetadata?.labels)
          ? 'services'
          : 'addons',
      },
    },
    {
      name: '',
    },
  ];

  return (
    <article>
      <PageHeader
        title={`Choose a Plan for ${getResourceDisplayName(serviceClass)}`}
        breadcrumbItems={breadcrumbItems}
      />
      <GenericList
        entries={plans}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        showSearchField={false}
        showHeader={false}
      />
    </article>
  );
}
