import React, { useState } from 'react';
import { CurrentCRDVersion } from './CurrentCRDVersion';
import { useTranslation } from 'react-i18next';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Button } from 'fundamental-react';

import { CRCreate } from './CRCreate';
import { RelatedCRDsList } from './RelatedCRDsList';
import { Tokens } from 'shared/components/Tokens';
import { EventsList } from 'shared/components/EventsList';
import { CustomResourceDefinitionsCreate } from '../../Create/CustomResourceDefinitions/CustomResourceDefinitons.create';

const CustomResourceDefinitionsDetails = props => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('custom-resource-definitions.headers.scope'),
      value: resource => resource.spec.scope,
    },
    {
      header: t('custom-resource-definitions.headers.categories'),
      value: ({ spec }) => <Tokens tokens={spec.names?.categories} />,
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
        showSearchField={false}
        rowRenderer={rowRenderer}
        testid="crd-names"
        i18n={i18n}
      />
    );
  };

  const Events = ({ spec }) => {
    const eventFilter = kind => e => {
      return kind === e.involvedObject?.kind;
    };

    return (
      <EventsList
        namespace={props?.namespace}
        filter={eventFilter(spec?.names?.kind)}
      />
    );
  };

  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[
        ResourceNames,
        CurrentCRDVersion,
        RelatedCRDsList,
        Events,
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
                glyph="add"
                option="transparent"
                onClick={() => setShowEditDialog(true)}
                className="fd-margin-end--tiny"
              >
                {t('common.buttons.create')} {crd.spec.names.kind}
              </Button>
            </>
          );
        },
      ]}
      createResourceForm={CustomResourceDefinitionsCreate}
      {...props}
    />
  );
};

export default CustomResourceDefinitionsDetails;
