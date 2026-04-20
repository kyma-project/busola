import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { RuleTitle } from './RuleTitle';

describe('RuleTitle', () => {
  it('renders the rule number without an alert icon when the rule is valid', () => {
    const validRule = {
      apiGroups: [''],
      resources: ['pods'],
      verbs: ['get'],
    };
    const { container } = render(<RuleTitle rule={validRule} i={0} />);
    expect(
      container.querySelector('ui5-icon[name="alert"]'),
    ).not.toBeInTheDocument();
    expect(container.textContent).toContain('1');
  });

  it('renders the invalid-rule alert with a native title tooltip when the rule mixes resource and non-resource fields', () => {
    const invalidRule = {
      nonResourceURLs: ['/healthz'],
      apiGroups: [''],
      resources: ['pods'],
    };
    const { container } = render(<RuleTitle rule={invalidRule} i={1} />);
    const icon = container.querySelector('ui5-icon[name="alert"]');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('title', 'roles.messages.invalid');
  });

  it('renders the missing-data alert with a native title tooltip when required properties are missing', () => {
    const incompleteRule = {
      apiGroups: [''],
      resources: [],
      verbs: [],
    };
    const { container } = render(<RuleTitle rule={incompleteRule} i={2} />);
    const icon = container.querySelector('ui5-icon[name="alert"]');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('title', 'common.messages.fill-required-data');
  });
});
