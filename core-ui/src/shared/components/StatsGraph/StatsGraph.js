import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { getSIPrefix } from 'shared/helpers/siPrefixes';

import './StatsGraph.scss';

const CANVAS_SCALE = 2;
const STATS_RATIO = 1 / 6;
const PADDING = 5;

function getGeometry(ctx, { scale, hScale, dataPoints }) {
  const textHeight = parseInt(ctx?.font);
  const leftTextWidth = Math.max(
    ...Object.entries(scale.labels).map(
      ([, label]) => ctx?.measureText(label).width,
    ),
  );
  const bottomTextWidth = Math.max(
    ...Object.entries(hScale).map(([, label]) => ctx?.measureText(label).width),
  );

  const geo = {
    scaleWidth: leftTextWidth + PADDING,
    scaleHeight: textHeight + PADDING,
    graphPaddingH: bottomTextWidth / 2,
    graphPaddingV: textHeight / 2,
  };

  const width = ctx?.canvas.width - geo.scaleWidth;
  const height = ctx?.canvas.height - geo.scaleHeight;

  // make sure geo.sectionWidth is not negative on really tiny screens
  geo.sectionWidth = Math.abs((width - 2 * geo.graphPaddingH) / dataPoints);
  geo.barWidth = geo.sectionWidth / 2;

  const vSpacing = geo.barWidth / 2;
  geo.graphPaddingV = Math.max(geo.graphPaddingV, vSpacing);

  const graphWidth = width - geo.graphPaddingH * 2;
  const graphHeight = height - geo.graphPaddingV * 2;

  return {
    ...geo,
    scale: {
      left: 0,
      top: geo.graphPaddingV,
      width: geo.scaleWidth,
      height: graphHeight,
    },
    graph: {
      left: geo.scaleWidth + geo.graphPaddingH,
      top: geo.graphPaddingV,
      width: graphWidth,
      height: graphHeight,
    },
    hScale: {
      top: graphHeight + 2 * geo.graphPaddingV + PADDING,
    },
  };
}

function getScaleMax(data, binary = false) {
  if (!data || !data.length) return { value: 1, precision: 0 };

  let maxData = Math.max(...data.map(val => val.reduce((a, b) => +a + +b)));

  if (!maxData) {
    return { value: 1, precision: 0 };
  }

  let precision = 0;
  let binLevel = 0;

  if (binary) {
    while (maxData >= 1024) {
      maxData /= 1024;
      binLevel++;
    }
  } else {
    while (maxData < 1) {
      maxData *= 10;
      precision--;
    }
  }

  while (maxData >= 10) {
    maxData /= 10;
    precision++;
  }

  maxData = Math.ceil(maxData);
  maxData *= 10 ** precision;
  maxData *= 1024 ** binLevel;

  return {
    value: maxData,
    precision,
  };
}

function getScaleLabel(value, { unit, binary, fixed }) {
  if (typeof unit === 'string') {
    return getSIPrefix(value, binary, { unit }).string;
  } else if (typeof unit === 'function') {
    return unit(value);
  } else {
    return value.toFixed(fixed);
  }
}

function getScale({ data, unit, binary }) {
  const scaleMax = getScaleMax(data, binary);

  const min = 0;
  const max = scaleMax.value;

  let fixed = -scaleMax.precision;
  if (fixed < 0) fixed = 0;

  return {
    min,
    max,
    labels: {
      0: getScaleLabel(min, { unit, binary, fixed }),
      '0.5': getScaleLabel(0.5 * max, { unit, binary, fixed }),
      1: getScaleLabel(max, { unit, binary, fixed }),
    },
  };
}

