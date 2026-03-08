import React, { createContext, useContext, useState, useCallback } from 'react';

interface TeamRefetchContextType {
  triggerTeamRefetch: () => void;
  refetchCounter: number;
}

const TeamRefetchContext = createContext<TeamRefetchContextType | undefined>(undefined);

export const useTeamRefetch = () => {
  const context = useContext(TeamRefetchContext);
  if (context === undefined) {
    throw new Error('useTeamRefetch must be used within a TeamRefetchProvider');
  }
  return context;
};

interface TeamRefetchProviderProps {
  children: React.ReactNode;
}

export const TeamRefetchProvider: React.FC<TeamRefetchProviderProps> = ({ children }) => {
  const [refetchCounter, setRefetchCounter] = useState(0);

  const triggerTeamRefetch = useCallback(() => {
    setRefetchCounter(prev => prev + 1);
  }, []);

  return (
    <TeamRefetchContext.Provider value={{ triggerTeamRefetch, refetchCounter }}>
      {children}
    </TeamRefetchContext.Provider>
  );
};
