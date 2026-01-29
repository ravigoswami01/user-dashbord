"use client";

import React from "react";
import { useTheme } from "../providers/ThemeProvider";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-transparent"
    >
      <span className="hidden sm:inline">{theme === "light" ? "Light" : "Dark"}</span>
    </button>
  );
};

export default ThemeToggle;
