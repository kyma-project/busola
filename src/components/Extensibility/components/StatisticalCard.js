import { CountingCard } from 'shared/components/CountingCard/CountingCard';

export function StatisticalCard({ structure }) {
  return (
    <div className={`item-wrapper ${structure?.extraInfo ? 'wide' : 'small'}`}>
      <CountingCard
        className="item"
        value={structure?.value}
        title={structure?.name}
        subTitle={structure?.subTitle}
        resourceUrl={structure?.resourceUrl}
        isClusterResource={structure?.isClusterResource}
        extraInfo={structure?.extraInfo}
      />
    </div>
  );
}
