import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { GlassCard } from "@/src/components/GlassCard";

export default function PlayerProfile() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.dashboard().then(setData).catch(console.warn);
  }, []);

  if (!data) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;
  const p = data.player;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="player-profile-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PERFIL</Text>
          <Text style={styles.h1}>{p.display_name}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 40 }}>
        <GlassCard testID="profile-summary-card">
          <View style={styles.top}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.display_name}</Text>
              <Text style={styles.country}>Angola · {p.country}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={11} color={colors.gold} />
                <Text style={styles.levelTxt}>NÍVEL {p.level}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat label="Pontos" value={p.points.toLocaleString("pt-PT")} />
            <Stat label="Rank" value={`${p.rank}º`} />
            <Stat label="Estado" value={p.activity_status} />
          </View>
        </GlassCard>

        <GlassCard testID="profile-eligibility-card">
          <Text style={styles.sectionEyebrow}>ELEGIBILIDADE</Text>
          <Text style={styles.eligibilityTxt}>{p.eligibility_notes}</Text>
          <View style={styles.walletRow}>
            <Ionicons name="wallet-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.walletTxt}>
              Carteira {p.wallet_connected ? "ligada" : "opcional · Web2 gameplay ativo"}
            </Text>
          </View>
        </GlassCard>

        <GlassCard testID="profile-key-status-card">
          <Text style={styles.sectionEyebrow}>ESTADO DA CHAVE</Text>
          <View style={styles.keyRow}>
            <Ionicons name="key" size={16} color={colors.gold} />
            <Text style={styles.keyTxt}>Chave de jogo válida · sem restrições</Text>
          </View>
          <View style={styles.keyRow}>
            <Ionicons name="shield-checkmark" size={16} color="#8AE58F" />
            <Text style={styles.keyTxt}>Sem sinais de abuso detectados</Text>
          </View>
        </GlassCard>

        <TouchableOpacity
          testID="switch-to-admin-button"
          onPress={() => router.replace("/(admin)/events")}
          style={styles.adminBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="construct" size={16} color={colors.gold} />
          <Text style={styles.adminBtnTxt}>Trocar para Admin (Demo)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="logout-button"
          onPress={() => router.replace("/")}
          style={styles.logoutBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutTxt}>Voltar ao início</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Recompensas em Game HC. Não são apostas, salários, nem pagamentos garantidos.
        </Text>
      </ScrollView>
    </View>
  );
}

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgBase },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  h1: { color: colors.textPrimary, fontSize: 26, fontWeight: "900", marginTop: 4 },

  top: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  avatar: {
    width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(227,163,54,0.14)", borderWidth: 1, borderColor: "rgba(227,163,54,0.35)",
  },
  name: { color: colors.textPrimary, fontSize: 17, fontWeight: "800" },
  country: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  levelBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
    marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill,
    backgroundColor: "rgba(227,163,54,0.14)",
  },
  levelTxt: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 1 },

  statsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  statBox: {
    flex: 1, padding: spacing.sm, borderRadius: radius.md,
    backgroundColor: "rgba(0,0,0,0.25)", borderWidth: 1, borderColor: colors.glassBorder,
  },
  statLabel: { color: colors.textTertiary, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  statValue: { color: colors.textPrimary, fontSize: 14, fontWeight: "800", marginTop: 2 },

  sectionEyebrow: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1.6, marginBottom: spacing.sm },
  eligibilityTxt: { color: colors.textPrimary, fontSize: 13, lineHeight: 20 },
  walletRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.sm },
  walletTxt: { color: colors.textSecondary, fontSize: 12 },

  keyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: spacing.sm },
  keyTxt: { color: colors.textPrimary, fontSize: 12 },

  adminBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: radius.pill,
    backgroundColor: "rgba(227,163,54,0.10)", borderWidth: 1, borderColor: "rgba(227,163,54,0.35)",
  },
  adminBtnTxt: { color: colors.gold, fontWeight: "800", letterSpacing: 0.5 },
  logoutBtn: { alignItems: "center", paddingVertical: 12 },
  logoutTxt: { color: colors.textTertiary, fontSize: 12, textDecorationLine: "underline" },

  disclaimer: { color: colors.textTertiary, fontSize: 11, textAlign: "center", lineHeight: 16 },
});
