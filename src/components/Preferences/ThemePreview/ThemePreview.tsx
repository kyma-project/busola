import './ThemePreview.scss';
import {
  ThemePreviewImage,
  ThemePreviewProps,
} from './ThemePreviewImage/ThemePreviewImage';

export function ThemePreview({ theme }: ThemePreviewProps) {
  if (theme === 'light_dark') {
    return (
      <div className="double-theme">
        <div className="double-theme-half">
          <ThemePreviewImage theme="sap_horizon_dark" />
        </div>
        <div className="double-theme-half">
          <ThemePreviewImage theme="sap_horizon" />
        </div>
      </div>
    );
  }

  return (
    <div className="theme-wrapper">
      <ThemePreviewImage theme={theme} />
    </div>
  );
}
