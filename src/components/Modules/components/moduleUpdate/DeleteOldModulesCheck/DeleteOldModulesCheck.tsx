import { useState } from 'react';
import { CheckBox } from '@ui5/webcomponents-react';
import {
  ModuleTemplateType,
  getResourcePath,
} from 'components/Modules/support';
import { useTranslation } from 'react-i18next';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { useNotification } from 'shared/contexts/NotificationContext';

export const useDeleteOldModuleTemplates = (
  oldModuleTemplates: ModuleTemplateType[],
) => {
  const { t } = useTranslation();
  const deleteRequest = useDelete();
  const notification = useNotification();
  const [deleteOldTemplate, setDeleteOldTemplate] = useState(true);

  const deleteOldTemplates = async () => {
    if (!deleteOldTemplate || oldModuleTemplates.length === 0) return;

    await Promise.all(
      oldModuleTemplates.map(async (tpl) => {
        const url = getResourcePath(tpl);
        try {
          await deleteRequest(url);
        } catch (e) {
          notification.notifyError({
            content: t('modules.community.messages.delete-template-failure', {
              error: e instanceof Error ? e.message : '',
            }),
          });
        }
      }),
    );
  };

  return { deleteOldTemplate, setDeleteOldTemplate, deleteOldTemplates };
};

export const DeleteOldModulesCheck = ({
  oldModuleTemplates,
  setDeleteOldTemplate,
  deleteOldTemplate,
}: {
  oldModuleTemplates: ModuleTemplateType[];
  setDeleteOldTemplate: (value: boolean) => void;
  deleteOldTemplate: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <>
      {oldModuleTemplates.length > 0 && (
        <CheckBox
          data-testid="delete-old-template"
          className="sap-margin-top-small"
          checked={deleteOldTemplate}
          onChange={(e) => setDeleteOldTemplate(e.target.checked)}
          text={t('modules.community.update.delete-old-templates')}
          accessibleName={t('modules.community.update.delete-old-templates')}
        />
      )}
    </>
  );
};
