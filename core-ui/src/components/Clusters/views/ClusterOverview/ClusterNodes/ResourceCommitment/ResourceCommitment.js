import React, { useEffect, useRef, useState } from 'react';
import { useFeature } from 'shared/hooks/useFeature';
import { LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import './ResourceCommitment.scss';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useMetricQuery } from './useMetricQuery';
import { useGetCssVariables } from './useGetCssVariables';

function CommitmentGraph({ data }) {
  const canvasRef = useRef();
  const { t } = useTranslation();
  const cssVariables = useGetCssVariables({
    textColor: '--sapTextColor',
    warningColor: '--sapCriticalColor',
    outlineColor: '--sapNeutralBackground',
    capacityFill: '--sapContent_Illustrative_Color6',
    limitsFill: '--sapContent_Illustrative_Color2',
    requestsFill: '--sapContent_Illustrative_Color3',
  });
  const capacity = {
    name: 'capacity',
    value: 1,
  };
  const limits = data.find(d => d.name === 'limits');
  const utilized = data.find(d => d.name === 'utilized');
  const requests = data.find(d => d.name === 'requests');

  const redraw = () => {
    const paddingW = 20;
    const paddingH = 5;
    const w = 600;
    const h = 150;
    const paddedW = w - paddingW * 2;
    const paddedH = h - paddingH * 2;
    const m100 = 1 / 1.5; // 100% / 150%

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.textAlign = 'center';
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const barHeight = paddedH / 2;
      const barHStart = paddingH + paddedH / 8;

      ctx.fillStyle = cssVariables.capacityFill;
      ctx.fillRect(paddingW, barHStart - 15, paddedW * m100, barHeight + 30);

      ctx.fillStyle = cssVariables.limitsFill;
      ctx.fillRect(
        paddingW,
        barHStart,
        paddedW * Math.min(limits.value, 1.5) * m100,
        barHeight,
      );

      ctx.fillStyle = cssVariables.requestsFill;
      ctx.fillRect(
        paddingW,
        barHStart,
        paddedW * Math.min(requests.value, 1.5) * m100,
        barHeight,
      );

      if (limits.value > 1.5) {
        ctx.fillStyle = cssVariables.warningColor;
        ctx.fillRect(paddingW + 1.5 * m100 * paddedW, barHStart, 20, barHeight);
      }

      ctx.fillStyle = 'black';
      const x = paddingW + Math.min(utilized.value, 1.5) * m100 * paddedW;
      const y = barHStart;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 4, y - 5);
      ctx.lineTo(x + 4, y - 5);
      ctx.fill();
      ctx.fillRect(x - 1, y, 2, barHeight);
      ctx.fillRect(x, y, 2, barHeight);
      ctx.fillText('Utilized', x, y - 10);

      ctx.strokeStyle = cssVariables.outlineColor + '88';
      ctx.strokeRect(paddingW, barHStart, paddedW, 1);
      ctx.strokeRect(paddingW, barHStart + barHeight - 1, paddedW, 1);

      for (let i = 0; i <= 150; i += 25) {
        ctx.strokeStyle = cssVariables.outlineColor + '88';
        ctx.strokeRect(
          paddingW + (i / 150) * paddedW - 1,
          barHStart,
          1,
          barHeight,
        );

        ctx.fillStyle = cssVariables.textColor;
        ctx.fillText(
          i + '%',
          paddingW + (i / 150) * paddedW,
          paddingH + (paddedH * 9) / 10,
        );
      }
    }
  };

  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, cssVariables]);

  return (
    <div>
      <canvas ref={canvasRef} width="600" height="150"></canvas>
      <legend className="graph-legend">
        {['limits', 'requests', 'capacity'].map(e => (
          <div key={e}>
            <div className={`legend-box graph-box--${e}`}></div>
            <span>{t(`graphs.resource-commitment.${e}`)}</span>
          </div>
        ))}
      </legend>
    </div>
  );
}

function ResourceCommitmentComponent({ serviceUrl }) {
  const { t } = useTranslation();
  const [time, setTime] = useState(Math.floor(Date.now() / 1000));
  const { QueryDropdown, queryResults, queryType } = useMetricQuery({
    serviceUrl,
    time,
  });

  const { data, loading, error } = queryResults;

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
