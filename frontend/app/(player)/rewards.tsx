import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { GlassCard } from "@/src/components/GlassCard";
import { StatusPill } from "@/src/components/StatusPill";

export default function PlayerRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [safelock, setSafelock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([api.rewards(), api.safelock()]);
      setRewards(r);
      setSafelock(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const mine = rewards.filter((r) => r.winner_display_name === "Tu (Você)");
  const others = rewards.filter((r) => r.winner_display_name !== "Tu (Você)");
  const approvedPool = safelock?.decisions?.find((d: any) => d.event_id === "evt-live-brasil-noruega")?.approved_pool || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="player-rewards-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>RECOMPENSAS</Text>
          <Text style={styles.h1}>Revisão de Prémios</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        {loading && !rewards.length && <ActivityIndicator color={colors.gold} />}

        {/* Warning banner */}
        <View testID="rewards-warning-banner" style={styles.warning}>
          <Ionicons name="shield-checkmark" size={16} color={colors.gold} />
          <Text style={styles.warningTxt}>
            Recompensas em Game HC. Não são apostas, salários, nem pagamentos garantidos.
          </Text>
        </View>

        {/* SafeLock pool card */}
        {safelock && (
          <GlassCard testID="safelock-pool-card">
            <View style={styles.rowBetween}>
              <Text style={styles.sectionEyebrow}>POOL APROVADO PELO SAFELOCK</Text>
              <Ionicons name="lock-closed" size={14} color={colors.gold} />
            </View>
            <Text style={styles.poolValue}>{approvedPool.toLocaleString("pt-PT")} <Text style={styles.poolUnit}>HC</Text></Text>
            <View style={styles.poolMetaRow}>
              <PoolMeta label="Fundo demo" value={`${(safelock.fund_balance / 1000).toFixed(0)}k`} />
              <PoolMeta label="Cap semanal" value={`${(safelock.weekly_cap_remaining / 1000).toFixed(1)}k`} />
              <PoolMeta label="Ativos hoje" value={safelock.active_today} />
            </View>
          </GlassCard>
        )}

        {/* My rewards */}
        <Text style={styles.sectionHeader}>OS TEUS PRÉMIOS</Text>
        {mine.map((r) => (
          <GlassCard key={r.id} testID={`my-reward-${r.id}`}>
            <View style={styles.rowBetween}>
              <Text style={styles.rewardTitle}>Posição {r.rank}º</Text>
              <StatusPill status={r.status} />
            </View>
            <Text style={styles.rewardEvent}>{r.event_title}</Text>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.miniLabel}>A reclamar</Text>
                <Text style={styles.hcValue}>{r.game_hc.toLocaleString("pt-PT")} HC</Text>
              </View>
              <View style={{ alignItems: "flex-end", flex: 1 }}>
                <Text style={styles.miniLabel}>Pontos</Text>
                <Text style={styles.pointsValue}>{r.points.toLocaleString("pt-PT")}</Text>
              </View>
            </View>
            {r.reason && (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonTxt}>{r.reason}</Text>
              </View>
            )}
          </GlassCard>
        ))}

        {/* Pending others */}
        <Text style={styles.sectionHeader}>OUTROS VENCEDORES</Text>
        {others.map((r) => (
          <View key={r.id} testID={`other-reward-${r.id}`} style={styles.otherRow}>
            <Text style={styles.otherRank}>{r.rank}º</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.otherName}>{r.winner_display_name}</Text>
              <Text style={styles.otherMeta}>{r.points.toLocaleString("pt-PT")} pontos</Text>
            </View>
            <Text style={styles.otherHC}>{r.game_hc.toLocaleString("pt-PT")} HC</Text>
            <View style={{ marginLeft: 8 }}>
              <StatusPill status={r.status} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const PoolMeta: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.miniLabel}>{label}</Text>
    <Text style={styles.miniValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  h1: { color: colors.textPrimary, fontSize: 26, fontWeight: "900", marginTop: 4 },

  warning: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(227,163,54,0.10)", borderRadius: radius.md,
    borderWidth: 1, borderColor: "rgba(227,163,54,0.35)", padding: spacing.md,
  },
  warningTxt: { flex: 1, color: colors.textPrimary, fontSize: 11, fontWeight: "600", lineHeight: 16 },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionEyebrow: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  sectionHeader: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginTop: spacing.md },

  poolValue: { color: colors.gold, fontSize: 34, fontWeight: "900" },
  poolUnit: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  poolMetaRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  miniLabel: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  miniValue: { color: colors.textPrimary, fontSize: 14, fontWeight: "800", marginTop: 2 },

  rewardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  rewardEvent: { color: colors.textSecondary, fontSize: 12, marginBottom: spacing.sm },
  hcValue: { color: colors.gold, fontSize: 22, fontWeight: "900", marginTop: 2 },
  pointsValue: { color: colors.textPrimary, fontSize: 18, fontWeight: "800", marginTop: 2 },
  reasonBox: {
    marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.md,
    backgroundColor: "rgba(224,168,46,0.10)", borderWidth: 1, borderColor: "rgba(224,168,46,0.25)",
  },
  reasonTxt: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },

  otherRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    padding: spacing.md, backgroundColor: colors.glassBg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  otherRank: { color: colors.gold, fontSize: 14, fontWeight: "900", width: 30 },
  otherName: { color: colors.textPrimary, fontSize: 13, fontWeight: "700" },
  otherMeta: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  otherHC: { color: colors.textPrimary, fontSize: 13, fontWeight: "800" },
});
