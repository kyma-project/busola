import { Link, Icon } from 'fundamental-react';

export function inputInfoLink(value) {
  if (value.includes('https') || value.includes('http')) {
    let link = value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
    let firstText = value
      .substring(0, value.indexOf('\\'))
      .replace('\\', '')
      .replace('[', '');
    let endText = value
      .substring(value.lastIndexOf('\\'))
      .replace('\\', '')
      .replace(')', '');
    let displayedLink;
    value.includes('[')
      ? (displayedLink = value.substring(
          value.indexOf('[') + 1,
          value.indexOf(']'),
        ))
      : (displayedLink = link);

    return (
      <div className="fd-row">
        <p style={{ color: 'var(--sapNeutralTextColor)' }}>
          {firstText}
          <Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            text={'test'}
          >
            {displayedLink}
            <Icon
              ariaLabel="Jsonata"
              className="fd-margin-begin--tiny"
              glyph="action"
            />
          </Link>
          {endText}
        </p>
      </div>
    );
  } else return value;
}
