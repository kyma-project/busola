import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import './Categories.scss';

export const Categories = ({ categories }) => {
  return (
    <div className="categories-wrapper">
      {categories ? (
        categories.map(category => (
          <span className="fd-token fd-token--readonly" key={category}>
            <span
              className="fd-token__text fd-has-font-size-small"
              key={category}
            >
              {category}
            </span>
          </span>
        ))
      ) : (
        <p>{EMPTY_TEXT_PLACEHOLDER}</p>
      )}
    </div>
  );
};
