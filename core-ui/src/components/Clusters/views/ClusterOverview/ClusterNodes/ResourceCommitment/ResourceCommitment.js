import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFeature } from 'shared/hooks/useFeature';
import { LayoutPanel } from 'fundamental-react';
import { Spinner } from 'shared/components/Spinner/Spinner';

import { useMetricsQuery } from './useMetricsQuery';
import { useCssVariables } from 'hooks/useCssVariables';
import { GraphLegend } from './GraphLegend';
import './ResourceCommitment.scss';

function getTextBoundingBox(ctx, text, padding) {
  const labelWidth = ctx.measureText(text).width;
  const labelHeight = parseInt(ctx.font) * 1.2;
  const boxWidth = Math.round(labelWidth + padding * 2);
  const boxHeight = Math.round(labelHeight + padding * 2);
  return { boxWidth, boxHeight };
}

function CommitmentGraph({ data }) {
  const CANVAS_SCALE = 2;
  const RATIO = 1 / 6;

  const { t } = useTranslation();

  const [width, setWidth] = useState(1);
  const canvasRef = useRef();
  const cssVariables = useCssVariables({
    textColor: '--sapTextColor',
    warningColor: '--sapCriticalColor',
    outlineColor: '--sapNeutralBackground',
    tooltipBackgroundColor: '--sapNeutralBackground',
    capacityFill: '--sapContent_Illustrative_Color6',
    limitsFill: '--sapContent_Illustrative_Color2',
    requestsFill: '--sapContent_Illustrative_Color3',
  });
  const [showWarningLabel, setShowWarningLabel] = useState(false);
  const [mouseOverMainGraph, setMouseOverMainGraph] = useState(false);

  const height = width * RATIO;
  const horizontalPadding = width / 25;
  const verticalPadding = width / 30;
  const innerWidth = width - horizontalPadding * 2;
  const innerhHeight = height - verticalPadding * 2;
  const ratio = 1 / 1.5; // 100% / 150%
  const barHeight = innerhHeight / 2;
  const barHStart = verticalPadding + innerhHeight / 8;
  const warningBarWidth = 20;

  const { limits, utilized, requests } = data;

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
        innerWidth * Math.min(limits, 1.5) * ratio,
        barHeight,
      );
    };

    const drawRequests = ctx => {
      ctx.fillStyle = cssVariables.requestsFill;
      ctx.fillRect(
        horizontalPadding,
        barHStart,
        innerWidth * Math.min(requests, 1.5) * ratio,
        barHeight,
      );
    };

    const drawWarningBar = ctx => {
      if (limits > 1.5) {
        ctx.fillStyle = cssVariables.warningColor;
        ctx.fillRect(
          horizontalPadding + 1.5 * ratio * innerWidth,
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
        horizontalPadding + Math.min(utilized, 1.5) * ratio * innerWidth;
      const y = barHStart;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 10, y - 11);
      ctx.lineTo(x + 10, y - 11);
      ctx.fill();
      ctx.fillRect(x - 1, y, 2, barHeight);
      ctx.fillRect(x, y, 2, barHeight);
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

      for (let i = 0; i <= 150; i += 25) {
        ctx.strokeStyle = cssVariables.outlineColor + '88';
        ctx.strokeRect(
          horizontalPadding + (i / 150) * innerWidth - 1,
          barHStart,
          1,
          barHeight,
        );

        ctx.fillStyle = cssVariables.textColor;
        ctx.fillText(
          i + '%',
          horizontalPadding + (i / 150) * innerWidth,
          verticalPadding + innerhHeight,
        );
      }
    };

    const drawLabelWarning = ctx => {
      if (!showWarningLabel) return;

      const x = horizontalPadding + 1.5 * ratio * innerWidth;
      const y = barHStart;
      const warning = t('graphs.resource-commitment.exceeds');
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
    ctx.font = `${12 * CANVAS_SCALE}px sans-serif`;
    ctx.textBaseline = 'alphabetic';
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
      setWidth(e.contentRect.width * CANVAS_SCALE);
    });

    resizeObserver.observe(canvasRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  const mousemove = e => {
    const isInsideRect = ({ x, y }, { rX, rY, rWidth, rHeight }) => {
      return x >= rX && x <= rX + rWidth && y >= rY && y < +rY + rHeight;
    };

    const rect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left) * CANVAS_SCALE;
    const y = Math.round(e.clientY - rect.top) * CANVAS_SCALE;

    setShowWarningLabel(
      isInsideRect(
        { x, y },
        {
          rX: horizontalPadding + 1.5 * ratio * innerWidth,
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
            innerWidth * Math.min(Math.max(limits, requests), 1.5) * ratio,
          rHeight: barHeight,
        },
      ),
    );
  };

  return (
    <div>
      <canvas
        className="resource-commitment-graph-todo"
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={mousemove}
      ></canvas>
      <GraphLegend />
    </div>
  );
}

function ResourceCommitmentComponent({ serviceUrl }) {
  const { t } = useTranslation();
  const [time, setTime] = useState(Math.floor(Date.now() / 1000));
  const {
    QueryDropdown,
    queryResults: { data, loading, error },
    queryType,
  } = useMetricsQuery({
    serviceUrl,
    time,
  });

  useEffect(() => {
    const REFETCH_RATE_MS = 60 * 1000;
    const id = setInterval(
      () => setTime(Math.floor(Date.now() / 1000)),
      REFETCH_RATE_MS,
    );
    return () => clearInterval(id);
  }, [queryType]);

  const content = () => {
    if (loading) {
      return <Spinner />;
    } else if (error) {
      return <p>{t('common.messages.error', { error: error.message })}</p>;
    } else {
      return <CommitmentGraph data={data} />;
    }
  };

  return (
    <LayoutPanel className="commitment-graph">
      <LayoutPanel.Header>
        <LayoutPanel.Filters>{QueryDropdown}</LayoutPanel.Filters>
      </LayoutPanel.Header>
      <LayoutPanel.Body className="graph-wrapper">{content()}</LayoutPanel.Body>
    </LayoutPanel>
  );
}

export function ResourceCommitment() {
  const { isEnabled, serviceUrl } = useFeature('PROMETHEUS');
  if (!isEnabled) return null;
  return <ResourceCommitmentComponent serviceUrl={serviceUrl} />;
}
