import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Always start with light theme
  const [theme, setTheme] = useState('light');

  // Apply initial theme on mount and force light mode
  useEffect(() => {
    // Force light theme by default
    const savedTheme = 'light';
    localStorage.setItem('theme', savedTheme);
    document.documentElement.classList.remove('dark');
    console.log('Initial theme set to light mode');
  }, []);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    console.log('Applying theme:', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('Dark class added to html element');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Dark class removed from html element');
    }
    console.log('HTML classes:', document.documentElement.className);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('Toggling theme from', prevTheme, 'to', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
