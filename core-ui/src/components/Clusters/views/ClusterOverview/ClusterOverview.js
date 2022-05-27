import React from 'react';
import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';
import './ClusterOverview.scss';

export function ClusterOverview() {
  const goWasm = new window.Go();

  WebAssembly.instantiateStreaming(
    fetch('main.wasm'),
    goWasm.importObject,
  ).then(result => goWasm.run(result.instance));

  return (
    <>
      <ClusterOverviewHeader />
      <ClusterNodes />
    </>
  );
}
