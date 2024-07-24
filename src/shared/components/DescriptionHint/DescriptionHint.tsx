import { Button, Popover, Text } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import React, { CSSProperties, ReactNode, useRef, useState } from 'react';
import { uniqueId } from 'lodash';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useGetTranslation } from '../../../components/Extensibility/helpers';

// this regex catch 2 things, markdown URL or normal URL
// markdown url consists of 2 groups: [text](url)
//source: https://github.com/kyma-incubator/milv/blob/main/pkg/parser.go#L22
const LinkRegexExpression = /\[([^\]]*)\]\(([^)]*)\)|\bhttps?:\/\/\S*\b/gm;

type HintButtonProps = {
  setShowTitleDescription: React.Dispatch<React.SetStateAction<boolean>>;
  showTitleDescription: boolean;
  description: string | ReactNode;
  style?: CSSProperties;
  disableLinkDetection?: boolean;
};

export function HintButton({
  setShowTitleDescription,
  showTitleDescription,
  description,
  style,
  disableLinkDetection = false,
}: HintButtonProps) {
  const [ID] = useState(uniqueId('id-')); //todo: migrate to useID from react after upgrade to version 18+
  const descBtnRef = useRef(null);

  const { t, widgetT } = useGetTranslation();
  let desc = t(description);
  if (!disableLinkDetection && typeof description === 'string') {
    // desc = enhanceWithLinks(description);
  }
  console.log(desc, description);
  return (
    <>
      <Button
        id={`descriptionOpener-${ID}`}
        ref={descBtnRef}
        icon="hint"
        design="Transparent"
        style={style}
        onClick={e => {
          e.stopPropagation();
          setShowTitleDescription(true);
        }}
      />
      {createPortal(
        <Popover
          opener={`descriptionOpener-${ID}`}
          //Point initial focus to other component removes the focus from the link in description
          onAfterOpen={() => {
            // @ts-ignore
            descBtnRef.current.focus();
          }}
          open={showTitleDescription}
          onAfterClose={e => {
            e.stopPropagation();
            setShowTitleDescription(false);
          }}
          placementType="Right"
        >
          <Text className="description">{desc}</Text>
        </Popover>,
        document.body,
      )}
    </>
  );
}

function enhanceWithLinks(text: string): JSX.Element | null {
  // const [a,b ] = useState("")
  if (!text) {
    return null;
  }
  const re = new RegExp(LinkRegexExpression);

  const regexResult = text.matchAll(re);
  // const result = re.exec(text)
  if (!regexResult) {
    return <>{text}</>;
  }

  // console.log(regexResult);

  const result = [...regexResult];
  console.log(result);
  if (result.length === 0) {
    return <>{text}</>;
  }

  let modifiedText = text;
  let idx = 0;
  for (const r of result) {
    modifiedText = modifiedText.replace(r[0], `<>`);
    // console.log(r[0], modifiedText)
    idx++;
    // console.log(r);
  }

  return (
    <>
      {modifiedText.split('<>').map((val, idx) => {
        console.log('Val: ', val);
        console.log('idx: ', idx, 'result len: ', result.length);
        if (idx >= result.length) {
          return <>{val}</>;
        }
        console.log(idx);
        const r = result[idx];
        console.log(idx, ':', r);
        if (r[1] === undefined) {
          return (
            <>
              {val}
              <ExternalLink url={r[0]}>{r[0]}</ExternalLink>
            </>
          );
        } else {
          // md link
          return (
            <>
              {val}
              <ExternalLink url={r[2]}>{r[1]}</ExternalLink>
            </>
          );
        }
      })}
    </>
  );
}
