import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'fundamental-react';

export const Link = ({ url, text, className, children }) => {
  return (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text || children || url}
      <Icon
        glyph="inspect"
        size="s"
        className="fd-margin-begin--tiny"
        ariaLabel="This link will be opened in a new tab"
      />
    </a>
  );
};

Link.propTypes = {
  url: PropTypes.string.isRequired,
  text: PropTypes.string,
};
