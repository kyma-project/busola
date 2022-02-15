import React, { useState, useEffect, useRef } from 'react';

import { getSIPrefix } from 'shared/helpers/siPrefixes';

import './StatsGraph.scss';

const STATS_RATIO = 1 / 3;
const PADDING = 5;

function getGeometry(ctx, { scale, renderer, dataPoints }) {
  const textHeight = parseInt(ctx.font);
  const leftTextWidth = Math.max(
    ...Object.entries(scale.labels).map(
      ([, label]) => ctx.measureText(label).width,
    ),
  );
  // TODO bottom scale
  // const bottomTextWidth = Math.max(...Object.entries(scale.labels).map(([,label]) => ctx.measureText(label)));

  const geo = {
    scaleWidth: leftTextWidth + PADDING,
    scaleHeight: 0, // TODO
    // scaleHeight: textHeight + PADDING,
    graphPaddingH: 0,
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
      '0.33': getScaleLabel(0.33 * max, { unit, binary, fixed }),
      '0.66': getScaleLabel(0.66 * max, { unit, binary, fixed }),
      1: getScaleLabel(max, { unit, binary, fixed }),
    },
  };
}

// function generateScale(side, defs, graphs, data) {
// if (!graphs.any(graph => graph.scale === side )) return null;
// let scale = defs[side] || { min: 0 };

// if (!scale.max) {
// graphs.filter(graph.scale === side).map(graph => graph.field);
// }

// return scale;
// }

/*
function lineRenderer(ctx, data, { width, height, dataPoints, color, scale }) {
  const sectionWidth = width / dataPoints;
  const offset = dataPoints - data.length;

  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  data.forEach((value, index) => {
    const left = sectionWidth * (offset + index + 0.5);
    const top = height - Math.max((value / scale.max) * height, 1);

    if (index === 0) {
      ctx.moveTo(left, top);
    } else {
      ctx.lineTo(left, top);
    }
  });
  ctx.stroke();
}
*/

export function barsRenderer(
  ctx,
  data,
  { geometry, dataPoints, color, scale },
) {
  const { sectionWidth, barWidth } = geometry;

  const vOffset = barWidth / 2;
  const dataOffset = dataPoints - data.length;

  ctx.fillStyle = color;
  data.forEach((value, index) => {
    const left =
      geometry.graph.left + sectionWidth * (dataOffset + index + 0.5);
    const bottom = geometry.graph.top + geometry.graph.height;
    const top = bottom - (value / scale.max) * geometry.graph.height;

    // ctx.fillRect(left - barWidth / 2, top, barWidth, height - top);

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
  geometry.sectionWidth = width / dataPoints;
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
}) {
  if (!data) data = [];

  // TODO multiple scales
  // const scales = {
  // left: {
  // min: 0,
  // max: scaleMax.value,
  // }
  // }
  // scales = {
  // left: generateScale('left', scales, graphs, data),
  // right: generateScale('right', scales, graphs, data),
  // };

  /*
  if (!scales) {
    scales = {};
  }
  if (!scales.left) {
    scales.left = { min: 0 };
  }
  if (hasRightScale && !scales.right) {
    scales.right = { min: 0 };
  }

  if (!scales.left.max) {
    graphs.filter(graph => graph.scale);
  }
  */

  // if (!scales) {
  // // TODO
  // scales = {
  // left: {
  // min: 0,
  // max: 100,
  // },
  // }

  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300 * STATS_RATIO);
  const [textColor, setTextColor] = useState('#000');
  const [barColor, setBarColor] = useState();
  const canvas = useRef();
  const css = useRef();

  const watchCss = (css, value, setter) => {
    const cssValue = css.current?.getPropertyValue(css);
    console.log('css value?', css, value, cssValue);
    if (value !== cssValue) {
      console.log('css value changed', css, value, cssValue);
      setter(cssValue);
    }
  };

  useEffect(() => {
    console.log('color effect', canvas.current);
    css.current = getComputedStyle(canvas.current);
    // const color = css.getPropertyValue('color');
    // const bgColor = css.getPropertyValue('background-color');
    // console.log('computed style', { color, bgColor });
    const cssObserver = setInterval(() => {
      // watchCss('color', textColor, setTextColor);
      // watchCss('--bar-color', barColor, setBarColor);
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
    // ctx.fillStyle = css.current?.getPropertyValue('background-color');
    // ctx.fillRect(0, 0, width, height);

    /*
    const scaleMax = getScaleMax(data, binary);

    const scale = {
      min: 0,
      max: scaleMax.value,
    };

    let fixed = -scaleMax.precision;
    if (fixed < 0) fixed = 0;

    let minLabel = typeof scale.min;
    let maxLabel = typeof scale.max;
    if (!unit) {
      minLabel = scale.min.toFixed(fixed);
      maxLabel = scale.max.toFixed(fixed);
    } else if (typeof unit === 'function') {
      minLabel = unit(scale.min);
      maxLabel = unit(scale.max);
    } else {
      minLabel = getSIPrefix(scale.min.toFixed(fixed), binary, { unit }).string;
      maxLabel = getSIPrefix(scale.max.toFixed(fixed), binary, { unit }).string;
    }
    */

    const scale = getScale({ data, unit, binary });

    // const minTextMetrics = ctx.measureText(minLabel);
    // const maxTextMetrics = ctx.measureText(maxLabel);

    // const textWidth = Math.max(minTextMetrics.width, maxTextMetrics.width);
    const textWidth = Math.max(
      ...Object.entries(scale.labels).map(([, label]) =>
        ctx.measureText(label),
      ),
    );
    const textHeight = parseInt(ctx.font);

    console.log('scale', scale);
    // ctx.fillStyle = '#666';
    ctx.fillStyle = textColor;

    const geometry = getGeometry(ctx, { scale, renderer, dataPoints });

    Object.entries(scale.labels).forEach(([val, label]) =>
      ctx.fillText(
        label,
        geometry.scale.left,
        geometry.scale.top + geometry.scale.height * (1 - val) + textHeight / 2,
      ),
    );

    // graphs.forEach(({ renderer, scale, ...options }) => {
    renderer(ctx, data, {
      geometry,
      scale,
      dataPoints,
      color: barColor || textColor,
    });
    // });
  }, [textColor, barColor, canvas, data, width, height]);

  return (
    <canvas
      className="stats-graph"
      ref={canvas}
      // style={{ width: '100%' }}
      width={width}
      height={height}
    />
  );
}
