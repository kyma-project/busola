import React, { createContext, useContext, useState, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

export const ThemeContext = createContext({});

const getInitialTheme = _ => localStorage.getItem('busola.theme') || 'default';

function applyThemeToLinkNode(name, publicUrl) {
  const link = document.querySelector('head #_theme');
  console.log('applyThemeToLinkNode', link, name);
  if (name === 'default' && link) {
    link.parentNode.removeChild(link);
  }
  if (!link) {
    addLinkNode();
    return applyThemeToLinkNode(name);
  }
  link.href = `${publicUrl || ''}/themes/${name}.css`;
}

function addLinkNode() {
  console.log(addLinkNode);
  const newLink = document.createElement('link');
  newLink.id = '_theme';
  newLink.rel = 'stylesheet';
  document.head.appendChild(newLink);
}

export const ThemeProvider = ({ children, env }) => {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    console.log('ThemeProvider useEffect changing theme to', theme);
    applyThemeToLinkNode(theme, env.PUBLIC_URL);
    localStorage.setItem('busola.theme', theme);
    LuigiClient.sendCustomMessage({ id: 'busola.theme', name: theme });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
