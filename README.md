# React Native Shared View Transition

A React Native library for smooth shared element transitions between screens using React Native Reanimated. Perfect for creating seamless navigation experiences with shared elements that animate between screens.

> **Why this library?** I tried to find a working shared element transition library for file-based Expo Router but couldn't find one that worked properly, so I created this one specifically for Expo Router with file-based routing.

## Features

- 🎯 **Smooth Animations**: Create beautiful shared element transitions between screens
- 📱 **Cross-Platform**: Works on both iOS and Android
- ⚡ **Performance**: Built with React Native Reanimated for 60fps animations
- 🎨 **Flexible**: Support for move and scale transitions
- 🔧 **TypeScript**: Full TypeScript support
- 📦 **Lightweight**: Minimal dependencies
- 🚀 **Expo Router Compatible**: Works seamlessly with Expo Router navigation
- 🎭 **Context-Based**: Uses React Context for state management

## Installation

```bash
npm install react-native-shared-element-transition
# or
yarn add react-native-shared-element-transition
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react-native-reanimated
# or
yarn add react-native-reanimated
```

## Setup

### 1. Wrap your app with SharedViewProvider

```tsx
import React from "react";
import { SharedViewProvider } from "react-native-shared-element-transition";

export default function App() {
  return <SharedViewProvider>{/* Your app content */}</SharedViewProvider>;
}
```

### 2. Configure Route Animations (Expo Router)

For Expo Router, you need to disable default route animations **only in the local stack** where shared element transitions are used. Parent stacks can keep their animations:

```tsx
// app/_layout.tsx - Parent stack can keep animations
import { Stack } from "expo-router";
import { SharedViewProvider } from "react-native-shared-element-transition";

export default function RootLayout() {
  return (
    <SharedViewProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          // ✅ Parent stack can have animations
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SharedViewProvider>
  );
}
```

```tsx
// app/(tabs)/batches/_layout.tsx - Local stack with shared elements
import { Stack } from "expo-router";

export default function BatchesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none", // ⚠️ IMPORTANT: Disable only in this local stack
        animationDuration: 0,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Batches" }} />
      <Stack.Screen
        name="[batchId]"
        options={{
          title: "Batch Details",
          presentation: "card",
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
```

### 3. Use SharedView in your components

#### Source Screen (List/Grid)

```tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  SharedView,
  useSharedView,
} from "react-native-shared-element-transition";
import { useRouter, usePathname } from "expo-router";

export function SourceScreen() {
  const { setActiveTransition } = useSharedView();
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = () => {
    // 1. Clear any active transition
    setActiveTransition(null);

    // 2. Set the active transition after a small delay
    setTimeout(() => {
      setActiveTransition("shared-card");
      router.push("/destination");
    }, 0);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <SharedView
        id="shared-card"
        isSource={true} // ⚠️ IMPORTANT: Set to true for source
        sourceRoute={pathname}
        transition="move"
        duration={400}
      >
        <View style={{ width: 100, height: 100, backgroundColor: "blue" }}>
          <Text>Shared Element</Text>
        </View>
      </SharedView>
    </TouchableOpacity>
  );
}
```

#### Destination Screen (Detail)

```tsx
import React from "react";
import { View, Text } from "react-native";
import { SharedView } from "react-native-shared-element-transition";

export function DestinationScreen() {
  return (
    <View>
      <SharedView
        id="shared-card"
        isSource={false} // ⚠️ IMPORTANT: Set to false for destination
        transition="move"
        duration={400}
      >
        <View style={{ width: 200, height: 200, backgroundColor: "blue" }}>
          <Text>Shared Element</Text>
        </View>
      </SharedView>
    </View>
  );
}
```

## API Reference

### SharedView

The main component for creating shared element transitions.

#### Props

| Prop          | Type                | Default  | Description                              |
| ------------- | ------------------- | -------- | ---------------------------------------- |
| `id`          | `string`            | -        | Unique identifier for the shared element |
| `children`    | `React.ReactNode`   | -        | The element to animate                   |
| `transition`  | `"move" \| "scale"` | `"move"` | Type of transition animation             |
| `duration`    | `number`            | `300`    | Animation duration in milliseconds       |
| `isSource`    | `boolean`           | `false`  | Whether this is the source element       |
| `sourceRoute` | `string`            | -        | Route identifier for the current screen  |
| `style`       | `ViewStyle`         | -        | Additional styles for the container      |

