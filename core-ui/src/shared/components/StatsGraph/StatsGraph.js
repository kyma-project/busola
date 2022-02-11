import React, { useState, useEffect, useRef } from 'react';

import './StatsGraph.scss';

const STATS_RATIO = 1 / 3;

function getScaleMax(data) {
  if (!data.length) return { value: 1, precision: 0 };

  let maxData = +data?.reduce((acc, val) => Math.max(acc, val));

  if (!maxData) {
    return { value: 1, precision: 0 };
  }

  let precision = 0;

  while (maxData >= 10) {
    maxData /= 10;
    precision++;
  }
  while (maxData < 1) {
    maxData *= 10;
    precision--;
  }
  maxData = Math.ceil(maxData);
  maxData *= Math.pow(10, precision);
  return {
    value: maxData,
    precision,
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

export function barsRenderer(
  ctx,
  data,
  { width, height, dataPoints, color, scale, hOffset },
) {
  width -= hOffset;
  const sectionWidth = width / dataPoints;

  const barWidth = sectionWidth / 2;

  height -= barWidth;
  const vOffset = barWidth / 2;

  const offset = dataPoints - data.length;

  ctx.fillStyle = color;
  // TODO rounded rect
  data.forEach((value, index) => {
    const left = hOffset + sectionWidth * (offset + index + 0.5);
    const top = vOffset;
    const bottom = top + height;
    const mark = bottom - (value / scale.max) * height;

    // ctx.fillRect(left - barWidth / 2, top, barWidth, height - top);

    ctx.beginPath();
    ctx.ellipse(left, mark, barWidth / 2, barWidth / 2, 0, Math.PI, 0);
    ctx.ellipse(left, bottom, barWidth / 2, barWidth / 2, 0, 0, Math.PI);
    ctx.fill();
  });
}

export function multiBarRenderer(
  ctx,
  data,
  { width, height, dataPoints, color, scale, hOffset },
) {}

export function StatsGraph({ data, dataPoints, graphs, unit, renderer }) {
  // console.log('StatsGraph', data);
  if (!data) data = [];
  // graphs = graphs.map(graph => ({ scale: 'left', min: 0, ...graph }));

  const scaleMax = getScaleMax(data);

  const scale = {
    min: 0,
    max: scaleMax.value,
  };
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

    let fixed = -scaleMax.precision;
    if (fixed < 0) fixed = 0;

    const minLabel = scale.min.toFixed(fixed) + unit;
    const maxLabel = scale.max.toFixed(fixed) + unit;

    const minTextMetrics = ctx.measureText(minLabel);
    const maxTextMetrics = ctx.measureText(maxLabel);

    const textWidth = Math.max(minTextMetrics.width, maxTextMetrics.width);
    const textHeight = parseInt(ctx.font);

    // ctx.fillStyle = '#666';
    ctx.fillStyle = textColor;
    ctx.fillText(minLabel, 0, height);
    ctx.fillText(maxLabel, 0, textHeight);

    // graphs.forEach(({ renderer, scale, ...options }) => {
    renderer(ctx, data, {
      // ...options,
      width,
      height,
      scale,
      // scale: scales[scale],
      hOffset: textWidth + textHeight / 2,
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
