import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TextInput } from "react-native";
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";

import { AppDataProvider } from "@/store/app-data-provider";
import { SessionProvider } from "@/store/session-provider";
import { fontFamilies } from "@/theme/typography";

function applyGlobalFontDefaults() {
  const textStyle = { fontFamily: fontFamilies.regular };
  const GlobalText = Text as typeof Text & { defaultProps?: { style?: unknown } };
  const GlobalTextInput = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };

  GlobalText.defaultProps = GlobalText.defaultProps ?? {};
  GlobalText.defaultProps.style = [textStyle, GlobalText.defaultProps.style].filter(Boolean);

  GlobalTextInput.defaultProps = GlobalTextInput.defaultProps ?? {};
  GlobalTextInput.defaultProps.style = [textStyle, GlobalTextInput.defaultProps.style].filter(Boolean);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  applyGlobalFontDefaults();

  return (
    <SessionProvider>
      <AppDataProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F7F4EE" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="medication/[id]"
            options={{ presentation: "card", headerShown: true, title: "Medication Details" }}
          />
          <Stack.Screen
            name="medication/edit/[id]"
            options={{ presentation: "card", headerShown: true, title: "Edit Medication" }}
          />
          <Stack.Screen
            name="medication/new"
            options={{ presentation: "modal", headerShown: true, title: "Add Medication" }}
          />
          <Stack.Screen
            name="settings/change-password"
            options={{ presentation: "card", headerShown: true, title: "Change Password" }}
          />
        </Stack>
      </AppDataProvider>
    </SessionProvider>
  );
}
