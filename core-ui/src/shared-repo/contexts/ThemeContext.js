import React, { createContext, useContext, useState, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

export const ThemeContext = createContext({});

function applyThemeToLinkNode(name, publicUrl) {
  const link = document.querySelector('head #_theme');
  if (name === 'light' && link) {
    link.parentNode.removeChild(link);
  }
  if (!link) {
    addLinkNode();
    return applyThemeToLinkNode(name, publicUrl);
  }
  link.href = `${publicUrl || ''}/themes/${name}.css`;
}

function addLinkNode() {
  const newLink = document.createElement('link');
  newLink.id = '_theme';
  newLink.rel = 'stylesheet';
  document.head.appendChild(newLink);
}

const getEditorTheme = theme => {
  switch (theme) {
    case 'dark':
      return 'vs-dark';
    case 'hcb':
      return 'hc-black';
    case 'light_dark':
      return window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'vs-dark'
        : 'vs';
    default:
      return 'vs';
  }
};
export const ThemeProvider = ({ children, env }) => {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    if (typeof env.PUBLIC_URL === 'undefined') return;
    applyThemeToLinkNode(theme, env.PUBLIC_URL);
  }, [theme]);

  useEffect(() => {
    window.parent.postMessage({ msg: 'busola.getCurrentTheme' }, '*'); // send a message to the parent app and expect a response shortly
    const changeTheme = event => {
      if (event.data.msg === 'busola.getCurrentTheme.response')
        setTheme(event.data.name);
    };
    addEventListener('message', changeTheme);
    return _ => removeEventListener('message', changeTheme);
  }, []);

  useEffect(() => {
    const listenerId = LuigiClient.addCustomMessageListener(
      'busola.theme',
      ({ theme }) => setTheme(theme),
    );
    return () => LuigiClient.removeCustomMessageListener(listenerId);
  }, []);

  function handleThemeChange(name) {
    LuigiClient.sendCustomMessage({ id: 'busola.theme', name });
    setTheme(name);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        editorTheme: getEditorTheme(theme),
        setTheme: handleThemeChange,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
