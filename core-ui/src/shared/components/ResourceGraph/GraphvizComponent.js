import React, { memo } from 'react';
import { Graphviz } from 'graphviz-react';

function GraphvizComponent({ dotSrc, isReady }) {
  return (
    <Graphviz
      dot={dotSrc}
      // https://github.com/magjac/d3-graphviz#selection_graphviz
      options={{
        height: '100%',
        width: '100%',
        zoom: isReady, // if always true, then the graph will jump on first pan or zoom
        useWorker: false,
      }}
    />
  );
}

export const MemoizedGraphviz = memo(GraphvizComponent);
