import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCssVariables } from 'hooks/useCssVariables';
import { GraphLegend } from 'shared/components/GraphLegend/GraphLegend';

function getTextBoundingBox(ctx, text, padding) {
  const labelWidth = ctx.measureText(text).width;
  const labelHeight = parseInt(ctx.font) * 1.2;
  const boxWidth = labelWidth + padding * 2;
  const boxHeight = labelHeight + padding * 2;
  return { boxWidth, boxHeight };
}

const LIMITS_WARNING_VALUE = 1.5; // 150%
const SCALING_THRESHOLD = 1;

export function CommitmentGraph({ data }) {
  const CANVAS_SCALE = 2; // used to make Canvas text crisp

  const { t } = useTranslation();

  const [width, setWidth] = useState(0); // will be calculated
  const canvasRef = useRef();
  const cssVariables = useCssVariables({
    textColor: '--sapTextColor',
    warningColor: '--sapShell_NegativeColor',
    outlineColor: '--sapNeutralBackground',
    tooltipBackgroundColor: '--sapNeutralBackground',
    limitsFill: '--sapContent_Illustrative_Color2',
    requestsFill: '--sapContent_Illustrative_Color3',
    capacityFill: '--sapContent_Illustrative_Color6',
  });
  const [showWarningLabel, setShowWarningLabel] = useState(false);
  const [mouseOverMainGraph, setMouseOverMainGraph] = useState(false);

  const { limits, utilized, requests } = data;

  const height = width / 6;
  const horizontalPadding = width / 25;
  const verticalPadding = width / 30;
  const innerWidth = width - horizontalPadding * 2;
  const innerhHeight = height - verticalPadding * 2;
  const maxValue = Math.min(Math.max(limits, 1.0), LIMITS_WARNING_VALUE);
  const ratio = 1 / maxValue;
  const barHeight = innerhHeight / 2;
  const barHStart = verticalPadding + innerhHeight / 8;
  const warningBarWidth = 20;

  const redraw = () => {
    const drawCapacity = ctx => {
      ctx.fillStyle = cssVariables.capacityFill;
      ctx.fillRect(
        horizontalPadding,
        barHStart - 15,
        innerWidth * ratio,
        barHeight + 30,
      );
    };

    const drawLimits = ctx => {
      ctx.fillStyle = cssVariables.limitsFill;
      ctx.fillRect(
        horizontalPadding,
        barHStart,
        innerWidth * Math.min(limits, LIMITS_WARNING_VALUE) * ratio,
        barHeight,
      );
    };

    const drawRequests = ctx => {
      ctx.fillStyle = cssVariables.requestsFill;
      ctx.fillRect(
        horizontalPadding,
        barHStart,
        innerWidth * Math.min(requests, LIMITS_WARNING_VALUE) * ratio,
        barHeight,
      );
    };

    const drawWarningBar = ctx => {
      if (limits > LIMITS_WARNING_VALUE) {
        ctx.fillStyle = cssVariables.warningColor;
        ctx.fillRect(
          horizontalPadding + LIMITS_WARNING_VALUE * ratio * innerWidth,
          barHStart,
          warningBarWidth,
          barHeight,
        );
      }
    };

    const drawUtilized = ctx => {
      ctx.textAlign = 'left';
      ctx.fillStyle = cssVariables.textColor;
      const x =
        horizontalPadding +
        Math.min(utilized, LIMITS_WARNING_VALUE) * ratio * innerWidth;
      const y = barHStart;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 10, y - 11);
      ctx.lineTo(x + 10, y - 11);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x - 1, y, 2, barHeight);
      ctx.fillText(
        t('graphs.resource-commitment.utilized-value', {
          value: (utilized * 100).toFixed(2),
        }),
        x,
        (verticalPadding * 4) / 5,
      );
    };

    const drawFrames = ctx => {
      ctx.textAlign = 'center';
      ctx.strokeStyle = cssVariables.outlineColor + '88';
      ctx.strokeRect(horizontalPadding, barHStart, innerWidth, 1);
      ctx.strokeRect(
        horizontalPadding,
        barHStart + barHeight - 1,
        innerWidth,
        1,
      );

      for (let i = 0; i <= 100 * maxValue; i += 25) {
        ctx.strokeStyle = cssVariables.outlineColor + '88';
        const x = horizontalPadding + (i / (100 * maxValue)) * innerWidth;
        ctx.strokeRect(x - 1, barHStart, 1, barHeight);

        ctx.fillStyle = cssVariables.textColor;
        ctx.fillText(i + '%', x, verticalPadding + innerhHeight);
      }
    };

    const drawLabelWarning = ctx => {
      if (!showWarningLabel || limits <= LIMITS_WARNING_VALUE) return;

      const x = horizontalPadding + LIMITS_WARNING_VALUE * ratio * innerWidth;
      const y = barHStart;
      const warning = t('graphs.resource-commitment.limits-exceed');
      ctx.fillStyle = cssVariables.tooltipBackgroundColor;
      ctx.strokeStyle = cssVariables.textColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      const labelPadding = 5;
      const { boxHeight, boxWidth } = getTextBoundingBox(
        ctx,
        warning,
        labelPadding,
      );
      ctx.fillRect(x - boxWidth, y - boxHeight, boxWidth, boxHeight);
      ctx.strokeRect(x - boxWidth, y - boxHeight, boxWidth, boxHeight);

      ctx.fillStyle = cssVariables.textColor;
      ctx.fillText(warning, x - labelPadding, y - labelPadding);
    };

    const drawMainGraphLabel = ctx => {
      if (!mouseOverMainGraph) return;

      const label = `Requests: ${(requests * 100).toFixed(2)}%, limits: ${(
        limits * 100
      ).toFixed(2)}%`;
      const x = width / 2;
      const y = height / 2;
      ctx.fillStyle = cssVariables.tooltipBackgroundColor;
      ctx.strokeStyle = cssVariables.textColor;
      ctx.textAlign = 'middle';
      ctx.textBaseline = 'bottom';

      const labelPadding = 5;
      const { boxHeight, boxWidth } = getTextBoundingBox(
        ctx,
        label,
        labelPadding,
      );
      ctx.fillRect(x - boxWidth / 2, y - boxHeight, boxWidth, boxHeight);
      ctx.strokeRect(x - boxWidth / 2, y - boxHeight, boxWidth, boxHeight);

      ctx.fillStyle = cssVariables.textColor;
      ctx.fillText(label, x, y - labelPadding);
    };

    const ctx = canvasRef.current.getContext('2d');
    ctx.font = '24px sans-serif';
    ctx.textBaseline = 'alphabetic'; // default
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    for (const fn of [
      drawCapacity,
      drawLimits,
      drawRequests,
      drawWarningBar,
      drawUtilized,
      drawFrames,
      drawLabelWarning,
      drawMainGraphLabel,
    ]) {
      fn(ctx);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canvasRef,
    cssVariables,
    limits,
    utilized,
    requests,
    width,
    showWarningLabel,
    mouseOverMainGraph,
  ]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const resizeObserver = new ResizeObserver(([e]) => {
      // Scale over treshold to avoid ResizeObserver loops
      if (
        Math.abs(
          e.contentRect.width * CANVAS_SCALE - canvasRef.current?.width,
        ) > SCALING_THRESHOLD
      )
        setWidth(e.contentRect.width * CANVAS_SCALE);
    });

    resizeObserver.observe(canvasRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  const mousemove = e => {
    const isInsideRect = ({ x, y }, { rX, rY, rWidth, rHeight }) => {
      return x >= rX && x <= rX + rWidth && y >= rY && y <= rY + rHeight;
    };

    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) * CANVAS_SCALE;
    const y = (e.clientY - rect.top) * CANVAS_SCALE;

    setShowWarningLabel(
      isInsideRect(
        { x, y },
        {
          rX: horizontalPadding + LIMITS_WARNING_VALUE * ratio * innerWidth,
          rY: barHStart,
          rWidth: warningBarWidth,
          rHeight: barHeight,
        },
      ),
    );
    setMouseOverMainGraph(
      isInsideRect(
        { x, y },
        {
          rX: horizontalPadding,
          rY: barHStart,
          rWidth:
            innerWidth *
            Math.min(Math.max(limits, requests), LIMITS_WARNING_VALUE) *
            ratio,
          rHeight: barHeight,
        },
      ),
    );
  };

  const values = [
    {
      metric: 'requests',
    },
    {
      metric: 'limits',
    },
    {
      metric: 'capacity',
    },
  ];

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={mousemove}
      ></canvas>
      <GraphLegend values={values} isStatsPanel={false} />
    </>
  );
}
