export type FeatureCardBannerProps = {
  id: string;
  title: string;
  description: string;
  design: string;
  image?: string;
  buttons?: React.ReactNode;
  titleIcon?: string;
};

export type IllustrationType = 'None' | 'AI' | 'Modules' | string;
export type ThemeType =
  | 'sap_horizon_hcw'
  | 'sap_horizon_hcb'
  | 'sap_horizon'
  | 'sap_horizon_dark'
  | 'light_dark'
  | string;

export interface BackgroundStyle {
  background: string;
}

export type DesignType = 'information-1' | 'information-2' | string;
