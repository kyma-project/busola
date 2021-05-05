import React from 'react';

export function AuthForm({ auth, setAuth }) {
  return (
    <div>
      <label>
        issuer
        <input
          value="https://apskyxzcl.accounts400.ondemand.com"
          onChange={e => setAuth({ ...auth, issuerUrl: e.target.value })}
        />
      </label>
      <label>
        Clientid
        <input
          value="d0316c58-b0fe-45cd-9960-0fea0708355a"
          onChange={e => setAuth({ ...auth, cliendId: e.target.value })}
        />
      </label>
      <label>
        scopes
        <input
          value="openid"
          onChange={e => setAuth({ ...auth, scope: e.target.value })}
        />
      </label>
    </div>
  );
}
