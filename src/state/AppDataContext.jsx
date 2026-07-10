import { createContext, useContext } from "react";
import { useEntityCollection } from "../hooks/useEntityCollection";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const characters = useEntityCollection("characters");
  const chats = useEntityCollection("chats");
  const userPersonas = useEntityCollection("userPersonas");

  const value = {
    characters,
    chats,
    userPersonas,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return context;
}
