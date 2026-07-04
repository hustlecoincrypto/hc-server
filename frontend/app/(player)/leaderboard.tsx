import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { GlassCard } from "@/src/components/GlassCard";

const EVENT_ID = "evt-live-brasil-noruega";

export default function PlayerLeaderboard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.leaderboard(EVENT_ID);
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const userEntry = items.find((i) => i.is_user);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="player-leaderboard-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CLASSIFICAÇÃO</Text>
          <Text style={styles.h1}>Ranking em direto</Text>
          <Text style={styles.sub}>Bloqueia ao apito final · reset em 03:12:44</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        {loading && !items.length && <ActivityIndicator color={colors.gold} />}

        {/* User pinned card */}
        {userEntry && (
          <GlassCard testID="user-rank-card" style={styles.userCard}>
            <View style={styles.userTop}>
              <View style={styles.userRankCircle}>
                <Text style={styles.userRankTxt}>{items.indexOf(userEntry) + 1}º</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{userEntry.display_name}</Text>
                <Text style={styles.userMeta}>Angola · a subir</Text>
              </View>
              <View style={styles.userPointsBox}>
                <Text style={styles.userPointsLabel}>PONTOS</Text>
                <Text style={styles.userPoints}>{userEntry.points.toLocaleString("pt-PT")}</Text>
              </View>
            </View>

            <View style={styles.breakdown}>
              <BreakItem label="Quiz pré-jogo" value="150" />
              <BreakItem label="Apoia equipa" value="200" />
              <BreakItem label="Fan comm." value="100" />
              <BreakItem label="Outros" value="1 000" />
            </View>
          </GlassCard>
        )}

        {/* Reward preview */}
        <GlassCard testID="reward-preview-card">
          <View style={styles.rowBetween}>
            <Text style={styles.sectionEyebrow}>PRÉ-VISUALIZAÇÃO DE PRÉMIOS</Text>
            <Ionicons name="trophy" size={16} color={colors.gold} />
          </View>
          <View style={styles.tierGrid}>
            <TierBox rank={1} value="10 000" />
            <TierBox rank={2} value="5 000" />
            <TierBox rank={3} value="2 500" />
          </View>
        </GlassCard>

        {/* Top players list */}
        <Text style={styles.sectionHeader}>TOP JOGADORES</Text>
        {items.map((entry, i) => (
          <View
            key={entry.id}
            testID={`leaderboard-row-${i + 1}`}
            style={[styles.row, entry.is_user && styles.rowUser]}
          >
            <Text style={[styles.rowRank, i < 3 && { color: colors.gold }]}>{i + 1}º</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{entry.display_name}</Text>
              <Text style={styles.rowCountry}>{entry.country}</Text>
            </View>
            <Text style={styles.rowPoints}>{entry.points.toLocaleString("pt-PT")}</Text>
          </View>
        ))}

        <Text style={styles.disclaimer}>
          Recompensas em Game HC. Não são apostas, salários, nem pagamentos garantidos.
        </Text>
      </ScrollView>
    </View>
  );
}

const BreakItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.breakItem}>
    <Text style={styles.breakLabel}>{label}</Text>
    <Text style={styles.breakValue}>{value}</Text>
  </View>
);

const TierBox: React.FC<{ rank: number; value: string }> = ({ rank, value }) => (
  <View style={styles.tierBox}>
    <Text style={styles.tierRank}>{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</Text>
    <Text style={styles.tierLabel}>TOP {rank}</Text>
    <Text style={styles.tierValue}>{value} HC</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  h1: { color: colors.textPrimary, fontSize: 26, fontWeight: "900", marginTop: 4 },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },

  userCard: { borderColor: "rgba(227,163,54,0.5)", backgroundColor: "rgba(227,163,54,0.06)" },
  userTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  userRankCircle: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: colors.gold,
    alignItems: "center", justifyContent: "center",
  },
  userRankTxt: { color: "#0A0B10", fontWeight: "900", fontSize: 18 },
  userName: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  userMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  userPointsBox: { alignItems: "flex-end" },
  userPointsLabel: { color: colors.textTertiary, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  userPoints: { color: colors.gold, fontSize: 22, fontWeight: "900" },

  breakdown: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.md, gap: spacing.sm },
  breakItem: { flex: 1, minWidth: "45%", padding: spacing.sm, borderRadius: radius.md, backgroundColor: "rgba(0,0,0,0.25)", borderWidth: 1, borderColor: colors.glassBorder },
  breakLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  breakValue: { color: colors.textPrimary, fontSize: 15, fontWeight: "800", marginTop: 2 },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionEyebrow: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  sectionHeader: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginTop: spacing.md },

  tierGrid: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  tierBox: { flex: 1, alignItems: "center", padding: spacing.md, borderRadius: radius.md, backgroundColor: "rgba(0,0,0,0.25)", borderWidth: 1, borderColor: "rgba(227,163,54,0.25)" },
  tierRank: { fontSize: 22 },
  tierLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
  tierValue: { color: colors.gold, fontSize: 15, fontWeight: "900", marginTop: 4 },

  row: {
    flexDirection: "row", alignItems: "center", padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder, gap: spacing.md,
  },
  rowUser: { borderColor: "rgba(227,163,54,0.5)", backgroundColor: "rgba(227,163,54,0.08)" },
  rowRank: { color: colors.textPrimary, fontSize: 15, fontWeight: "900", width: 40 },
  rowName: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
  rowCountry: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", marginTop: 2 },
  rowPoints: { color: colors.gold, fontSize: 15, fontWeight: "900" },

  disclaimer: { color: colors.textTertiary, fontSize: 11, textAlign: "center", marginTop: spacing.md, lineHeight: 16 },
});
