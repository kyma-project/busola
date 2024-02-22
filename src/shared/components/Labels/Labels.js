import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Token, Label } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';
import './Labels.scss';
import { useRecoilValue } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';

const SHORTENING_TRESHOLD = 60;

export const Labels = ({
  labels,
  className = '',
  shortenLongLabels = true,
  style = null,
  displayLabelforLabels = false,
}) => {
  const [showMore, setShowMore] = useState(false);
  const layoutState = useRecoilValue(columnLayoutState);
  const LabelsDivRef = React.useRef(null);
  useEffect(() => {
    if (LabelsDivRef.current) {
      // console.log(LabelsDivRef.current.children);
      [...LabelsDivRef.current.children].forEach(element => {
        console.log(
          element,
          element.offsetTop - LabelsDivRef.current.offsetTop,
          element.offsetTop - LabelsDivRef.current.offsetTop >
            LabelsDivRef.current.clientHeight,
        );
      });
    }
  }, []);

  if (!labels || Object.keys(labels).length === 0) {
    return <span>{EMPTY_TEXT_PLACEHOLDER}</span>;
  }
  const separatedLabels = [];
  for (const key in labels) {
    separatedLabels.push(`${key}=${labels[key]}`);
  }

  const shortenLabel = label => label.slice(0, SHORTENING_TRESHOLD) + '...';
  function getComputedStyle() {
    let element = document.getElementById('LabelsDiv');

    if (!element) return 'XD';
    if (element.clientHeight < 80) {
      // console.log(
      //   'Smaller',
      //   element.clientHeight,
      //   element,
      //   element.offsetHeight,
      // );
      return false;
    } else {
      // console.log('Heigher', element.clientHeight, element);
      return true;
    }
  }
  // console.log(getComputedStyle());
  return (
    <>
      {displayLabelforLabels ? <Label showColon={true}>Labels</Label> : null}
      <div
        className={classNames(
          'labels',
          className,
          !showMore ? 'labels-less' : '',
        )}
        style={style}
        id="LabelsDiv"
        ref={LabelsDivRef}
      >
        {separatedLabels.map((label, id) => {
          // console.log(id, getComputedStyle());
          return (
            <>
              <Token
                aria-label={label}
                key={id}
                className="token"
                style={{
                  ...spacing.sapUiTinyMarginEnd,
                  // display: id < 2 || showMore ? 'inline' : 'none',
                }}
                readOnly
                text={
                  shortenLongLabels && label.length > SHORTENING_TRESHOLD
                    ? shortenLabel(label)
                    : label
                }
                title={
                  (shortenLongLabels &&
                    label.length > SHORTENING_TRESHOLD &&
                    label) ??
                  undefined
                }
              />
              {id > 2 && separatedLabels.length === id + 1 ? (
                <p onClick={() => setShowMore(true)}>XD</p>
              ) : null}
            </>
          );
        })}
      </div>
    </>
  );
};
