import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { LayoutRectangle } from "react-native";

interface SharedViewData {
  id: string;
  sourceLayout: LayoutRectangle;
  sourceRoute: string;
  isSource: boolean;
}

interface SharedViewContextType {
  registerElement: (data: SharedViewData) => void;
  getElementData: (id: string) => SharedViewData | undefined;
  clearElement: (id: string) => void;
  setActiveTransition: (id: string | null) => void;
  isActiveTransition: (id: string) => boolean;
}

const SharedViewContext = createContext<SharedViewContextType | undefined>(
  undefined
);

export function SharedViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [elements, setElements] = useState<Map<string, SharedViewData>>(
    new Map()
  );
  const [activeTransitionId, setActiveTransitionId] = useState<string | null>(
    null
  );

  const registerElement = useCallback((data: SharedViewData) => {
    setElements((prev) => {
      const newMap = new Map(prev);
      if (data.isSource) {
        newMap.set(data.id, data);
      }
      return newMap;
    });
  }, []);

  const getElementData = useCallback(
    (id: string) => {
      const isActive = id === activeTransitionId;

      if (isActive) {
        const data = elements.get(id);
        return data;
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

  const setActiveTransition = useCallback(
    (id: string | null) => {
      setActiveTransitionId(id);
    },
    [activeTransitionId]
  );

  const isActiveTransition = useCallback(
    (id: string) => {
      return id === activeTransitionId;
    },
    [activeTransitionId]
  );

  return (
    <SharedViewContext.Provider
      value={{
        registerElement,
        getElementData,
        clearElement,
        setActiveTransition,
        isActiveTransition,
      }}
    >
      {children}
    </SharedViewContext.Provider>
  );
}

export const useSharedView = () => {
  const context = useContext(SharedViewContext);
  if (!context) {
    throw new Error("useSharedView must be used within SharedViewProvider");
  }
  return context;
};
