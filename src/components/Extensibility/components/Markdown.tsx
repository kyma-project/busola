import ReactMarkdown from 'marked-react';
import { isNil } from 'lodash';

import { useGetPlaceholder } from 'components/Extensibility/helpers';

import './Markdown.scss';

interface MarkdownProps {
  value: any;
  structure: any;
}

export function Markdown({ value, structure }: MarkdownProps) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  if (isNil(value) || value === '') {
    return emptyLeafPlaceholder;
  }

  // marked-react throws when given a non-string, so coerce defensively.
  // The expected input is a plain string (e.g. a ConfigMap data value).
  const text =
    typeof value === 'string' ? value : JSON.stringify(value, null, 2);

  return (
    <div
      className="extensibility-markdown sap-margin-small"
      data-testid="extensibility-markdown"
    >
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
