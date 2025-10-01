# React Native Shared Element Transition

> **Note**: I found that Expo's new latest router (file-based router) does not support any library, so I expected to make this. I made this `react-native-shared-element-transition` library to provide shared element transitions for React Native applications.

A powerful and lightweight React Native library for creating smooth shared element transitions between screens. Built specifically to work with Expo's file-based router and all major navigation libraries.

## 🎥 Demo Video

<!-- Add your demo video here -->

[![Demo Video](https://img.shields.io/badge/📹-Watch%20Demo-red?style=for-the-badge)](https://your-video-url-here)

_Video demonstration coming soon - showing smooth transitions between cards and detail screens_

## ✨ Why This Library?

Expo's new file-based router doesn't support most shared element transition libraries. This library fills that gap by providing:

- 🎯 **Router Agnostic**: Works with Expo Router, React Navigation, React Native Navigation, and custom navigation
- ⚡ **High Performance**: Built with React Native Reanimated for 60fps animations
- 📱 **Cross-Platform**: iOS and Android support
- 🔧 **TypeScript**: Full type safety and IntelliSense
- 📦 **Lightweight**: Minimal dependencies, only requires react-native-reanimated
- 🎨 **Flexible**: Support for move and scale transitions

## 🚀 Quick Start

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

## 📱 Perfect for:

- Card-to-detail transitions
- Image gallery animations
- List-to-detail flows
- Any screen-to-screen element sharing

## 🛠️ Features:

- Smooth position and scale animations
- Customizable transition types (move/scale)
- Configurable duration and easing
- Context-based state management
- Zero navigation library dependencies

## Setup

### 1. Wrap your app with SharedElementProvider

```tsx
import React from "react";
import { SharedElementProvider } from "react-native-shared-element-transition";

export default function App() {
  return (
    <SharedElementProvider>{/* Your app content */}</SharedElementProvider>
  );
}
```

### 2. Use SharedElement in your components

```tsx
import React from "react";
import { View, Text } from "react-native";
import { SharedElement } from "react-native-shared-element-transition";

export function SourceScreen() {
  return (
    <View>
      <SharedElement id="shared-card" sourceRoute="source">
        <View style={{ width: 100, height: 100, backgroundColor: "blue" }}>
          <Text>Shared Element</Text>
        </View>
      </SharedElement>
    </View>
  );
}

export function DestinationScreen() {
  return (
    <View>
      <SharedElement id="shared-card" sourceRoute="destination">
        <View style={{ width: 200, height: 200, backgroundColor: "blue" }}>
          <Text>Shared Element</Text>
        </View>
      </SharedElement>
    </View>
  );
}
```

## API Reference

### SharedElement

The main component for creating shared element transitions.

#### Props

| Prop          | Type                | Default  | Description                              |
| ------------- | ------------------- | -------- | ---------------------------------------- |
| `id`          | `string`            | -        | Unique identifier for the shared element |
| `children`    | `React.ReactNode`   | -        | The element to animate                   |
| `transition`  | `"move" \| "scale"` | `"move"` | Type of transition animation             |
| `duration`    | `number`            | `300`    | Animation duration in milliseconds       |
| `sourceRoute` | `string`            | -        | Route identifier for the current screen  |
| `style`       | `ViewStyle`         | -        | Additional styles for the container      |

#### Transition Types

- **`move`**: Animates both position and scale changes
- **`scale`**: Only animates scale changes (no position movement)

### SharedElementProvider

Context provider that manages shared element data.

### useSharedElement

Hook to access shared element context (for advanced usage).

## Examples

### Basic Usage

```tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SharedElement } from "react-native-shared-element-transition";

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity onPress={() => navigation.navigate("Detail")}>
        <SharedElement id="card-1" sourceRoute="home">
          <View
            style={{
              width: 150,
              height: 150,
              backgroundColor: "#007AFF",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Tap me!</Text>
          </View>
        </SharedElement>
      </TouchableOpacity>
    </View>
  );
}

function DetailScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <SharedElement id="card-1" sourceRoute="detail">
        <View
          style={{
            width: 300,
            height: 200,
            backgroundColor: "#007AFF",
            borderRadius: 15,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
            Detailed View
          </Text>
        </View>
      </SharedElement>
    </View>
  );
}
```

### Scale Only Transition

```tsx
<SharedElement
  id="image"
  sourceRoute="gallery"
  transition="scale"
  duration={500}
>
  <Image source={{ uri: "https://example.com/image.jpg" }} />
</SharedElement>
```

### Expo Router Example

```tsx
// app/index.tsx
import { SharedElementProvider } from "react-native-shared-element-transition";

export default function RootLayout() {
  return (
    <SharedElementProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="detail/[id]" />
      </Stack>
    </SharedElementProvider>
  );
}

// app/detail/[id].tsx
import { SharedElement } from "react-native-shared-element-transition";

export default function DetailScreen() {
  return (
    <SharedElement id="card-1" sourceRoute="detail">
      <View style={styles.largeCard}>
        <Text>Detail View</Text>
      </View>
    </SharedElement>
  );
}
```

## Requirements

- React Native >= 0.60.0
- React >= 16.8.0
- React Native Reanimated >= 2.0.0

## Installation for Expo

```bash
# Install the library
npm install react-native-shared-element-transition

# Install Reanimated
npx expo install react-native-reanimated

# Add to app.json
{
  "expo": {
    "plugins": ["react-native-reanimated/plugin"]
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on [GitHub](https://github.com/NuZard84/react-native-shared-element-transition/issues).

## Built by

Built by the [Upayee Team](https://github.com/upayee) to solve real-world animation challenges in React Native apps.

---

⭐ **Star this repository if you find it helpful!**
