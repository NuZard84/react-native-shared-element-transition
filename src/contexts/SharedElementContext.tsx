import React, { createContext, useContext, useState, useCallback } from "react";
import { LayoutRectangle } from "react-native";

interface SharedElementData {
  id: string;
  sourceLayout: LayoutRectangle;
  sourceRoute: string;
}

interface SharedElementContextType {
  registerElement: (data: SharedElementData) => void;
  getElementData: (id: string) => SharedElementData | undefined;
  clearElement: (id: string) => void;
  setActiveTransition: (id: string | null) => void;
  isActiveTransition: (id: string) => boolean;
}

const SharedElementContext = createContext<
  SharedElementContextType | undefined
>(undefined);

export function SharedElementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [elements, setElements] = useState<Map<string, SharedElementData>>(
    new Map()
  );
  const [activeTransitionId, setActiveTransitionId] = useState<string | null>(
    null
  );

  const registerElement = useCallback((data: SharedElementData) => {
    setElements((prev) => new Map(prev).set(data.id, data));
  }, []);

  const getElementData = useCallback(
    (id: string) => {
      // Only return data if this is the active transition
      if (id === activeTransitionId) {
        return elements.get(id);
      }
      return undefined;
    },
    [elements, activeTransitionId]
  );

  const clearElement = useCallback((id: string) => {
    setElements((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const setActiveTransition = useCallback((id: string | null) => {
    setActiveTransitionId(id);
  }, []);

  const isActiveTransition = useCallback(
    (id: string) => {
      return id === activeTransitionId;
    },
    [activeTransitionId]
  );

  return (
    <SharedElementContext.Provider
      value={{
        registerElement,
        getElementData,
        clearElement,
        setActiveTransition,
        isActiveTransition,
      }}
    >
      {children}
    </SharedElementContext.Provider>
  );
}

export const useSharedElement = () => {
  const context = useContext(SharedElementContext);
  if (!context) {
    throw new Error(
      "useSharedElement must be used within SharedElementProvider"
    );
  }
  return context;
};
