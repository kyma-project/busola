import React, { useState } from 'react';
import { CustomResourceDefinitionVersions } from './CustomResourceDefinitionVersions';
import { useTranslation } from 'react-i18next';
import {
  GenericList,
  EMPTY_TEXT_PLACEHOLDER,
  ModalWithForm,
} from 'react-shared';
import { ComponentForList } from 'shared/getComponents';

import { Button } from 'fundamental-react';
import { Categories } from 'shared/components/Categories';

import { CRCreate } from './CRCreate';

const CommonCategoriesList = resource => {
  const resourceUrl = '/apis/apiextensions.k8s.io/v1/customresourcedefinitions';

  const filterByCategories = crd => {
    return resource.spec.names.categories?.some(
      category =>
        category !== 'all' &&
        crd.spec.names.categories?.includes(category) &&
        crd.metadata.name !== resource.metadata.name &&
        crd.spec.scope === resource.spec.scope,
    );
  };
  return (
    <ComponentForList
      name="customResourceDefinitionsList"
      key="common-categories-list"
      params={{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl,
        resourceType: 'customresourcedefinitions',
        isCompact: true,
        showTitle: true,
        filter: filterByCategories,
        title: 'Related CRDs',
        pagination: { itemsPerPage: 5 },
      }}
    />
  );
};

export const CustomResourceDefinitionsDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('custom-resource-definitions.headers.scope'),
      value: resource => resource.spec.scope,
    },
    {
      header: 'Categories',
      value: ({ spec }) => <Categories categories={spec.names?.categories} />,
    },
  ];

  const ResourceNames = resource => {
    const headerRenderer = () => [
      t('custom-resource-definitions.headers.kind'),
      t('custom-resource-definitions.headers.list-kind'),
      t('custom-resource-definitions.headers.plural'),
      t('custom-resource-definitions.headers.singular'),
      t('custom-resource-definitions.headers.short-names'),
    ];
    const rowRenderer = entry => [
      entry.kind,
      entry.listKind,
      entry.plural,
      entry.singular,
      entry.shortNames?.join(', ') || EMPTY_TEXT_PLACEHOLDER,
    ];
    return (
      <GenericList
        title={t('custom-resource-definitions.subtitle.names')}
        entries={resource.spec.names ? [resource.spec.names] : []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        testid="crd-names"
        i18n={i18n}
      />
    );
  };

  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[
        ResourceNames,
        CustomResourceDefinitionVersions,
        CommonCategoriesList,
      ]}
      resourceHeaderActions={[
        crd => {
          return (
            <>
              <ModalWithForm
                title={t('components.resources-list.create', {
                  resourceType: crd.spec.names.kind,
                })}
                opened={showEditDialog}
                confirmText={t('common.buttons.create')}
                id={`add-${crd.spec.names.kind}-modal`}
                className="modal-size--l create-resource-modal"
                renderForm={props => <CRCreate crd={crd} {...props} />}
                i18n={i18n}
                modalOpeningComponent={<></>}
                customCloseAction={() => setShowEditDialog(false)}
              />
              <Button
                option="default"
                onClick={() => setShowEditDialog(true)}
                className="fd-margin-end--tiny"
              >
                {t('common.buttons.create')} {crd.spec.names.kind}
              </Button>
            </>
          );
        },
      ]}
      {...otherParams}
    />
  );
};
