import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

import { SecretCreate } from './SecretCreate';

export function SecretList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy
          ownerReferences={secret.metadata.ownerReferences}
          kindOnly
        />
      ),
    },
    {
      header: t('secrets.headers.type'),
      value: secret => {
        return secret.type;
      },
    },
  ];

  const description = (
    <Trans i18nKey="secrets.description">
      <ExternalLink
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/configuration/secret/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
      createResourceForm={SecretCreate}
      emptyListProps={{
        subtitleText: t('secrets.description'),
        url: 'https://kubernetes.io/docs/concepts/configuration/secret/',
      }}
    />
  );
}
export default SecretList;
