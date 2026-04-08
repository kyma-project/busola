import { expect } from 'vitest';
import { render } from '@testing-library/react';
import { ContentWrapper } from './ContentWrapper';

describe('ContentWrapper', () => {
  it('renders children inside #content-wrap', () => {
    const { getByTestId } = render(
      <ContentWrapper>
        <div data-testid="child">content</div>
      </ContentWrapper>,
    );

    expect(getByTestId('child')).toBeInTheDocument();
  });

  it('does not apply sap-margin-top-tiny class to #content-wrap', () => {
    const { container } = render(
      <ContentWrapper>
        <div />
      </ContentWrapper>,
    );

    const contentWrap = container.querySelector('#content-wrap');
    expect(contentWrap).not.toHaveClass('sap-margin-top-tiny');
  });

  it('does not apply border-radius to #content-wrap', () => {
    const { container } = render(
      <ContentWrapper>
        <div />
      </ContentWrapper>,
    );

    const contentWrap = container.querySelector('#content-wrap') as HTMLElement;
    expect(contentWrap.style.borderRadius).toBe('');
  });
});
