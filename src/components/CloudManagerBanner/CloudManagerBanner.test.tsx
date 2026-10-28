import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CloudManagerBanner } from './CloudManagerBanner';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('hooks/useCheckSAPUser', () => ({
  useCheckSAPUser: vi.fn(),
}));

vi.mock('shared/components/FeatureCard/FeatureCard', () => ({
  FeatureCardBanner: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe('CloudManagerBanner', () => {
  it('renders nothing for non-SAP users', () => {
    vi.mocked(useCheckSAPUser).mockReturnValue(false);
    const { container } = render(<CloudManagerBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the banner for SAP users', () => {
    vi.mocked(useCheckSAPUser).mockReturnValue(true);
    render(<CloudManagerBanner />);
    expect(screen.getByText('cloud-manager.banner.title')).toBeInTheDocument();
  });
});
