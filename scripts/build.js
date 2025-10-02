const fs = require('fs');
const path = require('path');

// Clean lib directory
const libDir = path.join(__dirname, '..', 'lib');
if (fs.existsSync(libDir)) {
  fs.rmSync(libDir, { recursive: true, force: true });
}
fs.mkdirSync(libDir, { recursive: true });

// Create JavaScript files manually
const sharedViewJs = `import React, { useRef, useEffect } from "react";
import { View, ViewProps, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSharedView } from "../contexts/SharedViewContext";
import { usePathname } from "expo-router";

export function SharedView({
  id,
  children,
  transition = "move",
  duration = 300,
  style,
  isSource = false,
  sourceRoute = "/source",
  ...props
}) {
  const { registerElement, getElementData } = useSharedView();
  const pathname = usePathname();
  const elementRef = useRef(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleLayout = (event) => {
    if (!isSource || pathname !== sourceRoute) {
      return;
    }

    const { x, y, width, height } = event.nativeEvent.layout;

    elementRef.current?.measureInWindow((pageX, pageY) => {
      registerElement({
        id,
        sourceLayout: { x: pageX, y: pageY, width, height },
        sourceRoute: sourceRoute,
        isSource: isSource,
      });
    });
  };

  useEffect(() => {
    const sourceData = getElementData(id);

    if (sourceData && sourceData.sourceRoute !== pathname) {
      elementRef.current?.measureInWindow((pageX, pageY, width, height) => {
        const deltaX = sourceData.sourceLayout.x - pageX;
        const deltaY = sourceData.sourceLayout.y - pageY;
        const scaleX = sourceData.sourceLayout.width / width;
        const scaleY = sourceData.sourceLayout.height / height;

        if (transition === "move") {
          translateX.value = deltaX;
          translateY.value = deltaY;
          scale.value = Math.min(scaleX, scaleY);
        } else if (transition === "scale") {
          translateX.value = 0;
          translateY.value = 0;
          scale.value = Math.min(scaleX, scaleY);
        }

        if (transition === "move") {
          translateX.value = withTiming(0, {
            duration,
            easing: Easing.out(Easing.cubic),
          });
          translateY.value = withTiming(0, {
            duration,
            easing: Easing.out(Easing.cubic),
          });
        }

        scale.value = withTiming(1, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
      });
    }
  }, [pathname, id, transition, duration, getElementData]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return React.createElement(Animated.View, {
    ref: elementRef,
    style: [style, animatedStyle],
    onLayout: handleLayout,
    ...props,
    children: children,
  });
}`;

const sharedViewContextJs = `import React, { createContext, useContext, useState, useCallback } from "react";

const SharedViewContext = createContext(undefined);

export function SharedViewProvider({ children }) {
  const [elements, setElements] = useState(new Map());
  const [activeTransitionId, setActiveTransitionId] = useState(null);

  const registerElement = useCallback((data) => {
    setElements((prev) => {
      const newMap = new Map(prev);
      if (data.isSource) {
        newMap.set(data.id, data);
      }
      return newMap;
    });
  }, []);

  const getElementData = useCallback((id) => {
    const isActive = id === activeTransitionId;
    if (isActive) {
      const data = elements.get(id);
      return data;
    }
    return undefined;
  }, [elements, activeTransitionId]);

  const clearElement = useCallback((id) => {
    setElements((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const setActiveTransition = useCallback((id) => {
    setActiveTransitionId(id);
  }, [activeTransitionId]);

  const isActiveTransition = useCallback((id) => {
    return id === activeTransitionId;
  }, [activeTransitionId]);

  return React.createElement(SharedViewContext.Provider, {
    value: {
      registerElement,
      getElementData,
      clearElement,
      setActiveTransition,
      isActiveTransition,
    },
    children: children,
  });
}

export const useSharedView = () => {
  const context = useContext(SharedViewContext);
  if (!context) {
    throw new Error("useSharedView must be used within SharedViewProvider");
  }
  return context;
};`;

// Create directories
fs.mkdirSync(path.join(libDir, 'components'), { recursive: true });
fs.mkdirSync(path.join(libDir, 'contexts'), { recursive: true });

// Write JavaScript files
fs.writeFileSync(path.join(libDir, 'components', 'SharedView.js'), sharedViewJs);
fs.writeFileSync(path.join(libDir, 'contexts', 'SharedViewContext.js'), sharedViewContextJs);

// Create the main index.js file
const indexJsContent = `export { SharedView } from "./components/SharedView";
export {
  SharedViewProvider,
  useSharedView,
} from "./contexts/SharedViewContext";`;

fs.writeFileSync(path.join(libDir, 'index.js'), indexJsContent);

// Create TypeScript declaration files
const sharedViewDts = `import React from "react";
import { ViewProps, LayoutChangeEvent } from "react-native";

export interface SharedViewProps extends ViewProps {
  id: string;
  children: React.ReactNode;
  transition?: "move" | "scale";
  duration?: number;
  isSource?: boolean;
  sourceRoute?: string;
}

export function SharedView(props: SharedViewProps): JSX.Element;`;

const sharedViewContextDts = `import React from "react";

export interface SharedViewData {
  id: string;
  sourceLayout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  sourceRoute: string;
  isSource: boolean;
}

export interface SharedViewContextType {
  registerElement: (data: SharedViewData) => void;
  getElementData: (id: string) => SharedViewData | undefined;
  clearElement: (id: string) => void;
  setActiveTransition: (id: string | null) => void;
  isActiveTransition: (id: string) => boolean;
}

export function SharedViewProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element;
export function useSharedView(): SharedViewContextType;`;

const indexDts = `export { SharedView } from "./components/SharedView";
export {
  SharedViewProvider,
  useSharedView,
} from "./contexts/SharedViewContext";
export type { SharedViewProps } from "./components/SharedView";`;

// Write TypeScript declaration files
fs.writeFileSync(path.join(libDir, 'components', 'SharedView.d.ts'), sharedViewDts);
fs.writeFileSync(path.join(libDir, 'contexts', 'SharedViewContext.d.ts'), sharedViewContextDts);
fs.writeFileSync(path.join(libDir, 'index.d.ts'), indexDts);

console.log('Build completed successfully!');
