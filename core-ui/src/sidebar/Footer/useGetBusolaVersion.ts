import { useState, useEffect } from 'react';
import { useTranslation, TFunction } from 'react-i18next';
import jsyaml from 'js-yaml';

const BUSOLA_GITHUB_REPOSITORY_LINK = 'https://github.com/kyma-project/busola';
const BUSOLA_GITHUB_PULLS_LINK = 'https://github.com/kyma-project/busola';
const BUSOLA_GITHUB_COMMMITS_LINK = 'https://github.com/kyma-project/busola';

function createGithubLink(version: string): string {
  const devVersion = 'dev';
  const unknownVersion = 'Unknown';

  if (version !== devVersion && version !== unknownVersion) {
    if (version.startsWith('PR-')) {
      return `${BUSOLA_GITHUB_PULLS_LINK}/${version.slice(3)}`;
    }
    return `${BUSOLA_GITHUB_COMMMITS_LINK}/${version}`;
  }

  return BUSOLA_GITHUB_REPOSITORY_LINK;
}

async function getBusolaVersion(t: TFunction): Promise<string> {
  return await fetch('assets/version.yaml')
    .then(response => {
      return response.text();
    })
    .then(text => {
      const versionFile = jsyaml.load(text) as Record<string, string>;
      return versionFile.version;
    })
    .catch(() => t('common.statuses.unknown'));
}

type BusolaVersionDetails = {
  githubLink: string;
  busolaVersion: string;
};

export const useGetBusolaVersionDetails = (): BusolaVersionDetails => {
  const [versionDetails, setVersionDetails] = useState<BusolaVersionDetails>({
    githubLink: '',
    busolaVersion: '',
  });
  const { t } = useTranslation();

  useEffect(() => {
    const getVersion = async () => {
      const busolaVersion = await getBusolaVersion(t);
      const githubLink = createGithubLink(busolaVersion);

      setVersionDetails({
        busolaVersion,
        githubLink,
      });
    };

    void getVersion();
  }, []);

  return versionDetails;
};
