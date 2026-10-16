import {
  Button,
  MessageStrip,
  Option,
  Select,
  TextArea,
  Title,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import jsyaml from 'js-yaml';
import { createUserManager } from 'state/authDataAtom';
import { KubeconfigOIDCAuth, ValidKubeconfig } from 'types';
import { useGardenerLogin } from './useGardenerLoginFunction';
import { parseOIDCparams } from 'components/Clusters/components/oidc-params';
import { FileInput } from 'shared/components/FileInput/FileInput';
import {
  getGardenServer,
  getGardenStaticToken,
} from 'components/Clusters/components/gardener/getGardenToken';

const DURATION_PRESETS_HOURS = [1, 4, 8, 24];
// sessionStorage keys: the pasted garden kubeconfig + chosen lifetime must
// survive the full-page OIDC redirect (there is no backend session to hold it).
const PENDING_GARDEN_KEY = 'gardener-login-garden';
const PENDING_DURATION_KEY = 'gardener-login-duration';

const readFile = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e?.target?.result as string) ?? '');
    reader.readAsText(file);
  });

export default function GardenerLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [gardenText, setGardenText] = useState('');
  const [expirationHours, setExpirationHours] = useState(8);
  const [report, setReport] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [busy, setBusy] = useState(false);

  const performGardenerLogin = useGardenerLogin(setReport);

  // We arrive here with ?code when the app entry bounced an OIDC callback to
  // this route (the gardener redirect_uri is the bare origin).
  const isOidcCallback = new URLSearchParams(window.location.search).has(
    'code',
  );

  const connectShoots = async (
    server: string,
    token: string,
    hours: number,
  ) => {
    setBusy(true);
    setError(null);
    try {
      await performGardenerLogin(server, token, hours * 60 * 60);
      navigate('/clusters');
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  };

  const onConnect = async () => {
    setError(null);
    let garden: ValidKubeconfig;
    try {
      garden = jsyaml.load(gardenText) as ValidKubeconfig;
    } catch {
      setError(new Error(t('clusters.gardener.errors.garden-parse')));
      return;
    }

    const server = getGardenServer(garden);
    if (!server) {
      setError(new Error(t('clusters.gardener.errors.no-garden-server')));
      return;
    }

    // Static-token garden kubeconfigs skip OIDC entirely.
    const staticToken = getGardenStaticToken(garden);
    if (staticToken) {
      await connectShoots(server, staticToken, expirationHours);
      return;
    }

    // OIDC: persist the pasted kubeconfig + duration across the redirect, then
    // go. The entry guard bounces the callback back here to finish.
    sessionStorage.setItem(PENDING_GARDEN_KEY, gardenText);
    sessionStorage.setItem(PENDING_DURATION_KEY, String(expirationHours));
    sessionStorage.setItem('gardener-oidc-return', '1');
    const userManager = createUserManager(
      parseOIDCparams(garden.users[0].user as KubeconfigOIDCAuth),
      '',
    );
    await userManager.clearStaleState();
    userManager.signinRedirect();
  };

  // Resume an OIDC login after the redirect: re-read the pasted garden
  // kubeconfig, complete the callback, then connect the shoots.
  useEffect(() => {
    if (!isOidcCallback) return;
    const resume = async () => {
      const pendingGarden = sessionStorage.getItem(PENDING_GARDEN_KEY);
      const hours = Number(sessionStorage.getItem(PENDING_DURATION_KEY)) || 8;
      if (!pendingGarden) return;

      let garden: ValidKubeconfig;
      try {
        garden = jsyaml.load(pendingGarden) as ValidKubeconfig;
      } catch {
        setError(new Error(t('clusters.gardener.errors.garden-parse')));
        return;
      }
      const server = getGardenServer(garden);
      if (!server) {
        setError(new Error(t('clusters.gardener.errors.no-garden-server')));
        return;
      }

      const userManager = createUserManager(
        parseOIDCparams(garden.users[0].user as KubeconfigOIDCAuth),
        '',
      );
      try {
        const storedUser = await userManager.getUser();
        const user =
          storedUser && !storedUser.expired
            ? storedUser
            : await userManager.signinRedirectCallback(window.location.href);
        sessionStorage.removeItem(PENDING_GARDEN_KEY);
        sessionStorage.removeItem(PENDING_DURATION_KEY);
        await connectShoots(server, user.id_token!, hours);
      } catch (e) {
        setError(e as Error);
      }
    };
    resume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showForm = !isOidcCallback && !busy;

  return (
    <div
      style={{ marginRight: '260px' }}
      className="add-cluster__content-container"
    >
      {showForm ? (
        <>
          <Title level="H4" className="sap-margin-bottom-small">
            {t('clusters.gardener.button')}
          </Title>
          <label>{t('clusters.gardener.garden-kubeconfig-label')}</label>
          <FileInput
            id="garden-kubeconfig-file"
            fileInputChanged={async (files: FileList) => {
              if (files?.[0]) setGardenText(await readFile(files[0]));
            }}
            acceptedFileFormats=".yaml,.yml"
            customMessage={t('clusters.wizard.kubeconfig-upload')}
          />
          <TextArea
            className="sap-margin-top-tiny"
            rows={10}
            value={gardenText}
            onInput={(e) => setGardenText(e.target.value ?? '')}
          />
          <label className="sap-margin-top-small">
            {t('clusters.gardener.duration-label')}
          </label>
          <Select
            onChange={(e) =>
              setExpirationHours(Number(e.detail.selectedOption.value))
            }
          >
            {DURATION_PRESETS_HOURS.map((h) => (
              <Option
                key={h}
                value={String(h)}
                selected={h === expirationHours}
              >
                {`${h} h`}
              </Option>
            ))}
          </Select>
          <div className="sap-margin-top-small">
            <Button
              design="Emphasized"
              disabled={!gardenText.trim()}
              onClick={onConnect}
            >
              {t('clusters.gardener.button')}
            </Button>
          </div>
        </>
      ) : (
        <MessageStrip
          design="Information"
          hideCloseButton
          className="sap-margin-top-small"
        >
          {report}
        </MessageStrip>
      )}
      {error && (
        <MessageStrip
          design="Negative"
          hideCloseButton
          className="sap-margin-top-small"
        >
          {t('clusters.gardener.error', { message: error.message })}
        </MessageStrip>
      )}
    </div>
  );
}
