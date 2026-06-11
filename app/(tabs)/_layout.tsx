import type { ReactNode } from "react";
import { Tabs } from "expo-router";
import { CalendarDays, FileText, Home, Plus, User } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/theme/colors";

function TabIcon({
  color,
  focused,
  label,
  icon,
}: {
  color: string;
  focused: boolean;
  label: string;
  icon: ReactNode;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 8, width: 64 }}>
      {icon}
      <Text numberOfLines={1} style={{ color, fontSize: 11, fontWeight: focused ? "600" : "400", marginTop: 4 }}>{label}</Text>
      {focused ? <View style={{ width: 4, height: 4, borderRadius: 999, backgroundColor: colors.amber, marginTop: 3 }} /> : null}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.muted,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="Today" icon={<Home color={color} size={20} strokeWidth={focused ? 2.5 : 2} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              label="Calendar"
              icon={<CalendarDays color={color} size={20} strokeWidth={focused ? 2.5 : 2} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          tabBarIcon: () => null,
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <Pressable onPress={props.onPress} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <LinearGradient
                colors={[colors.navy, "#7898B2"]}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.navy,
                  shadowOpacity: 0.28,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 8 },
                }}
              >
                <Plus color="#FFFFFF" size={26} strokeWidth={2.5} />
              </LinearGradient>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="passport"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="Passport" icon={<FileText color={color} size={20} strokeWidth={focused ? 2.5 : 2} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="Profile" icon={<User color={color} size={20} strokeWidth={focused ? 2.5 : 2} />} />
          ),
        }}
      />
    </Tabs>
  );
}