function getTimeScaleLabel(time) {
  const date = new Date();
  date.setTime(time);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeScale({ startDate, endDate }) {
  const min = startDate.getTime();
  const max = endDate.getTime();
  const diff = max - min;
  return {
    0: getTimeScaleLabel(min),
    '0.25': getTimeScaleLabel(min + 0.25 * diff),
    '0.5': getTimeScaleLabel(min + 0.5 * diff),
    '0.75': getTimeScaleLabel(min + 0.75 * diff),
    1: getTimeScaleLabel(max),
  };
}

export function StatsGraph({
  className,
  data,
  dataPoints,
  graphs,
  unit,
  binary,
  startDate,
  endDate,
  labels,
  displayTotal,
}) {
  if (!data) data = [];
  data = data.map(val => (Array.isArray(val) ? val : [val]));

  const { t } = useTranslation();

  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300 * STATS_RATIO);
  const [textColor, setTextColor] = useState('#000');
  const [barColor, setBarColor] = useState('');
  const barColors = barColor.trim().split(/ +/);
  const [highlightColor, setHighlightColor] = useState('');
  const highlightColors = highlightColor.trim().split(/ +/);
  const [tooltipColor, setTooltipColor] = useState();
  const [font, setFont] = useState();
  const [activeBar, setActiveBar] = useState(null);
  const canvas = useRef();
  const css = useRef();

  const ctx = canvas.current?.getContext('2d');
  const scale = getScale({ data, unit, binary });
  const hScale = getTimeScale({ startDate, endDate });
  const geometry = getGeometry(ctx, { scale, hScale, dataPoints });

  const watchCss = [
    ['color', textColor, setTextColor],
    ['--bar-color', barColor, setBarColor],
    ['--highlight-color', highlightColor, setHighlightColor],
    ['--tooltip-color', tooltipColor, setTooltipColor],
    ['font-size', font, setFont],
  ];
  useEffect(() => {
    css.current = getComputedStyle(canvas.current);
    const cssObserver = setInterval(() => {
      watchCss.forEach(([prop, value, setter]) => {
        const cssValue = css.current?.getPropertyValue(prop);
        if (value !== cssValue) setter(cssValue);
      });
    }, 100);

    return () => clearInterval(cssObserver);
  }, [textColor, barColor, highlightColor, tooltipColor, font]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canvas.current) return;

    const resizeObserver = new ResizeObserver(([e]) => {
      setWidth(e.contentRect.width * CANVAS_SCALE);
      setHeight(e.contentRect.height * CANVAS_SCALE);
    });

    resizeObserver.observe(canvas.current);
  }, [canvas]);

  useEffect(() => {
    if (!canvas.current && !data) return;

    const ctx = canvas.current?.getContext('2d');
    ctx.clearRect(0, 0, canvas.current?.width, canvas.current?.height);

    ctx.font = `${parseInt(font) * CANVAS_SCALE}px sans-serif`;
    ctx.lineWidth = CANVAS_SCALE;

    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    Object.entries(scale?.labels || {}).forEach(([val, label]) =>
      ctx.fillText(
        label,
        Math.round(geometry.scale.left),
        Math.round(geometry.scale.top + geometry.scale.height * (1 - val)),
      ),
    );

    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    Object.entries(hScale).forEach(([val, label]) =>
      ctx.fillText(
        label,
        Math.round(geometry.graph.left + geometry.graph.width * val),
        Math.round(geometry.hScale.top),
      ),
    );

    const dataOffset = dataPoints - data.length;
    const halfBar = geometry.barWidth / 2;

    const dataWithGeometry = data.map((value, index) => {
      const left =
        geometry.graph.left +
        geometry.sectionWidth * (dataOffset + index + 0.5);
      if (Array.isArray(value)) {
        const bottom = geometry.graph.top + geometry.graph.height;
        const bars = value.reduce(
          (acc, val) => [
            acc[0] - (val / scale.max) * geometry.graph.height,
            ...acc,
          ],
          [bottom],
        );
        return { value, left, bars };
      } else {
        const bottom = geometry.graph.top + geometry.graph.height;
        const top = bottom - (value / scale.max) * geometry.graph.height;
        return { value, left, bars: [top, bottom] };
      }
    });

    dataWithGeometry.forEach(({ value, left, bars }, index) => {
      if (value[0] === null) return;

      if (activeBar !== null && index === activeBar - dataOffset) {
        bars.reduce((top, bottom, idx) => {
          if (highlightColor) {
            ctx.fillStyle = highlightColors[idx - 1];
          } else {
            ctx.fillStyle = barColors[idx - 1] || textColor;
            ctx.globalAlpha = 0.5;
          }

          ctx.beginPath();
          ctx.ellipse(left, top, halfBar * 1.5, halfBar * 1.5, 0, Math.PI, 0);
          ctx.ellipse(
            left,
            bottom,
            halfBar * 1.5,
            halfBar * 1.5,
            0,
            0,
            Math.PI,
          );
          ctx.fill();
          return bottom;
        });
        ctx.globalAlpha = 1;
      }

      bars.reduce((top, bottom, idx) => {
        ctx.fillStyle = barColors[idx - 1] || textColor;
        ctx.beginPath();
        ctx.ellipse(left, top, halfBar, halfBar, 0, Math.PI, 0);
        ctx.ellipse(left, bottom, halfBar, halfBar, 0, 0, Math.PI);
        ctx.fill();
        return bottom;
      });
    });

    dataWithGeometry.forEach(({ value, left, bars }, index) => {
      if (value[0] === null) return;

      if (!Array.isArray(value)) {
        value = [value];
      }

      if (activeBar !== null && index === activeBar - dataOffset) {
        const labelPadding = 2;
        let labelContent;
        if (value.length === 1 && !labels?.[0]) {
          labelContent = [getSIPrefix(value[0], binary, { unit }).string];
        } else {
          // graphs are created from the bottom to the top. reverse the tooltips order to align.
          const valueReversed = [...value]?.reverse();
          labelContent = valueReversed?.map((val, idx) => {
            const labelTitle = labels?.[idx] || idx + 1;
            const labelValue = getSIPrefix(val, binary, { unit }).string;
            return `${labelTitle}: ${labelValue}`;
          });
          if (displayTotal) {
            const sum = value.reduce((a, b) => +a + +b);
            const sumLabel = getSIPrefix(sum, binary, { unit }).string;
            labelContent.push(`${t('graphs.total')}: ${sumLabel}`);
          }
        }

        const labelWidth = Math.max(
          ...labelContent.map(labelLine => ctx.measureText(labelLine).width),
        );
        const lineHeight = parseInt(ctx.font) * 1.2;
        const labelHeight = lineHeight * labelContent.length;

        const boxWidth = Math.round(labelWidth + labelPadding * 2);
        const boxHeight = Math.round(labelHeight + labelPadding * 2);

        let top = bars[0];
        let boxLeft = Math.round(left - boxWidth / 2);
        let boxTop = Math.round(top - lineHeight - labelPadding);

        if (boxTop < 0) {
          const overflow = 2 - boxTop;
          top += overflow;
          boxTop += overflow;
        }
        if (boxLeft < geometry.graph.left) {
          const overflow = geometry.graph.left + 2 - boxLeft;
          left += overflow;
          boxLeft += overflow;
        }
        if (boxLeft + boxWidth > width) {
          const overflow = boxLeft + boxWidth - width + 2;
          left -= overflow;
          boxLeft -= overflow;
        }
        if (boxTop + boxHeight > geometry.graph.height) {
          const overflow = boxTop + boxHeight - geometry.graph.height;
          top -= overflow;
          boxTop -= overflow;
        }

        const boxCoords = [boxLeft, boxTop, boxWidth, boxHeight];

        ctx.strokeStyle = textColor;
        ctx.strokeRect(...boxCoords);

        ctx.fillStyle = tooltipColor;
        ctx.fillRect(...boxCoords);

        ctx.fillStyle = textColor;
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'center';
        labelContent.forEach((labelLine, index) => {
          ctx.fillText(
            labelLine,
            Math.round(left),
            Math.round(top) + index * lineHeight,
          );
        });
      }
    });
  }, [textColor, barColor, canvas, data, width, height, activeBar]); // eslint-disable-line react-hooks/exhaustive-deps

  const mousemove = e => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left) * CANVAS_SCALE;
    const y = Math.round(e.clientY - rect.top) * CANVAS_SCALE;
    const bar = Math.floor((x - geometry.graph.left) / geometry.sectionWidth);

    if (y > geometry.graph.height + geometry.graph.top) {
      setActiveBar(null);
    } else if (bar >= 0 && bar <= dataPoints) {
      setActiveBar(bar);
    } else {
      setActiveBar(null);
    }
  };

  return (
    <canvas
      className={classNames('stats-graph', className)}
      ref={canvas}
      width={width}
      height={height}
      onMouseMove={mousemove}
      onMouseOut={() => setActiveBar(null)}
    />
  );
}
