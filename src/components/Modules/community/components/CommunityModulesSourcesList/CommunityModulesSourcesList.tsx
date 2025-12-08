import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Card, List, Title } from '@ui5/webcomponents-react';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { HintButton } from 'shared/components/HintButton/HintButton';
import { CommunityModuleContext } from '../../providers/CommunityModuleProvider';
import { AddSourceYamls } from '../AddSourceYamls';
import { SourceListElements } from './SourceListElements';
import { DeleteSourceMessage } from './DeleteSourceMessage';
import './CommunityModulesSourcesList.scss';

export const CommunityModulesSourcesList = () => {
  const { t } = useTranslation();
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const { notInstalledCommunityModuleTemplates } = useContext(
    CommunityModuleContext,
  );

  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState('');

  const getSources = () => {
    const sources = (communityModuleTemplates?.items ?? [])
      .map((item: any) => {
        return item?.metadata?.annotations?.source;
      })
      .filter(Boolean);
    return [...new Set(sources)];
  };

  return (
    <Card
      className="sap-margin-top-small"
      accessibleName={t('modules.community.source-yaml.source-yamls-header')}
      header={
        <div className="card-header">
          <div className="card-header__title">
            <Title level="H5">
              {t('modules.community.source-yaml.source-yamls-header')}
            </Title>
            <HintButton
              className="sap-margin-begin-tiny"
              setShowTitleDescription={setShowTitleDescription}
              description={t(
                'modules.community.source-yaml.add-source-yaml-info',
              )}
              showTitleDescription={showTitleDescription}
              ariaTitle={t('modules.community.source-yaml.source-yamls-header')}
            />
          </div>
          <AddSourceYamls />
        </div>
      }
    >
      <List
        onItemDelete={(e) => setSourceToDelete(e.detail.item.textContent)}
        selectionMode="Delete"
        separators="Inner"
        className="list-top-separator"
      >
        {moduleTemplatesLoading ? (
          <Spinner />
        ) : (
          <SourceListElements sources={getSources()} />
        )}
      </List>
      {sourceToDelete &&
        createPortal(
          <DeleteSourceMessage
            sourceToDelete={sourceToDelete}
            notInstalledModuleTemplates={notInstalledCommunityModuleTemplates}
            onCancel={setSourceToDelete}
          />,
          document.body,
        )}
    </Card>
  );
};
