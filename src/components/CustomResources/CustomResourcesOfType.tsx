import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  CustomResources,
  Version,
} from 'components/CustomResources/CustomResources';
import { useUrl } from 'hooks/useUrl';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { Link } from 'shared/components/Link/Link';
import { createPortal } from 'react-dom';

type CustomResourcesOfTypeProps = {
  crdName: string;
  enableColumnLayout?: boolean;
  layoutCloseCreateUrl?: string;
};

export default function CustomResourcesOfType({
  crdName,
  enableColumnLayout,
  layoutCloseCreateUrl,
}: CustomResourcesOfTypeProps) {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();
  const {
    data: crd,
    loading,
    error,
  } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/` + crdName,
    {
      skip: !crdName,
    },
  ) as {
    data?: {
      spec: {
        group: string;
        names: { plural: string; kind: string };
        versions: Version[];
      };
      apiVersion: string;
      metadata: { name: string; namespace?: string };
    } | null;
    loading?: boolean;
    error?: Error | null;
  };

  if (loading) return <Spinner />;
  if (error) {
    return (
      <UI5Panel
        title={error.message}
        accessibleName={t('components.accessible-name.error')}
      />
    );
  }
  if (!crd) {
    return null;
  }

  return (
    <>
      <DynamicPageComponent
        layoutNumber="midColumn"
        title={pluralize(crd?.spec?.names?.kind ?? '')}
        content={
          <CustomResources
            crd={crd}
            version={crd?.spec?.versions?.find((v) => v.served) as Version}
            showTitle={false}
            enableColumnLayout={enableColumnLayout}
            layoutCloseCreateUrl={layoutCloseCreateUrl}
          />
        }
      >
        <DynamicPageComponent.Column
          title={t('custom-resource-definitions.name_singular')}
        >
          <Link
            url={clusterUrl(`customresourcedefinitions/${crd?.metadata?.name}`)}
          >
            {crd?.metadata?.name}
          </Link>
        </DynamicPageComponent.Column>
      </DynamicPageComponent>
      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );
}
