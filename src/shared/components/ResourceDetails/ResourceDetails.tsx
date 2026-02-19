import {
  ComponentType,
  createContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { getErrorMessage, prettifyNameSingular } from 'shared/utils/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { CustomColumnsType } from './ResourceCustomStatusColumns';
import { isEmpty } from 'lodash';
import { ResourceGraphConfig } from '../ResourceGraph/types';
import { ResourceComponent } from './ResourceComponent';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { K8sResource } from 'types';

export const ResourceDetailContext = createContext(false);

export type ResourceDetailsProps = {
  customColumns?: CustomColumnsType;
  children?: ReactNode;
  customComponents?: Array<(resource: any, resourceUrl: string) => ReactNode>;
  description?: string;
  resourceUrl?: string;
  resourceType: string;
  resourceName?: string;
  resourceTitle?: string;
  namespace?: string;
  headerActions?: ReactNode;
  resourceHeaderActions?: Array<(resource: any) => ReactNode>;
  readOnly?: boolean;
  editActionLabel?: string;
  windowTitle?: string;
  resourceGraphConfig?: ResourceGraphConfig;
  resourceSchema?: Record<string, any>;
  disableEdit?: boolean | ((resource: any) => boolean | Promise<boolean>);
  disableDelete?: boolean;
  showYamlTab?: boolean;
  layoutCloseCreateUrl?: string;
  layoutNumber?: string;
  customHealthCards?: Array<(resource: any, index: number) => ReactNode>;
  showHealthCardsTitle?: boolean;
  isModule?: boolean;
  isEntireListProtected?: boolean;
  customTitle?: string;
  disableResourceDetailsCard?: boolean;
  hideLabels?: boolean;
  hideAnnotations?: boolean;
  hideLastUpdate?: boolean;
  createResourceForm: ComponentType<{
    resource: any;
    resourceType: string;
    resourceUrl: string;
    namespace?: string;
    resourceSchema?: Record<string, any>;
    editMode: boolean;
    stickyHeaderHeight: number | string;
    [key: string]: any;
  }>;
  customConditionsComponents?: CustomColumnsType;
  title?: string;
  statusBadge?: (resource: any) => ReactNode;
  customStatusColumns?: CustomColumnsType;
  customStatus?: ReactNode;
  statusConditions?: (resource: any) => Array<{
    type: string;
    status: string;
    reason?: string;
    message?: string;
  }>;
  headerContent?: ReactNode;
  className?: string;
  headerDescription?: string;
};

export function ResourceDetails(props: ResourceDetailsProps) {
  if (!props.resourceUrl) {
    return <></>; // wait for the context update
  } else {
    return <ResourceDetailsRenderer {...props} />;
  }
}

function ResourceDetailsRenderer(props: ResourceDetailsProps) {
  const {
    loading = true,
    error,
    data: resource,
  } = useGet(props.resourceUrl, {
    pollingInterval: 3000,
    /*@ts-expect-error Type mismatch between js and ts*/
    errorTolerancy: props.isModule ? 0 : undefined,
  });
  const [disableEditState, setDisableEditState] = useState<boolean | undefined>(
    false,
  );

  useEffect(() => {
    const getDisableEdit = async () => {
      if (
        typeof props.disableEdit === 'boolean' ||
        typeof props.disableEdit === 'undefined'
      ) {
        setDisableEditState(props.disableEdit);
      } else {
        const isDisabled = await props.disableEdit(resource);
        setDisableEditState(isDisabled);
      }
    };
    getDisableEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(resource), props.disableEdit]);

  if (loading) return <Spinner />;
  if (error && isEmpty(resource)) {
    if ((error as HttpError).code === 404) {
      return (
        <ResourceNotFound
          resource={prettifyNameSingular(
            props.resourceTitle,
            props.resourceType,
          )}
          layoutCloseUrl={props.layoutCloseCreateUrl}
          layoutNumber={props.layoutNumber ?? 'midColumn'}
        />
      );
    }
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(props.resourceTitle, props.resourceType)}
        customMessage={getErrorMessage(error)}
        layoutCloseUrl={props.layoutCloseCreateUrl}
        layoutNumber={props.layoutNumber ?? 'midColumn'}
      />
    );
  }

  return (
    <>
      {resource && (
        <ResourceComponent
          {...props}
          key={(resource as K8sResource)?.metadata?.name}
          resource={resource}
          disableEdit={disableEditState}
        />
      )}
    </>
  );
}
