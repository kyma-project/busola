import React from 'react';
import './DetailsCard.scss';

export function DetailsCard({ resource }) {
  console.log(resource);
  return (
    <div className="details-card-wrapper">
      <header className="details-card-header">
        {/* <div className="name-wrapper"> */}
        <p className="resource-name">{resource?.metadata?.name}</p>
        {/* </div> */}
        <p className="resource-kind">{resource?.kind}</p>
      </header>
      <div></div>
    </div>
  );
}
