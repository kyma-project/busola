import { List, ListItemStandard, Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { HttpError } from 'shared/hooks/BackendAPI/config';

type ErrorDetailsListProps = {
  causes: {
    field: string;
    message: string;
  }[];
};
function ErrorDetailsList({ causes }: ErrorDetailsListProps): React.ReactNode {
  const { t } = useTranslation();
  return (
    <List headerText={t('common.create-form.messages.error-details.title')}>
      {causes.map((cause: any) => (
        <ListItemStandard
          key={cause.field}
          text={t('common.create-form.messages.error-details.affected-field', {
            field: cause.field,
          })}
          description={cause.message}
          wrappingType={'Normal'}
        />
      ))}
    </List>
  );
}

type ErrorDetailsHeaderProps = {
  isEdit: boolean;
  singularName: string;
};

function ErrorDetailsHeader({
  isEdit,
  singularName,
}: ErrorDetailsHeaderProps): React.ReactNode {
  const { t } = useTranslation();

  return (
    <Text className="sap-padding">
      {t(
        isEdit
          ? 'common.create-form.messages.patch-failure'
          : 'common.create-form.messages.create-failure',
        {
          resourceType: singularName,
        },
      )}
    </Text>
  );
}

type ErrorDetailsSingleItemProps = {
  message: string;
};

function ErrorDetailsSingleItem({
  message,
}: ErrorDetailsSingleItemProps): React.ReactNode {
  const { t } = useTranslation();

  return (
    <List headerText={t('common.create-form.messages.error-details.title')}>
      <ListItemStandard
        text={message}
        wrappingType={'Normal'}
      ></ListItemStandard>
    </List>
  );
}

export type ErrorContentProps = {
  error: any;
  isEdit: boolean;
  singularName: string;
};
export function ErrorContent({
  error,
  isEdit,
  singularName,
}: ErrorContentProps): React.ReactNode {
  const { t } = useTranslation();

  if (error instanceof HttpError && error.errorDetails.causes) {
    const causes = error.errorDetails.causes;
    return (
      <>
        <ErrorDetailsHeader isEdit={isEdit} singularName={singularName} />
        <ErrorDetailsList causes={causes} />
      </>
    );
  } else {
    return (
      <>
        <ErrorDetailsHeader isEdit={isEdit} singularName={singularName} />
        <ErrorDetailsSingleItem message={error.message} />
      </>
    );
  }
}
