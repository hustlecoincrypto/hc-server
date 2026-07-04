import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { GlassCard } from "@/src/components/GlassCard";
import { StatusPill } from "@/src/components/StatusPill";

const HERO =
  "https://images.unsplash.com/photo-1706675780107-7c43cc487928?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxkYXJrJTIwZm9vdGJhbGwlMjBzdGFkaXVtJTIwbmlnaHR8ZW58MHx8fHwxNzgzMTc3MjA4fDA&ixlib=rb-4.1.0&q=85";

export default function PlayerEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"TODOS" | "AO VIVO" | "DIÁRIOS">("TODOS");

  const load = useCallback(async () => {
    try {
      const list = await api.events();
      setEvents(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const liveEvent = events.find((e) => e.status === "LIVE" && e.kind === "LIVE_MATCH");
  const filtered = events.filter((e) => {
    if (filter === "TODOS") return true;
    if (filter === "AO VIVO") return e.status === "LIVE";
    if (filter === "DIÁRIOS") return e.kind === "DAILY_HUSTLE";
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="player-events-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.h1}>EVENTOS</Text>
          <Text style={styles.h2}>CORRIDAS AO VIVO</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {(["TODOS", "AO VIVO", "DIÁRIOS"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              testID={`filter-chip-${f.toLowerCase().replace(/\s/g, "-")}`}
              onPress={() => setFilter(f)}
              style={[styles.chip, filter === f && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTxt, filter === f && styles.chipTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        {loading && !events.length && <ActivityIndicator color={colors.gold} />}

        {/* Featured LIVE card */}
        {liveEvent && (filter === "TODOS" || filter === "AO VIVO") && (
          <TouchableOpacity
            testID="featured-live-event-card"
            activeOpacity={0.9}
            onPress={() => router.push(`/(player)/event/${liveEvent.id}` as any)}
          >
            <ImageBackground
              source={{ uri: HERO }}
              style={styles.featured}
              imageStyle={{ borderRadius: radius.xl, opacity: 0.55 }}
            >
              <LinearGradient
                colors={["rgba(10,11,16,0.25)", "rgba(10,11,16,0.92)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
              />
              <View style={styles.featuredInner}>
                <View style={styles.rowBetween}>
                  <StatusPill status="LIVE" />
                  <Text style={styles.rarityTag}>{liveEvent.rarity}</Text>
                </View>

                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text style={styles.featuredTitle}>{liveEvent.title}</Text>
                  <Text style={styles.featuredSub}>{liveEvent.subtitle}</Text>

                  <View style={styles.fixtureStrip}>
                    <Text style={styles.fxTeam}>{liveEvent.match?.team_home}</Text>
                    <Text style={styles.fxScore}>
                      {liveEvent.match?.score_home} — {liveEvent.match?.score_away}
                    </Text>
                    <Text style={styles.fxTeam}>{liveEvent.match?.team_away}</Text>
                  </View>

                  <View style={styles.minuteRow}>
                    <View style={styles.liveDot} />
                    <Text style={styles.minute}>{liveEvent.match?.minute}&apos;</Text>
                    <Text style={styles.resultsLive}>Resultados em direto</Text>
                  </View>
                </View>

                <View style={styles.fxStats}>
                  <FxStat label="A tua posição" value="12º" gold />
                  <FxStat label="Pontos" value="1 450" />
                  <FxStat label="Total" value={liveEvent.total_players_display.toLocaleString("pt-PT")} />
                </View>

                <View style={styles.rewardPreview}>
                  <Text style={styles.rewardLabel}>Prémio Game HC (pool aprovado)</Text>
                  <Text style={styles.rewardValue}>
                    {liveEvent.approved_pool.toLocaleString("pt-PT")} HC
                  </Text>
                </View>

                <View style={[styles.rowBetween, { marginTop: spacing.md }]}>
                  <TouchableOpacity
                    testID="ver-ranking-button"
                    style={[styles.btn, styles.btnGhost]}
                    onPress={() => router.push("/(player)/leaderboard")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trophy-outline" size={14} color={colors.textPrimary} />
                    <Text style={styles.btnGhostTxt}>VER RANKING</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID="participar-button"
                    style={[styles.btn, styles.btnPrimary]}
                    onPress={() => router.push(`/(player)/event/${liveEvent.id}` as any)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnPrimaryTxt}>PARTICIPAR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}

        {/* Rotating daily events */}
        <Text style={styles.sectionHeader}>ROTAÇÃO DIÁRIA</Text>
        {filtered
          .filter((e) => e.id !== liveEvent?.id)
          .map((e) => (
            <TouchableOpacity
              key={e.id}
              testID={`event-card-${e.slug}`}
              activeOpacity={0.9}
              onPress={() => router.push(`/(player)/event/${e.id}` as any)}
            >
              <GlassCard>
                <View style={styles.rowBetween}>
                  <Text style={styles.dailyTitle}>{e.title}</Text>
                  <StatusPill status={e.status} />
                </View>
                <Text style={styles.dailySub}>{e.subtitle}</Text>
                <View style={styles.dailyMeta}>
                  <Text style={styles.dailyMetaTxt}>{e.rarity}</Text>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.dailyMetaTxt}>{e.region}</Text>
                  <Text style={styles.dot}>·</Text>
                  <Text style={[styles.dailyMetaTxt, { color: colors.gold }]}>
                    {e.approved_pool > 0
                      ? `${e.approved_pool.toLocaleString("pt-PT")} HC`
                      : "Pool a definir"}
                  </Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}

        <Text style={styles.disclaimer} testID="events-disclaimer">
          Recompensas em Game HC. Sem apostas, sem odds, sem pagamentos garantidos.
        </Text>
      </ScrollView>
    </View>
  );
}

const FxStat: React.FC<{ label: string; value: string; gold?: boolean }> = ({ label, value, gold }) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.fxStatLabel}>{label}</Text>
    <Text style={[styles.fxStatVal, gold && { color: colors.gold }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  h1: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  h2: { color: colors.textPrimary, fontSize: 28, fontWeight: "900", letterSpacing: -0.5, marginTop: 4 },

  chipRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: "center",
    flexShrink: 0,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipTxt: { color: colors.textSecondary, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  chipTxtActive: { color: "#0A0B10" },

  featured: {
    borderRadius: radius.xl,
    overflow: "hidden",
    minHeight: 400,
    borderWidth: 1,
    borderColor: "rgba(227,163,54,0.3)",
  },
  featuredInner: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rarityTag: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  featuredTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  featuredSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2, marginBottom: spacing.md },

  fixtureStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  fxTeam: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", flex: 1, textAlign: "center" },
  fxScore: { color: colors.gold, fontSize: 26, fontWeight: "900", letterSpacing: 1 },

  minuteRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: spacing.sm },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  minute: { color: colors.red, fontSize: 12, fontWeight: "800" },
  resultsLive: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" },

  fxStats: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  fxStatLabel: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  fxStatVal: { color: colors.textPrimary, fontSize: 16, fontWeight: "800", marginTop: 2 },

  rewardPreview: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: "rgba(227,163,54,0.10)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(227,163,54,0.25)",
  },
  rewardLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  rewardValue: { color: colors.gold, fontSize: 20, fontWeight: "900", marginTop: 2 },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  btnPrimary: { backgroundColor: colors.gold },
  btnPrimaryTxt: { color: "#0A0B10", fontWeight: "900", letterSpacing: 1.2, fontSize: 12 },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: colors.glassBorder },
  btnGhostTxt: { color: colors.textPrimary, fontWeight: "800", letterSpacing: 1, fontSize: 11 },

  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: spacing.md,
  },
  dailyTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "800" },
  dailySub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  dailyMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  dailyMetaTxt: { color: colors.textTertiary, fontSize: 11, fontWeight: "700" },
  dot: { color: colors.textTertiary },

  disclaimer: {
    color: colors.textTertiary,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 16,
  },
});
