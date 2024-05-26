import { CountingCard } from 'shared/components/CountingCard/CountingCard';

export function StatisticalCard({ structure }) {
  return (
    <CountingCard
      value={structure?.value}
      title={structure?.title}
      subTitle={structure?.subtitle}
      resourceUrl={structure?.resourUrl}
      isClusterResource={structure?.isClusterResource}
    />
  );
}
