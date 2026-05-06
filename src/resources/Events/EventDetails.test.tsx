import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('./EventYaml', () => ({
  default: () => null,
}));

vi.mock('hooks/useMessageList', () => ({
  FormatInvolvedObject: (obj: any) => obj?.name ?? '',
  FormatSourceObject: (obj: any) => obj?.component ?? '',
}));

import { RowComponent, Specification } from './EventDetails';

describe('RowComponent', () => {
  it('renders nothing when value is falsy', () => {
    const { container } = render(<RowComponent name="label" value={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a LayoutPanelRow when value is provided', () => {
    const { container } = render(
      <RowComponent name="label" value="some value" />,
    );
    expect(container).not.toBeEmptyDOMElement();
    expect(container.textContent).toContain('some value');
  });
});

describe('Specification', () => {
  it('renders a ObjectStatus for warning type events', () => {
    const event = {
      type: 'Warning',
      message: 'Something went wrong',
      reason: 'BackOff',
      involvedObject: { kind: 'Pod', name: 'my-pod', namespace: 'default' },
      source: { component: 'kubelet' },
      reportingComponent: 'kubelet',
      count: 3,
    };

    const { container } = render(<Specification {...event} />);

    // ObjectStatus renders with aria-label="Warning"
    const warningStatus = container.querySelector('[aria-label="Warning"]');
    expect(warningStatus).toBeInTheDocument();
  });

  it('renders a ObjectStatus for normal type events', () => {
    const event = {
      type: 'Normal',
      message: 'Pod started',
      reason: 'Started',
      involvedObject: { kind: 'Pod', name: 'my-pod', namespace: 'default' },
      source: { component: 'kubelet' },
      reportingComponent: 'kubelet',
      count: 1,
    };

    const { container } = render(<Specification {...event} />);

    const normalStatus = container.querySelector('[aria-label="Normal"]');
    expect(normalStatus).toBeInTheDocument();
  });
});
