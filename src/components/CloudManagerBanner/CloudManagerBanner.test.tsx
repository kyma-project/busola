import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CloudManagerBanner } from './CloudManagerBanner';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';
import { useFeature } from 'hooks/useFeature';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('hooks/useCheckSAPUser', () => ({
  useCheckSAPUser: vi.fn(),
}));

vi.mock('hooks/useFeature', () => ({
  useFeature: vi.fn(),
}));

vi.mock('shared/components/FeatureCard/FeatureCard', () => ({
  FeatureCardBanner: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe('CloudManagerBanner', () => {
  it('renders when feature is enabled and user is SAP (internalOnly: true)', () => {
    vi.mocked(useFeature).mockReturnValue({
      isEnabled: true,
      internalOnly: true,
    });
    vi.mocked(useCheckSAPUser).mockReturnValue(true);
    render(<CloudManagerBanner />);
    expect(screen.getByText('cloud-manager.banner.title')).toBeInTheDocument();
  });

  it('hides when feature is disabled, even for SAP users', () => {
    vi.mocked(useFeature).mockReturnValue({
      isEnabled: false,
      internalOnly: true,
    });
    vi.mocked(useCheckSAPUser).mockReturnValue(true);
    const { container } = render(<CloudManagerBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('hides when feature is enabled and internalOnly but user is not SAP', () => {
    vi.mocked(useFeature).mockReturnValue({
      isEnabled: true,
      internalOnly: true,
    });
    vi.mocked(useCheckSAPUser).mockReturnValue(false);
    const { container } = render(<CloudManagerBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when feature is enabled, internalOnly is false, and user is not SAP', () => {
    vi.mocked(useFeature).mockReturnValue({
      isEnabled: true,
      internalOnly: false,
    });
    vi.mocked(useCheckSAPUser).mockReturnValue(false);
    render(<CloudManagerBanner />);
    expect(screen.getByText('cloud-manager.banner.title')).toBeInTheDocument();
  });
});
