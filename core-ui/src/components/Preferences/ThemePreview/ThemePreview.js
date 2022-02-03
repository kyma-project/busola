import React from 'react';
import './ThemePreview.scss';

export function ThemePreview({ theme }) {
  if (theme === 'light_dark') {
    return (
      <div className="double-theme">
        <ThemePreview theme="dark" />
        <ThemePreview theme="light" />
      </div>
    );
  }
  console.log(theme);
  // those are copied from https://sap.live.dxp.k8s.ondemand.com/projects
  return (
    <div className="theme-wrapper">
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={`theme-preview sap_fiori_3 theme--${theme}`}
      >
        <rect className="cls-1" height="112" width="200" y="88"></rect>
        <path className="cls-2" d="M200,105v95H59V110a5,5,0,0,1,5-5Z"></path>
        <path
          className="cls-3"
          d="M64,106H200v94H60V110A4,4,0,0,1,64,106Z"
        ></path>
        <rect className="cls-3" height="44" width="200" y="44"></rect>
        <rect className="cls-4" height="1" width="200" y="87"></rect>
        <path
          className="cls-5"
          d="M64,63h46a5,5,0,0,1,5,5h0a5,5,0,0,1-5,5H64a5,5,0,0,1-5-5h0A5,5,0,0,1,64,63Z"
        ></path>
        <path
          className="cls-6"
          d="M153,63h47V73H153a5,5,0,0,1-5-5h0A5,5,0,0,1,153,63Z"
        ></path>
        <path
          className="cls-5"
          d="M62,85h50a3,3,0,0,1,3,3H59A3,3,0,0,1,62,85Z"
        ></path>
        <rect className="cls-7" height="44" width="200"></rect>
        <path
          className="cls-8"
          d="M68.459,13a1,1,0,0,1,.714,1.707l-16.155,16A1.01,1.01,0,0,1,52.3,31H33.539a1,1,0,0,1-1.01-.99V14a1,1,0,0,1,1-1h34.93m0-3H33.539A4.024,4.024,0,0,0,29.5,14V30a4.024,4.024,0,0,0,4.039,4H52.3a4.033,4.033,0,0,0,2.857-1.172l16.154-16a3.961,3.961,0,0,0,.876-4.359A4.027,4.027,0,0,0,68.459,10Z"
        ></path>
        <rect
          className="cls-9"
          height="10.101"
          rx="5"
          width="75.758"
          x="82.121"
          y="16.949"
        ></rect>
        <path
          className="cls-9"
          d="M170,18h30v8H170a4,4,0,0,1-4-4h0A4,4,0,0,1,170,18Z"
        ></path>
      </svg>
    </div>
  );
}
