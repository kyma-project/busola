import React, { useState, useEffect, useRef } from 'react';

import { getSIPrefix } from 'shared/helpers/siPrefixes';

import './StatsGraph.scss';

const STATS_RATIO = 1 / 3;
const PADDING = 5;

function getGeometry(ctx, { scale, hScale, renderer, dataPoints }) {
  const textHeight = parseInt(ctx.font);
  const leftTextWidth = Math.max(
    ...Object.entries(scale.labels).map(
      ([, label]) => ctx.measureText(label).width,
    ),
  );
  const bottomTextWidth = Math.max(
    ...Object.entries(hScale).map(([, label]) => ctx.measureText(label).width),
  );
  console.log('bottomTextWidth', bottomTextWidth);

  const geo = {
    scaleWidth: leftTextWidth + PADDING,
    scaleHeight: textHeight + PADDING,
    graphPaddingH: bottomTextWidth / 2,
    graphPaddingV: textHeight / 2,
  };

  const width = ctx.canvas.width - geo.scaleWidth;
  const height = ctx.canvas.height - geo.scaleHeight;

  if (renderer.adjustGeometry) {
    renderer.adjustGeometry(ctx, geo, { width, height, dataPoints });
  }

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

export function lineRenderer(
  ctx,
  data,
  { geometry, dataPoints, color, scale },
) {
  const sectionWidth = geometry.graph.width / dataPoints;
  const dataOffset = dataPoints - data.length;

  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  data.forEach((value, index) => {
    const left =
      geometry.graph.left + sectionWidth * (dataOffset + index + 0.5);
    const top =
      geometry.graph.top +
      geometry.graph.height -
      (value / scale.max) * geometry.graph.height;

    if (index === 0) {
      ctx.moveTo(left, top);
    } else {
      ctx.lineTo(left, top);
    }
  });
  ctx.stroke();
}

export function barsRenderer(
  ctx,
  data,
  { geometry, dataPoints, color, scale },
) {
  const { sectionWidth, barWidth } = geometry;
  const dataOffset = dataPoints - data.length;

  ctx.fillStyle = color;
  data.forEach((value, index) => {
    const left =
      geometry.graph.left + sectionWidth * (dataOffset + index + 0.5);
    const bottom = geometry.graph.top + geometry.graph.height;
    const top = bottom - (value / scale.max) * geometry.graph.height;

    ctx.beginPath();
    ctx.ellipse(left, top, barWidth / 2, barWidth / 2, 0, Math.PI, 0);
    ctx.ellipse(left, bottom, barWidth / 2, barWidth / 2, 0, 0, Math.PI);
    ctx.fill();
  });
}
barsRenderer.adjustGeometry = (
  ctx,
  geometry,
  { width, height, dataPoints },
) => {
  geometry.sectionWidth = (width - 2 * geometry.graphPaddingH) / dataPoints;
  geometry.barWidth = geometry.sectionWidth / 2;

  const vSpacing = geometry.barWidth / 2;
  geometry.graphPaddingV = Math.max(geometry.graphPaddingV, vSpacing);
};

export function multiBarRenderer(
  ctx,
  data,
  { width, height, dataPoints, color, scale, hOffset },
) {}

export function StatsGraph({
  data,
  dataPoints,
  graphs,
  unit,
  binary,
  renderer,
  startDate,
  endDate,
}) {
  if (!data) data = [];

  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300 * STATS_RATIO);
  const [textColor, setTextColor] = useState('#000');
  const [barColor, setBarColor] = useState();
  const canvas = useRef();
  const css = useRef();

  useEffect(() => {
    console.log('color effect', canvas.current);
    css.current = getComputedStyle(canvas.current);
    const cssObserver = setInterval(() => {
      const cssColor = css.current?.getPropertyValue('color');
      if (textColor !== cssColor) {
        console.log('text color changed', textColor, cssColor);
        setTextColor(cssColor);
      }
      const cssBarColor = css.current?.getPropertyValue('--bar-color');
      if (barColor !== cssBarColor) {
        console.log('bar color changed', barColor, cssBarColor);
        setBarColor(cssBarColor);
      }
    }, 100);

    return () => {
      clearInterval(cssObserver);
    };
  }, [textColor, barColor]);

  useEffect(() => {
    if (!canvas.current) return;

    const resizeObserver = new ResizeObserver(([e]) => {
      setWidth(e.contentRect.width);
      setHeight(e.contentRect.height);
    });

    resizeObserver.observe(canvas.current);
  }, [canvas]);

  useEffect(() => {
    console.log('draw handler', css.current?.getPropertyValue('color'));
    if (!canvas.current && !data) return;

    const ctx = canvas.current?.getContext('2d');

    ctx.clearRect(0, 0, canvas.current?.width, canvas.current?.height);

    const scale = getScale({ data, unit, binary });
    const hScale = getTimeScale({ startDate, endDate });
    console.log(hScale);
    const geometry = getGeometry(ctx, { scale, hScale, renderer, dataPoints });

    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    Object.entries(scale.labels).forEach(([val, label]) =>
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
        geometry.graph.left + geometry.graph.width * (1 - val),
        geometry.hScale.top,
      ),
    );

    renderer(ctx, data, {
      geometry,
      scale,
      dataPoints,
      color: barColor || textColor,
    });
  }, [textColor, barColor, canvas, data, width, height]);

  return (
    <canvas
      className="stats-graph"
      ref={canvas}
      width={width}
      height={height}
    />
  );
}
