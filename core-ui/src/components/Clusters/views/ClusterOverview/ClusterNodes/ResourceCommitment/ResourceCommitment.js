import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFeature } from 'shared/hooks/useFeature';
import { LayoutPanel } from 'fundamental-react';
import { Spinner } from 'shared/components/Spinner/Spinner';

import { useMetricsQuery } from './useMetricsQuery';
import { useGetCssVariables } from './useGetCssVariables';
import './ResourceCommitment.scss';
import { GraphLegend } from './GraphLegend';

function CommitmentGraph({ data }) {
  const CANVAS_SCALE = 2;
  const RATIO = 1 / 6;

  const { t } = useTranslation();

  const [width, setWidth] = useState(300);
  const height = width * RATIO;
  const canvasRef = useRef();
  const cssVariables = useGetCssVariables({
    textColor: '--sapTextColor',
    warningColor: '--sapCriticalColor',
    outlineColor: '--sapNeutralBackground',
    capacityFill: '--sapContent_Illustrative_Color6',
    limitsFill: '--sapContent_Illustrative_Color2',
    requestsFill: '--sapContent_Illustrative_Color3',
  });
  const { limits, utilized, requests } = data;

  const redraw = () => {
    const horizontalPadding = width / 25;
    const verticalPadding = width / 60;
    const innerWidth = width - horizontalPadding * 2;
    const innerhHeight = height - verticalPadding * 2;
    const ratio = 1 / 1.5; // 100% / 150%
    const barHeight = innerhHeight / 2;
    const barHStart = verticalPadding + innerhHeight / 8;

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

    const drawWarning = ctx => {
      if (limits > 1.5) {
        ctx.fillStyle = cssVariables.warningColor;
        ctx.fillRect(
          horizontalPadding + 1.5 * ratio * innerWidth,
          barHStart,
          20,
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
      ctx.lineTo(x - 6, y - 7);
      ctx.lineTo(x + 6, y - 7);
      ctx.fill();
      ctx.fillRect(x - 1, y, 2, barHeight);
      ctx.fillRect(x, y, 2, barHeight);
      ctx.fillText(t('graphs.resource-commitment.utilized'), x, y - 20);
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
          verticalPadding + (innerhHeight * 9) / 10,
        );
      }
    };

    const ctx = canvasRef.current.getContext('2d');
    ctx.font = `${12 * CANVAS_SCALE}px sans-serif`;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    drawCapacity(ctx);
    drawLimits(ctx);
    drawRequests(ctx);
    drawWarning(ctx);
    drawUtilized(ctx);
    drawFrames(ctx);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, cssVariables, limits, utilized, requests, width]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const resizeObserver = new ResizeObserver(([e]) => {
      setWidth(e.contentRect.width * CANVAS_SCALE);
    });

    resizeObserver.observe(canvasRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // const mousemove = e => {
  // const rect = e.target.getBoundingClientRect();
  // const x = Math.round(e.clientX - rect.left) * CANVAS_SCALE;
  // const y = Math.round(e.clientY - rect.top) * CANVAS_SCALE;
  // const bar = Math.floor((x - geometry.graph.left) / geometry.sectionWidth);
  // if (y > geometry.graph.height + geometry.graph.top) {
  //   setActiveBar(null);
  // } else if (bar >= 0 && bar <= dataPoints) {
  //   setActiveBar(bar);
  // } else {
  //   setActiveBar(null);
  // }
  // };

  return (
    <div>
      <canvas
        className="resource-commitment-graph-todo"
        ref={canvasRef}
        width={width}
        height={height}
        // onMouseMove={mousemove}
        // onMouseOut={() => setActiveBar(null)}
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
