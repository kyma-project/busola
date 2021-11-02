import React from 'react';
import { StatusBadge } from 'react-shared';

export function JobCompletions({ job }) {
  const succeeded = job.status.succeeded || 0;
  const completions = job.spec.completions || 0;
  const statusType = succeeded === completions ? 'success' : 'info';
  return (
    <StatusBadge
      type={statusType}
    >{`${succeeded} / ${completions}`}</StatusBadge>
  );
}