#### Transition Types

- **`move`**: Animates both position and scale changes
- **`scale`**: Only animates scale changes (no position movement)

### SharedViewProvider

Context provider that manages shared view data.

### useSharedView

Hook to access shared view context for managing transitions.

#### Methods

| Method                | Type                                          | Description                                    |
| --------------------- | --------------------------------------------- | ---------------------------------------------- |
| `setActiveTransition` | `(id: string \| null) => void`                | Set the active transition ID                   |
| `isActiveTransition`  | `(id: string) => boolean`                     | Check if an element is currently transitioning |
| `registerElement`     | `(data: SharedViewData) => void`              | Register an element (internal use)             |
| `getElementData`      | `(id: string) => SharedViewData \| undefined` | Get element data (internal use)                |
| `clearElement`        | `(id: string) => void`                        | Clear element data (internal use)              |

## Examples

### Complete Expo Router Integration

Here's a real-world example based on the Upayee app integration:

#### 1. App Layout Configuration

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { SharedViewProvider } from "react-native-shared-element-transition";

export default function RootLayout() {
  return (
    <SharedViewProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none", // ⚠️ CRITICAL: Disable default animations
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)/batches/[batchId]"
          options={{
            headerShown: false,
            animation: "none", // ⚠️ CRITICAL: Disable for detail screens
          }}
        />
      </Stack>
    </SharedViewProvider>
  );
}
```

#### 2. Source Screen (List/Grid)

```tsx
// app/(tabs)/batches/index.tsx
import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import {
  SharedView,
  useSharedView,
} from "react-native-shared-element-transition";
import { useRouter, usePathname } from "expo-router";

const BatchItem = memo(({ item, colors }) => {
  const { setActiveTransition } = useSharedView();
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = () => {
    // 1. Clear any active transition first
    setActiveTransition(null);

    // 2. Set active transition after small delay
    setTimeout(() => {
      setActiveTransition(`batch-image-${item.batchId}`);
      router.push({
        pathname: "/(tabs)/batches/[batchId]",
        params: { batchId: item.batchId },
      });
    }, 0);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <SharedView
        id={`batch-image-${item.batchId}`}
        isSource={true} // ⚠️ IMPORTANT: true for source
        sourceRoute={pathname}
        transition="move"
        duration={400}
        style={styles.batchImage}
      >
        <Image source={item.image} style={styles.image} />
      </SharedView>

      <Text style={styles.batchName}>{item.name}</Text>
    </TouchableOpacity>
  );
});

