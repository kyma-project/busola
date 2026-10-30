import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CloudManagerBanner } from './CloudManagerBanner';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('hooks/useCheckSAPUser', () => ({
  useCheckSAPUser: vi.fn(),
}));

vi.mock('shared/components/FeatureCard/FeatureCard', () => ({
  FeatureCardBanner: ({
    title,
    buttons,
  }: {
    title: string;
    buttons?: React.ReactNode;
  }) => (
    <div>
      {title}
      {buttons}
    </div>
  ),
}));

describe('CloudManagerBanner', () => {
  it('renders for SAP users', () => {
    vi.mocked(useCheckSAPUser).mockReturnValue(true);
    render(<CloudManagerBanner />);
    expect(screen.getByText('cloud-manager.banner.title')).toBeInTheDocument();
  });

  it('hides for non-SAP users', () => {
    vi.mocked(useCheckSAPUser).mockReturnValue(false);
    const { container } = render(<CloudManagerBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('opens CLOUD_MANAGER_URL in a new tab when the Sign Up button is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.mocked(useCheckSAPUser).mockReturnValue(true);
    render(<CloudManagerBanner />);

    fireEvent.click(screen.getByText('cloud-manager.banner.open'));

    expect(openSpy).toHaveBeenCalledWith(
      'https://sapit-home-prod-004.launchpad.cfapps.eu10.hana.ondemand.com/site#my-events?sap-ui-app-id-hint=5cc2dc3b-651c-488f-be2d-3e9b3ca02ebb&/ig=16643034',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });
});
