import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));

vi.mock('jotai', () => ({
  useAtomValue: () => 'sap_horizon',
}));

import { FeatureCardBanner } from './FeatureCard';

const renderBanner = (id = 'test-banner') =>
  render(
    <FeatureCardBanner
      id={id}
      title="Banner title"
      description="Banner description"
      design="information-1"
    />,
  );

describe('FeatureCardBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the banner when it was never dismissed', () => {
    renderBanner();

    expect(screen.getByText('Banner title')).toBeInTheDocument();
  });

  it('stores the dismissal in local storage when closing the banner', () => {
    const { container } = renderBanner();

    const closeButton = container.querySelector('.decline-button');
    expect(closeButton).not.toBeNull();
    fireEvent.click(closeButton!);

    expect(screen.queryByText('Banner title')).not.toBeInTheDocument();
    expect(localStorage.getItem('hideBannertest-banner')).toEqual('true');
  });

  it('stays hidden on the next mount after being dismissed', () => {
    localStorage.setItem('hideBannertest-banner', 'true');

    renderBanner();

    expect(screen.queryByText('Banner title')).not.toBeInTheDocument();
  });

  it('keeps the dismissed state per banner id', () => {
    localStorage.setItem('hideBannerother-banner', 'true');

    renderBanner();

    expect(screen.getByText('Banner title')).toBeInTheDocument();
  });
});
