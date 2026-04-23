import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CronJobSchedule } from './CronJobSchedule';

describe('CronJobSchedule', () => {
  it('renders the raw schedule text', () => {
    const { container } = render(<CronJobSchedule schedule="0 0 * * 1" />);
    expect(container.textContent).toBe('0 0 * * 1');
  });

  it('exposes a human-readable title for a valid cron expression', () => {
    const { container } = render(<CronJobSchedule schedule="0 0 * * 1" />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    // cronstrue describes "0 0 * * 1" as a Monday-at-midnight schedule.
    expect(span).toHaveAttribute('title', expect.stringMatching(/Monday/i));
  });

  it('falls back to an empty title for an invalid cron expression', () => {
    const { container } = render(<CronJobSchedule schedule="not-a-cron" />);
    const span = container.querySelector('span');
    expect(span).toHaveAttribute('title', '');
  });
});