export default function BatchesScreen() {
  return (
    <FlatList
      data={batchData}
      renderItem={({ item }) => <BatchItem item={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

#### 3. Destination Screen (Detail)

```tsx
// app/(tabs)/batches/[batchId].tsx
import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { SharedView } from "react-native-shared-element-transition";
import { useLocalSearchParams } from "expo-router";

export default function BatchDetailsScreen() {
  const { batchId } = useLocalSearchParams();
  const batch = getBatchById(batchId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <SharedView
          id={`batch-image-${batchId}`}
          isSource={false} // ⚠️ IMPORTANT: false for destination
          transition="move"
          duration={400}
          style={StyleSheet.absoluteFillObject}
        >
          <Image source={batch.image} style={styles.batchImage} />
        </SharedView>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{batch.name}</Text>
        <Text style={styles.description}>{batch.description}</Text>
      </View>
    </ScrollView>
  );
}
```

### Scale Only Transition

```tsx
<SharedView
  id="image"
  isSource={true}
  sourceRoute="gallery"
  transition="scale"
  duration={500}
>
  <Image source={{ uri: "https://example.com/image.jpg" }} />
</SharedView>
```

## Integration Guide

### Critical Requirements for Proper Integration

#### 1. Route Animation Configuration

**⚠️ CRITICAL**: You MUST disable default route animations **only in the local stack** where shared element transitions are used. Parent stacks can keep their animations.

```tsx
// app/_layout.tsx - Parent stack (can keep animations)
<Stack
  screenOptions={{
    // ✅ Parent stack can have animations
  }}
>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
</Stack>

// app/(tabs)/batches/_layout.tsx - Local stack with shared elements
<Stack
  screenOptions={{
    animation: "none", // ⚠️ REQUIRED only in this local stack
    animationDuration: 0,
  }}
>
  <Stack.Screen name="index" />
  <Stack.Screen name="[batchId]" />
</Stack>
```

#### 2. Context Management

Always use the `setActiveTransition` method to manage transitions:

```tsx
const { setActiveTransition } = useSharedView();

const handleNavigation = () => {
  // 1. Clear any existing transition
  setActiveTransition(null);

  // 2. Set new transition after small delay
  setTimeout(() => {
    setActiveTransition("your-element-id");
    router.push("/destination");
  }, 0);
};
```

#### 3. Element Configuration

- **Source elements**: `isSource={true}` + `sourceRoute={pathname}`
- **Destination elements**: `isSource={false}` (no sourceRoute needed)
- **Unique IDs**: Use consistent, unique IDs across screens

#### 4. Common Pitfalls

❌ **Don't forget to disable route animations in the local stack**

```tsx
// BAD - will break shared element transitions
<Stack.Screen name="detail" options={{ animation: "slide_from_right" }} />

// GOOD - disable only in the local stack with shared elements
<Stack screenOptions={{ animation: "none" }}>
  <Stack.Screen name="detail" />
</Stack>
```

❌ **Don't forget to set isSource correctly**

```tsx
// BAD - missing isSource prop
<SharedView id="card">
  <View>Content</View>
</SharedView>
```

❌ **Don't forget to call setActiveTransition**

```tsx
// BAD - transition won't work
const handlePress = () => {
  router.push("/detail"); // Missing setActiveTransition call
};
```

✅ **Correct implementation**

```tsx
// GOOD - proper configuration
<Stack.Screen name="detail" options={{ animation: "none" }} />

<SharedView id="card" isSource={true} sourceRoute={pathname}>
  <View>Content</View>
</SharedView>

const handlePress = () => {
  setActiveTransition(null);
  setTimeout(() => {
    setActiveTransition("card");
    router.push("/detail");
  }, 0);
};
```

## Troubleshooting

### Common Issues

#### 1. Transitions Not Working

**Problem**: Shared elements don't animate between screens.

**Solutions**:

- ✅ Ensure `animation: "none"` is set **only in the local stack** where shared elements are used
- ✅ Verify `isSource={true}` on source elements and `isSource={false}` on destination elements
- ✅ Check that `setActiveTransition` is called before navigation
- ✅ Ensure unique IDs are used consistently across screens

#### 2. Elements Jumping or Flickering

**Problem**: Elements appear to jump or flicker during transition.

**Solutions**:

- ✅ Use `setTimeout` with 0ms delay when calling `setActiveTransition`
- ✅ Ensure source elements have `sourceRoute` prop set to current pathname
- ✅ Check that element dimensions are properly measured

#### 3. Performance Issues

**Problem**: Animations are choppy or slow.

**Solutions**:

- ✅ Use `memo()` for list items to prevent unnecessary re-renders
- ✅ Avoid complex layouts inside SharedView components
- ✅ Consider using `removeClippedSubviews` for large lists

#### 4. TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solutions**:

- ✅ Ensure all required props are provided (`id`, `isSource`)
- ✅ Use proper typing for `useSharedView` hook
- ✅ Import types from the library: `import type { SharedViewProps } from "react-native-shared-element-transition"`

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
REACT_NATIVE_SHARED_ELEMENT_DEBUG=true
```

This will log transition events to the console for debugging.

## Requirements

- React Native >= 0.60.0
- React >= 16.8.0
- React Native Reanimated >= 2.0.0
- Expo Router >= 2.0.0 (if using Expo Router)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you encounter any issues or have questions, please file an issue on GitHub.
