import { CountingCard } from 'shared/components/CountingCard/CountingCard';

export function StatisticalCard({ structure }) {
  return (
    <CountingCard
      value={structure?.value}
      title={structure?.title}
      subTitle={structure?.subTitle}
      resourceUrl={structure?.resourceUrl}
      isClusterResource={structure?.isClusterResource}
      extraInfo={structure?.extraInfo}
    />
  );
}
