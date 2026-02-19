import { lazy, ReactNode, Suspense } from 'react';
import { Spinner } from '../Spinner/Spinner';
import { ToolbarButton } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import { DeleteResourceModal } from '../DeleteResourceModal/DeleteResourceModal';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { useTranslation } from 'react-i18next';
import { K8sResource } from 'types';
import { Resource } from 'components/Extensibility/contexts/DataSources';

const Injections = lazy(
  () => import('../../../components/Extensibility/ExtensibilityInjections'),
);

type ResourceActionsProps = {
  headerActions?: ReactNode;
  readOnly?: boolean;
  resource: K8sResource & Resource;
  resourceHeaderActions: Array<(resource: any) => ReactNode>;
  resourceType: string;
  resourceUrl?: string;
  disableDelete?: boolean;
  handleResourceDelete: ({
    resource,
    resourceUrl,
    deleteFn,
  }: {
    resource: any;
    resourceUrl: string;
    deleteFn: () => void;
  }) => void;
  protectedResource: boolean;
  showDeleteDialog: boolean;
  performDelete: (
    resource: any,
    resourceUrl: string,
    deleteFn: any,
  ) => Promise<void>;
  performCancel: (cancelFn: any) => void;
};

export const ResourceActions = ({
  headerActions,
  readOnly,
  resource,
  resourceHeaderActions,
  resourceType,
  resourceUrl,
  disableDelete,
  handleResourceDelete,
  protectedResource,
  performDelete,
  showDeleteDialog,
  performCancel,
}: ResourceActionsProps) => {
  const { t } = useTranslation();

  return readOnly ? null : (
    <>
      {headerActions}
      <Suspense fallback={<Spinner />}>
        <Injections
          destination={resourceType}
          slot="details-header"
          root={resource}
        />
      </Suspense>
      {resourceHeaderActions.map((resourceAction) => resourceAction(resource))}
      {!disableDelete && (
        <>
          <ToolbarButton
            disabled={protectedResource}
            onClick={() =>
              handleResourceDelete({ resourceUrl } as {
                resource: any;
                resourceUrl: string;
                deleteFn: () => void;
              })
            }
            design="Transparent"
            tooltip={
              protectedResource
                ? t('common.tooltips.protected-resources-info')
                : undefined
            }
            text={t('common.buttons.delete')}
          />
          {createPortal(
            <DeleteResourceModal
              resource={resource}
              resourceUrl={resourceUrl}
              resourceType={resource.kind}
              performDelete={performDelete}
              showDeleteDialog={showDeleteDialog}
              performCancel={performCancel}
            />,
            document.body,
          )}
          \
        </>
      )}
      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
};
