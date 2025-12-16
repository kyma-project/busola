import { memo, useEffect, useRef, useState } from 'react';
import { instance } from '@viz-js/viz';

function GraphvizComponent({
  dotSrc,
  isReady,
}: {
  dotSrc: string;
  isReady: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viz, setViz] = useState<Awaited<ReturnType<typeof instance>> | null>(
    null,
  );

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
    // Only render if the viz engine is loaded, the container exists,
    // we have source code, AND the parent says we are ready.
    if (!viz || !containerRef.current || !dotSrc || !isReady) return;

    try {
      const svg = viz.renderSVGElement(dotSrc);

      // Set dimensions to auto so the SVG takes up its natural space
      // This allows the container's scrollbars to work if the graph is huge
      svg.style.width = 'auto';
      svg.style.height = 'auto';
      svg.style.maxWidth = '100%'; // Optional: Shrink to fit width if you prefer avoiding horizontal scroll

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(svg);
    } catch (error) {
      console.error('Failed to render graph:', error);
    }
  }, [viz, dotSrc, isReady]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      data-testid="graphviz-container"
    >
      {!isReady && <span>Loading...</span>}
    </div>
  );
}

export const MemoizedGraphviz = memo(GraphvizComponent);
