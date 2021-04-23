import React, { useContext } from 'react';
import './LabelsDisplay.scss';
import { SearchParamsContext } from '../../Logs/SearchParams.reducer';
import { Token } from 'fundamental-react';

function getLabelsExceptOne(allLabels, labelToRemove) {
  return allLabels.filter(l => l !== labelToRemove);
}

export default function LabelsDisplay() {
  const [{ readonlyLabels, labels }, actions] = useContext(SearchParamsContext);

  return (
    <section className="labels-display">
      <ul>
        {readonlyLabels.map(label => (
          <li key={label}>
            <Token
              className="caption-muted y-fd-token--no-button"
              aria-label={`label-${label}`}
            >
              {label}
            </Token>
          </li>
        ))}
        {labels.map(label => (
          <li key={label}>
            <Token
              className="caption-muted"
              onClick={() =>
                actions.setLabels(getLabelsExceptOne(labels, label))
              }
              aria-label={`remove-label-${label}`}
            >
              {label}
            </Token>
          </li>
        ))}
      </ul>
      {!!labels.length && (
        <span
          data-test-id="clear-all"
          className="link-button fd-has-type-minus-1 fd-margin-begin--tiny"
          onClick={() => actions.setLabels([])}
        >
          Clear All
        </span>
      )}
    </section>
  );
}
