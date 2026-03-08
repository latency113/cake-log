import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface NotFoundContextType {
  isNotFoundActive: boolean;
  setNotFoundActive: (active: boolean) => void;
}

const NotFoundContext = createContext<NotFoundContextType | undefined>(undefined);

export const NotFoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isNotFoundActive, setNotFoundActive] = useState(false);

  return (
    <NotFoundContext.Provider value={{ isNotFoundActive, setNotFoundActive }}>
      {children}
    </NotFoundContext.Provider>
  );
};

export const useNotFound = () => {
  const context = useContext(NotFoundContext);
  if (context === undefined) {
    throw new Error('useNotFound must be used within a NotFoundProvider');
  }
  return context;
};
