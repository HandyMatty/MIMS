import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  default: {
    name: 'Default',
    sider: '#0C9B4B',
    header: '#072C1C',
    background: '#EAF4E2',
    text: '#072C1C',
    textLight: '#d4e09b',
    menuItem: '#072C1C',
  },
  blue: {
    name: 'Ocean Blue',
    sider: '#3e63de',
    header: '#1e3a8a',
    background: '#93c5fd',
    text: '#000080',
    textLight: '#93c5fd',
    menuItem: '#000080',
    componentBackground: '#c4cff5',
    CardHead: '#3e8bde',
  },
  purple: {
    name: 'Royal Purple',
    sider: '#7c3aed',
    header: '#5b21b6',
    background: '#c4b5fd',
    text: '#000000',
    textLight: '#c4b5fd',
    menuItem: '#000000',
    componentBackground: '#ede9fe',
    CardHead: '#b894f5',
  },
  orange: {
    name: 'Sunset Orange',
    sider: '#f57b3c',
    header: '#c2410c',
    background: '#fed7aa',
    text: '#b24309',
    textLight: '#fed7aa',
    menuItem: '#b24309',
    componentBackground: '#fff7ed',
    CardHead: '#f79461',
  },
  gray: {
    name: 'Modern Gray',
    sider: '#a0acc0',
    header: '#1f2937',
    background: '#d1d5db',
    text: '#1f2937',
    textLight: '#d1d5db',
    menuItem: '#1f2937',
    componentBackground: '#f3f4f6',
    CardHead: '#94a2b8',
  },
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'default';
  });

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('selectedTheme', themeName);
    }
  };

  const theme = themes[currentTheme];

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-sider', theme.sider);
    document.documentElement.style.setProperty('--theme-header', theme.header);
    document.documentElement.style.setProperty('--theme-background', theme.background);
    document.documentElement.style.setProperty('--theme-text', theme.text);
    document.documentElement.style.setProperty('--theme-text-light', theme.textLight);
    document.documentElement.style.setProperty('--theme-menu-item', theme.menuItem);
    if (currentTheme !== 'default') {
      document.body.classList.add('themed');
      document.documentElement.style.setProperty('--theme-sider-custom', theme.sider);
      document.documentElement.style.setProperty('--theme-header-custom', theme.header);
      document.documentElement.style.setProperty('--theme-background-custom', theme.background);
      document.documentElement.style.setProperty('--theme-text-custom', theme.text);
      document.documentElement.style.setProperty('--theme-text-light-custom', theme.textLight);
      document.documentElement.style.setProperty('--theme-menu-item-custom', theme.menuItem);
      document.documentElement.style.setProperty('--theme-table-bg', theme.background);
      document.documentElement.style.setProperty('--theme-table-hover-bg', theme.textLight);
      document.documentElement.style.setProperty('--theme-table-head-bg', theme.CardHead);
      document.documentElement.style.setProperty('--theme-table-container-bg', theme.componentBackground);
      document.documentElement.style.setProperty('--theme-table-border', theme.header);
      document.documentElement.style.setProperty('--theme-component-bg', theme.componentBackground);
      document.documentElement.style.setProperty('--theme-card-head-bg', theme.CardHead);
      document.documentElement.style.setProperty('--theme-card-head-border', theme.textLight);
      document.documentElement.style.setProperty('--theme-pagination-bg', theme.CardHead);
      document.documentElement.style.setProperty('--theme-pagination-active-bg', theme.textLight);
      document.documentElement.style.setProperty('--theme-pagination-text', theme.text);
      document.documentElement.style.setProperty('--theme-pagination-border', theme.text);
      document.documentElement.style.setProperty('--theme-spin-color', theme.text);
      document.documentElement.style.setProperty('--theme-spin-text', theme.text);
      document.documentElement.style.setProperty('--theme-spin-bg', theme.background);
      document.documentElement.style.setProperty('--theme-border', theme.text);
      document.documentElement.style.setProperty('--theme-hover-bg', theme.textLight);
      document.documentElement.style.setProperty('--theme-modal-bg', theme.componentBackground);
      document.documentElement.style.setProperty('--theme-modal-header-bg', theme.CardHead);
      document.documentElement.style.setProperty('--theme-modal-footer-bg', theme.componentBackground);
      document.documentElement.style.setProperty('--theme-modal-title', theme.text);
      document.documentElement.style.setProperty('--theme-modal-text', theme.text);
      document.documentElement.style.setProperty('--theme-modal-border', theme.text);
      document.documentElement.style.setProperty('--theme-modal-close', theme.text);
      document.documentElement.style.setProperty('--theme-modal-close-hover', theme.textLight);
      // In ThemeProvider's useEffect, add:
document.documentElement.style.setProperty('--theme-modal-btn-bg', theme.CardHead);
document.documentElement.style.setProperty('--theme-modal-btn-text', theme.text);
// For Cancel button (optional, or use a lighter color)
document.documentElement.style.setProperty('--theme-modal-btn-cancel-bg', theme.componentBackground || theme.background);
document.documentElement.style.setProperty('--theme-modal-btn-cancel-text', theme.text);
    } else {
      document.body.classList.remove('themed');
      document.documentElement.style.removeProperty('--theme-sider-custom');
      document.documentElement.style.removeProperty('--theme-header-custom');
      document.documentElement.style.removeProperty('--theme-background-custom');
      document.documentElement.style.removeProperty('--theme-text-custom');
      document.documentElement.style.removeProperty('--theme-text-light-custom');
      document.documentElement.style.removeProperty('--theme-menu-item-custom');
      document.documentElement.style.removeProperty('--theme-table-bg');
      document.documentElement.style.removeProperty('--theme-table-hover-bg');
      document.documentElement.style.removeProperty('--theme-table-head-bg');
      document.documentElement.style.removeProperty('--theme-table-container-bg');
      document.documentElement.style.removeProperty('--theme-table-border');
      document.documentElement.style.removeProperty('--theme-component-bg');
      document.documentElement.style.removeProperty('--theme-card-head-bg');
      document.documentElement.style.removeProperty('--theme-card-head-border');
      document.documentElement.style.removeProperty('--theme-pagination-bg');
      document.documentElement.style.removeProperty('--theme-pagination-active-bg');
      document.documentElement.style.removeProperty('--theme-pagination-text');
      document.documentElement.style.removeProperty('--theme-pagination-border');
      document.documentElement.style.removeProperty('--theme-spin-color');
      document.documentElement.style.removeProperty('--theme-spin-text');
      document.documentElement.style.removeProperty('--theme-spin-bg');
      document.documentElement.style.removeProperty('--theme-border');
      document.documentElement.style.removeProperty('--theme-hover-bg');
      document.documentElement.style.removeProperty('--theme-modal-bg');
      document.documentElement.style.removeProperty('--theme-modal-header-bg');
      document.documentElement.style.removeProperty('--theme-modal-footer-bg');
      document.documentElement.style.removeProperty('--theme-modal-title');
      document.documentElement.style.removeProperty('--theme-modal-text');
      document.documentElement.style.removeProperty('--theme-modal-border');
      document.documentElement.style.removeProperty('--theme-modal-close');
      document.documentElement.style.removeProperty('--theme-modal-close-hover');
    }
  }, [theme, currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};