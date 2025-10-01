import React, { useRef, useEffect } from "react";
import { View, ViewProps, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSharedElement } from "../contexts/SharedElementContext";

export interface SharedElementProps extends ViewProps {
  id: string;
  children: React.ReactNode;
  transition?: "move" | "scale";
  duration?: number;
  sourceRoute?: string;
}

export function SharedElement({
  id,
  children,
  transition = "move",
  duration = 300,
  sourceRoute,
  style,
  ...props
}: SharedElementProps) {
  const { registerElement, getElementData } = useSharedElement();
  const elementRef = useRef<View>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;

    // Measure global position
    elementRef.current?.measureInWindow((pageX, pageY) => {
      registerElement({
        id,
        sourceLayout: { x: pageX, y: pageY, width, height },
        sourceRoute: sourceRoute || "unknown",
      });
    });
  };

  useEffect(() => {
    const sourceData = getElementData(id);

    if (sourceData && sourceData.sourceRoute !== sourceRoute) {
      // This is the destination element
      elementRef.current?.measureInWindow((pageX, pageY, width, height) => {
        const deltaX = sourceData.sourceLayout.x - pageX;
        const deltaY = sourceData.sourceLayout.y - pageY;
        const scaleX = sourceData.sourceLayout.width / width;
        const scaleY = sourceData.sourceLayout.height / height;

        // Set initial values
        translateX.value = deltaX;
        translateY.value = deltaY;

        if (transition === "scale" || transition === "move") {
          scale.value = Math.min(scaleX, scaleY);
        }

        // Animate to final position
        translateX.value = withTiming(0, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(0, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(1, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
      });
    }
  }, [sourceRoute]);

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
