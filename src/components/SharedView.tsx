import React, { useRef, useEffect } from "react";
import { View, ViewProps, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSharedView } from "../contexts/SharedViewContext";
import { usePathname } from "expo-router";

export interface SharedViewProps extends ViewProps {
  id: string;
  children: React.ReactNode;
  transition?: "move" | "scale";
  duration?: number;
  isSource?: boolean;
  sourceRoute?: string;
}

export function SharedView({
  id,
  children,
  transition = "move",
  duration = 300,
  style,
  isSource = false,
  sourceRoute = "/source",
  ...props
}: SharedViewProps) {
  const { registerElement, getElementData } = useSharedView();
  const pathname = usePathname();
  const elementRef = useRef<View>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleLayout = (event: LayoutChangeEvent) => {
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

  return (
    <Animated.View
      ref={elementRef}
      style={[style, animatedStyle]}
      onLayout={handleLayout}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
