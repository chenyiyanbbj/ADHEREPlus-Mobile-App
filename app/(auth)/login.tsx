import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";

import { PillGlyph } from "@/components/medication/pill-glyph";
import { colors } from "@/theme/colors";
import { useSession } from "@/store/session-provider";

export default function LoginScreen() {
  const { signIn, loading } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [loginId, setLoginId] = useState("TX-20847");
  const [password, setPassword] = useState("temp-password");
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(() => !loginId.trim() || !password.trim() || loading, [loading, loginId, password]);

  async function handleLogin() {
    if (isDisabled) {
      return;
    }

    const result = await signIn(loginId, password);

    if (!result.ok) {
      setError(result.message ?? "Login failed.");
      return;
    }

    setError(null);
    router.replace("/today");
  }

  return (
    <View className="flex-1 bg-brand-bg">
      <LinearGradient
        colors={["#F8EBD8", "#F7F4EE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 84, paddingBottom: 36, paddingHorizontal: 24 }}
      >
        <View style={{ position: "absolute", top: 42, left: -10, opacity: 0.15 }}>
          <PillGlyph color={colors.amber} width={96} />
        </View>
        <View style={{ position: "absolute", top: 58, right: -8, opacity: 0.12, transform: [{ rotate: "-25deg" }] }}>
          <PillGlyph color={colors.navy} width={74} />
        </View>

        <View className="items-center">
          <LinearGradient
            colors={[colors.navy, "#7898B2"]}
            style={{ width: 84, height: 84, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 20 }}
          >
            <View style={{ width: 34, height: 6, backgroundColor: "#FFFFFF", borderRadius: 999, position: "absolute" }} />
            <View style={{ width: 6, height: 34, backgroundColor: colors.amber, borderRadius: 999 }} />
          </LinearGradient>

          <View className="flex-row items-end">
            <Text className="text-[34px] font-bold tracking-tight text-brand-navy">ADHERE</Text>
            <Text className="text-[34px] font-bold text-brand-amber">+</Text>
          </View>
          <Text className="mt-1 text-sm text-brand-muted">Medication Adherence Support</Text>
        </View>
      </LinearGradient>

      <View className="flex-1 px-6 pt-8">
        <View className="gap-4">
          <View>
            <Text className="mb-2 text-sm font-medium text-brand-navy">Patient Code</Text>
            <TextInput
              autoCapitalize="characters"
              autoCorrect={false}
              className="h-14 rounded-3xl border border-brand-border bg-white px-4 text-base text-brand-navy"
              placeholder="e.g. TX-20847"
              placeholderTextColor={colors.muted}
              value={loginId}
              onChangeText={setLoginId}
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-brand-navy">Password</Text>
            <View className="flex-row items-center rounded-3xl border border-brand-border bg-white px-4">
              <TextInput
                secureTextEntry={!showPassword}
                autoCorrect={false}
                className="h-14 flex-1 text-base text-brand-navy"
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable hitSlop={8} onPress={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff color={colors.muted} size={20} /> : <Eye color={colors.muted} size={20} />}
              </Pressable>
            </View>
          </View>

          {error ? <Text className="text-sm text-brand-missed">{error}</Text> : null}

          <Pressable disabled={isDisabled} onPress={handleLogin}>
            <LinearGradient
              colors={[colors.navy, "#7898B2"]}
              style={{
                height: 56,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-semibold text-white">Log in</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Text className="pt-2 text-center text-sm text-brand-muted">
            Forgot your password? Contact your doctor to reset it.
          </Text>
        </View>
      </View>
    </View>
  );
}
