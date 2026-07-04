import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/src/theme";

const HERO =
  "https://images.unsplash.com/photo-1706675780107-7c43cc487928?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxkYXJrJTIwZm9vdGJhbGwlMjBzdGFkaXVtJTIwbmlnaHR8ZW58MHx8fHwxNzgzMTc3MjA4fDA&ixlib=rb-4.1.0&q=85";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.root} testID="role-selector-screen">
      <ImageBackground source={{ uri: HERO }} style={styles.hero} imageStyle={{ opacity: 0.65 }}>
        <LinearGradient
          colors={["rgba(10,11,16,0)", "rgba(10,11,16,0.85)", colors.bgBase]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <View style={styles.top}>
            <Text style={styles.eyebrow}>HUSTLECOIN · MATCHDAY EVENTS</Text>
            <Text style={styles.brand}>Prototype</Text>
          </View>

          <View style={styles.center}>
            <Text style={styles.h1}>O terreno de jogo{"\n"}está pronto.</Text>
            <Text style={styles.sub}>
              Vive os eventos em direto, missões e recompensas em Game HC — sem apostas, sem
              pagamentos garantidos.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              testID="enter-as-player-button"
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => router.push("/(player)/home")}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryTxt}>ENTRAR COMO JOGADOR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="enter-as-admin-button"
              style={[styles.btn, styles.btnGhost]}
              onPress={() => router.push("/(admin)/events")}
              activeOpacity={0.85}
            >
              <Text style={styles.btnGhostTxt}>Enter as Admin</Text>
            </TouchableOpacity>

            <Text testID="disclaimer" style={styles.disclaimer}>
              Recompensas em Game HC. Não são apostas, salários, nem pagamentos garantidos.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  hero: { flex: 1, justifyContent: "space-between" },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.2,
  },
  brand: { color: colors.textPrimary, fontSize: 20, fontWeight: "800", marginTop: 4 },
  center: { paddingHorizontal: spacing.lg },
  h1: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 44,
    letterSpacing: -1,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: spacing.md,
    lineHeight: 22,
    maxWidth: 360,
  },
  actions: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  btn: {
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: colors.gold },
  btnPrimaryTxt: {
    color: "#0A0B10",
    fontWeight: "900",
    letterSpacing: 1.4,
    fontSize: 13,
  },
  btnGhost: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  btnGhostTxt: { color: colors.textPrimary, fontWeight: "700", fontSize: 14 },
  disclaimer: {
    color: colors.textTertiary,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
});
