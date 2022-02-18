import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { getSIPrefix } from 'shared/helpers/siPrefixes';

import './StatsGraph.scss';

const STATS_RATIO = 1 / 3;
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

  geo.sectionWidth = (width - 2 * geo.graphPaddingH) / dataPoints;
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
  if (!data.length) return { value: 1, precision: 0 };

  let maxData = +data?.reduce((acc, val) => Math.max(acc, val));

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
  if (!unit) {
    return value.toFixed(fixed);
  } else if (typeof unit === 'function') {
    return unit(value);
  } else {
    return getSIPrefix(value.toFixed(fixed), binary, { unit }).string;
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

function getTimeScale({ data, startDate, endDate }) {
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
}) {
  if (!data) data = [];

  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300 * STATS_RATIO);
  const [textColor, setTextColor] = useState('#000');
  const [barColor, setBarColor] = useState();
  const [highlightColor, setHighlightColor] = useState();
  const [tooltipColor, setTooltipColor] = useState();
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
  }, [textColor, barColor, highlightColor, tooltipColor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canvas.current) return;

    const resizeObserver = new ResizeObserver(([e]) => {
      setWidth(e.contentRect.width);
      setHeight(e.contentRect.height);
    });

    resizeObserver.observe(canvas.current);
  }, [canvas]);

  useEffect(() => {
    if (!canvas.current && !data) return;

    const ctx = canvas.current?.getContext('2d');
    ctx.clearRect(0, 0, canvas.current?.width, canvas.current?.height);

    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    Object.entries(scale?.labels || {}).forEach(([val, label]) =>
      ctx.fillText(
        label,
        geometry.scale.left,
        geometry.scale.top + geometry.scale.height * (1 - val),
      ),
    );

    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    Object.entries(hScale).forEach(([val, label]) =>
      ctx.fillText(
        label,
        geometry.graph.left + geometry.graph.width * val,
        geometry.hScale.top,
      ),
    );

    const dataOffset = dataPoints - data.length;
    const halfBar = geometry.barWidth / 2;

    const dataWithGeometry = data.map((value, index) => {
      const left =
        geometry.graph.left +
        geometry.sectionWidth * (dataOffset + index + 0.5);
      const bottom = geometry.graph.top + geometry.graph.height;
      const top = bottom - (value / scale.max) * geometry.graph.height;
      return { value, left, bottom, top };
    });

    dataWithGeometry.forEach(({ value, left, bottom, top }, index) => {
      if (activeBar !== null && index === activeBar - dataOffset) {
        if (highlightColor) {
          ctx.fillStyle = highlightColor;
        } else {
          ctx.fillStyle = barColor || textColor;
          ctx.globalAlpha = 0.5;
        }
        ctx.beginPath();
        ctx.ellipse(left, top, halfBar * 1.5, halfBar * 1.5, 0, Math.PI, 0);
        ctx.ellipse(left, bottom, halfBar * 1.5, halfBar * 1.5, 0, 0, Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = barColor || textColor;
      ctx.beginPath();
      ctx.ellipse(left, top, halfBar, halfBar, 0, Math.PI, 0);
      ctx.ellipse(left, bottom, halfBar, halfBar, 0, 0, Math.PI);
      ctx.fill();
    });

    dataWithGeometry.forEach(({ value, left, bottom, top }, index) => {
      if (activeBar !== null && index === activeBar - dataOffset) {
        const labelPadding = 2;
        const labelDef = getSIPrefix(value, binary, { unit });
        const labelWidth = ctx.measureText(labelDef.string).width;
        const labelHeight = parseInt(ctx.font);

        ctx.strokeStyle = textColor;
        ctx.fillStyle = tooltipColor;
        const rectCoords = [
          left - labelWidth / 2 - labelPadding,
          top - labelHeight - labelPadding,
          labelWidth + labelPadding * 2,
          labelHeight + labelPadding * 2,
        ];
        ctx.strokeRect(...rectCoords);
        ctx.fillRect(...rectCoords);

        ctx.fillStyle = textColor;
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'center';
        ctx.fillText(labelDef.string, left, top);
      }
    });
  }, [textColor, barColor, canvas, data, width, height, activeBar]); // eslint-disable-line react-hooks/exhaustive-deps

  const mousemove = e => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
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
