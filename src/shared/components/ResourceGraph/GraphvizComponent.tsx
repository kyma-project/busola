import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { instance } from '@viz-js/viz';
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import { Button, Text } from '@ui5/webcomponents-react';

function ZoomControls({ onFitToView }: { onFitToView: () => void }) {
  const { zoomIn, zoomOut } = useControls();
  return (
    <div className="zoom-controls">
      <Button icon="zoom-in" design="Transparent" onClick={() => zoomIn()} />
      <Button icon="zoom-out" design="Transparent" onClick={() => zoomOut()} />
      <Button icon="reset" design="Transparent" onClick={onFitToView} />
    </div>
  );
}

function GraphvizComponent({
  dotSrc,
  isReady,
}: {
  dotSrc: string;
  isReady: boolean;
}) {
  const { t } = useTranslation();
  const [viz, setViz] = useState<Awaited<ReturnType<typeof instance>> | null>(
    null,
  );
  const [svgContent, setSvgContent] = useState<string | null>(null);

  // Initialize the Viz instance
  useEffect(() => {
    let mounted = true;
    instance().then((v) => {
      if (mounted) setViz(v);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Render the Graph
  useEffect(() => {
    if (!viz || !dotSrc || !isReady) return;

    try {
      const svg = viz.renderSVGElement(dotSrc);
      svg.style.width = 'auto';
      svg.style.height = 'auto';

      const timeoutId = setTimeout(() => {
        setSvgContent(svg.outerHTML);
      }, 0);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to render graph:', error);
    }
  }, [viz, dotSrc, isReady]);

  const [minScale, setMinScale] = useState(0.1);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const calculateFitScale = useCallback(() => {
    const ref = transformRef.current;
    if (!ref) return null;

    const wrapper = ref.instance.wrapperComponent;
    const content = ref.instance.contentComponent;

    if (wrapper && content) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      // Get the original content size (at scale 1)
      const currentScale = ref.state.scale;
      const contentWidth = contentRect.width / currentScale;
      const contentHeight = contentRect.height / currentScale;

      // Calculate the scale at which content fits perfectly in the wrapper
      const scaleX = wrapperRect.width / contentWidth;
      const scaleY = wrapperRect.height / contentHeight;
      return Math.min(scaleX, scaleY);
    }
    return null;
  }, []);

  const fitToView = useCallback(() => {
    const ref = transformRef.current;
    const fitScale = calculateFitScale();
    if (ref && fitScale) {
      ref.centerView(fitScale);
    }
  }, [calculateFitScale]);

  const handleInit = useCallback(
    (ref: ReactZoomPanPinchRef) => {
      transformRef.current = ref;
      // Calculate fit scale and apply it as initial view
      const fitScale = calculateFitScale();
      if (fitScale !== null) {
        setMinScale(fitScale);
        // Use setTimeout to ensure the component is fully rendered
        setTimeout(() => ref.centerView(fitScale), 0);
      }
    },
    [calculateFitScale],
  );

  // Recalculate minScale on container resize
  useEffect(() => {
    const ref = transformRef.current;
    const wrapper = ref?.instance.wrapperComponent;
    if (!wrapper) return;

    let previousWidth = wrapper.getBoundingClientRect().width;
    let previousHeight = wrapper.getBoundingClientRect().height;

    const resizeObserver = new ResizeObserver(() => {
      const newWidth = wrapper.getBoundingClientRect().width;
      const newHeight = wrapper.getBoundingClientRect().height;
      const grewLarger = newWidth > previousWidth || newHeight > previousHeight;

      previousWidth = newWidth;
      previousHeight = newHeight;

      const newFitScale = calculateFitScale();
      if (newFitScale !== null) {
        setMinScale(newFitScale);

        // If container grew and current scale is below new fit scale, snap to fit
        if (grewLarger && ref && ref.state.scale < newFitScale) {
          ref.centerView(newFitScale);
        }
      }
    });

    resizeObserver.observe(wrapper);
    return () => resizeObserver.disconnect();
  }, [svgContent, calculateFitScale]);

  if (svgContent) {
    return (
      <div className="graphviz-container" data-testid="graphviz-container">
        <TransformWrapper
          initialScale={1}
          minScale={minScale}
          maxScale={4}
          centerOnInit
          onInit={handleInit}
        >
          <ZoomControls onFitToView={fitToView} />
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%',
            }}
            contentClass="transform-component-content"
          >
            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
          </TransformComponent>
        </TransformWrapper>
      </div>
    );
  }

  return (
    <div
      className="graphviz-container graphviz-container--loading"
      data-testid="graphviz-container"
    >
      <Text>{t('common.headers.loading')}</Text>
    </div>
  );
}

export const MemoizedGraphviz = memo(GraphvizComponent);
