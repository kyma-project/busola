import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { UI5Card } from './UI5Card';

describe('UI5Card', () => {
  it('renders children inside the card', () => {
    const { getByTestId } = render(
      <UI5Card title="Test">
        <div data-testid="child">content</div>
      </UI5Card>,
    );

    expect(getByTestId('child')).toBeInTheDocument();
  });

  it('uses the native CardHeader for a plain string title with no actions', () => {
    const { container } = render(<UI5Card title="Simple">children</UI5Card>);

    expect(container.querySelector('.bsl-card-toolbar')).toBeNull();
    expect(container.querySelector('ui5-card-header')).not.toBeNull();
  });

  it('renders the title text on the native CardHeader', () => {
    const { container } = render(<UI5Card title="Hello">x</UI5Card>);

    const header = container.querySelector('ui5-card-header');
    expect(header?.getAttribute('title-text')).toBe('Hello');
  });

  it('uses the toolbar-style header when modeActions is provided alongside headerActions', () => {
    const { container } = render(
      <UI5Card
        title="Test"
        modeActions={<span data-testid="mode">m</span>}
        headerActions={<span>h</span>}
      >
        x
      </UI5Card>,
    );

    expect(container.querySelector('.bsl-card-toolbar')).not.toBeNull();
    expect(container.querySelector('[data-testid="mode"]')).not.toBeNull();
  });

  it('uses the toolbar-style header when title is a ReactNode', () => {
    const { container } = render(
      <UI5Card title={<span data-testid="custom-title">T</span>}>x</UI5Card>,
    );

    expect(container.querySelector('.bsl-card-toolbar')).not.toBeNull();
    expect(
      container.querySelector('[data-testid="custom-title"]'),
    ).not.toBeNull();
  });

  it('forwards accessibleName, role and testid onto the Card', () => {
    const { getByTestId } = render(
      <UI5Card
        title="T"
        testid="my-card"
        accessibleName="accessible"
        role="region"
      >
        x
      </UI5Card>,
    );

    const card = getByTestId('my-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('accessible-name', 'accessible');
    expect(card).toHaveAttribute('role', 'region');
  });

  it('applies className on the Card root', () => {
    const { getByTestId } = render(
      <UI5Card title="T" testid="my-card" className="my-extra">
        x
      </UI5Card>,
    );

    const card = getByTestId('my-card');
    expect(card).toHaveClass('my-extra');
  });

  it('does not apply sap-margin-small to a top-level card', () => {
    const { getByTestId } = render(
      <UI5Card title="T" testid="outer">
        x
      </UI5Card>,
    );

    expect(getByTestId('outer')).not.toHaveClass('sap-margin-small');
  });

  it('applies sap-margin-small to a nested card', () => {
    const { getByTestId } = render(
      <UI5Card title="Outer" testid="outer">
        <UI5Card title="Inner" testid="inner">
          x
        </UI5Card>
      </UI5Card>,
    );

    expect(getByTestId('outer')).not.toHaveClass('sap-margin-small');
    expect(getByTestId('inner')).toHaveClass('sap-margin-small');
  });

  it('renders headerActions twice (invisible + visible) when combined with modeActions', () => {
    const { container } = render(
      <UI5Card
        title="T"
        headerActions={<span data-testid="ha">a</span>}
        modeActions={<span>m</span>}
      >
        x
      </UI5Card>,
    );

    const actionWrappers = container.querySelectorAll('.header-actions');
    expect(actionWrappers.length).toBe(2);
    expect(container.querySelectorAll('[data-testid="ha"]').length).toBe(2);
    expect(container.querySelector('.header-actions.invisible')).not.toBeNull();
  });

  it('renders headerActions in the toolbar header (not the native CardHeader action slot)', () => {
    const { getByTestId, container } = render(
      <UI5Card title="T" headerActions={<button data-testid="ha">go</button>}>
        x
      </UI5Card>,
    );

    expect(container.querySelector('.bsl-card-toolbar')).not.toBeNull();
    const action = getByTestId('ha');
    expect(action).toBeInTheDocument();
    expect(action.getAttribute('slot')).not.toBe('action');
  });

  it('uses the toolbar-style header whenever headerActions is provided, even with a string title', () => {
    const { container } = render(
      <UI5Card title="Simple" headerActions={<span>a</span>}>
        x
      </UI5Card>,
    );

    expect(container.querySelector('.bsl-card-toolbar')).not.toBeNull();
  });

  it('forwards a ref to the underlying Card element', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <UI5Card title="T" ref={ref}>
        x
      </UI5Card>,
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current).toBe(container.querySelector('ui5-card'));
  });
});
