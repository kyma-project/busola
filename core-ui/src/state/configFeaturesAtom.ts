import { atom, RecoilState } from 'recoil';

type ConfigFeature = {
  isEnabled?: boolean;
  stage?: 'PRIMARY' | 'SECONDARY';
  [key: string]: any;
};
type ConfigFeaturesState = {
  BTP_CATALOG?: ConfigFeature;
  EVENTING?: ConfigFeature;
  API_GATEWAY?: ConfigFeature;
  APPLICATIONS?: ConfigFeature;
  SERVERLESS?: ConfigFeature;
  CUSTOM_DOMAINS?: ConfigFeature;
  ISTIO?: ConfigFeature;
  PROMETHEUS?: ConfigFeature;
  APPLICATION_CONNECTOR_FLOW?: ConfigFeature;
  LEGAL_LINKS?: ConfigFeature;
  SSO_LOGIN?: ConfigFeature;
  KUBECONFIG_ID?: ConfigFeature;
  SENTRY?: ConfigFeature;
  OBSERVABILITY?: ConfigFeature;
  HIDDEN_NAMESPACES?: ConfigFeature;
  VISUAL_RESOURCES?: ConfigFeature;
  EXTENSIBILITY?: ConfigFeature;
  TRACKING?: ConfigFeature;
};

const defaultValue = {};

export const configFeaturesState: RecoilState<ConfigFeaturesState> = atom<
  ConfigFeaturesState
>({
  key: 'configFeaturesState',
  default: defaultValue,
});
