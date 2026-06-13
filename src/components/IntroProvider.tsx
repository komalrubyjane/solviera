"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface IntroContextType {
  hasSeenIntro: boolean;
  setHasSeenIntro: (val: boolean) => void;
  isLoading: boolean;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenIntro, setHasSeenIntroState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      // Use sessionStorage so intro plays on every new page load / reload
      const seen = sessionStorage.getItem("solviera_intro_seen");
      if (seen === "true") {
        setHasSeenIntroState(true);
      }
    } catch (e) {
      console.error("Failed to read intro flag from sessionStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setHasSeenIntro = (val: boolean) => {
    setHasSeenIntroState(val);
    try {
      if (val) {
        sessionStorage.setItem("solviera_intro_seen", "true");
      } else {
        sessionStorage.removeItem("solviera_intro_seen");
      }
    } catch (e) {
      console.error("Failed to write intro flag to sessionStorage:", e);
    }
  };

  return (
    <IntroContext.Provider value={{ hasSeenIntro, setHasSeenIntro, isLoading }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error("useIntro must be used within an IntroProvider");
  }
  return context;
}
