import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
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
  "https://images.pexels.com/photos/15779126/pexels-photo-15779126.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function PlayerHome() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const d = await api.dashboard();
      setData(d);
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const active = data.active_event;
  const next = data.next_event;
  const safelock = data.safelock_summary;
  const player = data.player;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="player-home-screen">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.gold} />}
      >
        <ImageBackground source={{ uri: HERO }} style={styles.hero} imageStyle={{ opacity: 0.55 }}>
          <LinearGradient
            colors={["rgba(10,11,16,0.2)", "rgba(10,11,16,0.9)", colors.bgBase]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={["top"]}>
            <View style={styles.heroInner}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.eyebrow}>OLÁ, JOGADOR</Text>
                  <Text style={styles.headerName}>{player.display_name}</Text>
                </View>
                <View style={styles.levelBadge} testID="player-level-badge">
                  <Ionicons name="star" size={12} color={colors.gold} />
                  <Text style={styles.levelTxt}>NÍVEL {player.level}</Text>
                </View>
              </View>

              <View style={styles.stats}>
                <StatBox label="Pontos" value={player.points.toLocaleString("pt-PT")} />
                <StatBox label="Posição" value={`${player.rank}º`} />
                <StatBox label="Estado" value={player.activity_status} />
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md, marginTop: -spacing.lg }}>
          {/* Active event */}
          <TouchableOpacity
            testID="active-event-card"
            activeOpacity={0.9}
            onPress={() => router.push(`/(player)/event/${active.id}` as any)}
          >
            <GlassCard>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionEyebrow}>EVENTO ATIVO</Text>
                <StatusPill status="LIVE" />
              </View>
              <Text style={styles.eventTitle}>{active.title}</Text>
              <Text style={styles.eventSubtitle}>{active.subtitle}</Text>
              {active.match && (
                <View style={styles.scoreRow}>
                  <Text style={styles.team}>{active.match.team_home}</Text>
                  <Text style={styles.score}>
                    {active.match.score_home} — {active.match.score_away}
                  </Text>
                  <Text style={styles.team}>{active.match.team_away}</Text>
                </View>
              )}
              {active.match && (
                <View style={styles.minuteRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.minute}>{active.match.minute}&apos;</Text>
                  <Text style={styles.phase}>{active.match.phase.replace("_", " ")}</Text>
                </View>
              )}
              <View style={styles.rowBetween}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniLabel}>Jogadores</Text>
                  <Text style={styles.miniValue}>{active.total_players_display.toLocaleString("pt-PT")}</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniLabel}>Pool aprovado</Text>
                  <Text style={[styles.miniValue, { color: colors.gold }]}>
                    {active.approved_pool.toLocaleString("pt-PT")} HC
                  </Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <QuickAction
              testID="quick-action-events"
              icon="flame"
              label="Eventos"
              onPress={() => router.push("/(player)/events")}
            />
            <QuickAction
              testID="quick-action-missions"
              icon="checkmark-done"
              label="Missões"
              onPress={() => router.push(`/(player)/event/${active.id}` as any)}
            />
            <QuickAction
              testID="quick-action-ranking"
              icon="trophy"
              label="Ranking"
              onPress={() => router.push("/(player)/leaderboard")}
            />
            <QuickAction
              testID="quick-action-rewards"
              icon="gift"
              label="Prémios"
              onPress={() => router.push("/(player)/rewards")}
            />
          </View>

          {/* Reward review */}
          {data.reward_status && (
            <GlassCard testID="reward-status-card">
              <View style={styles.rowBetween}>
                <Text style={styles.sectionEyebrow}>REVISÃO DE RECOMPENSA</Text>
                <StatusPill status={data.reward_status.status} />
              </View>
              <Text style={styles.rewardValue}>
                {data.reward_status.game_hc.toLocaleString("pt-PT")}{" "}
                <Text style={styles.rewardUnit}>Game HC</Text>
              </Text>
              <Text style={styles.rewardReason}>
                {data.reward_status.reason ||
                  "Sob revisão SafeLock. Recompensas em Game HC. Não são apostas."}
              </Text>
            </GlassCard>
          )}

          {/* SafeLock summary */}
          {safelock && (
            <GlassCard testID="safelock-summary-card">
              <View style={styles.rowBetween}>
                <Text style={styles.sectionEyebrow}>SAFELOCK · EVENTO</Text>
                <StatusPill status={safelock.status} />
              </View>
              <View style={[styles.rowBetween, { marginTop: spacing.sm }]}>
                <MiniField label="Fundo" value={`${(safelock.fund_balance / 1000).toFixed(0)}k`} />
                <MiniField label="Cap semanal" value={`${(safelock.weekly_cap_remaining / 1000).toFixed(1)}k`} />
                <MiniField label="Aprovado" value={`${(safelock.approved_pool / 1000).toFixed(1)}k`} />
              </View>
              <Text style={styles.safelockReason}>{safelock.reason}</Text>
            </GlassCard>
          )}

          {/* Next event */}
          {next && (
            <GlassCard testID="next-event-card">
              <View style={styles.rowBetween}>
                <Text style={styles.sectionEyebrow}>PRÓXIMO EVENTO</Text>
                <StatusPill status={next.status} />
              </View>
              <Text style={styles.eventTitle}>{next.title}</Text>
              <Text style={styles.eventSubtitle}>{next.subtitle}</Text>
            </GlassCard>
          )}

          <Text style={styles.footerDisclaimer} testID="home-disclaimer">
            Recompensas em Game HC. Não são apostas, salários, nem pagamentos garantidos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const QuickAction: React.FC<{ icon: any; label: string; onPress: () => void; testID: string }> = ({
  icon,
  label,
  onPress,
  testID,
}) => (
  <TouchableOpacity testID={testID} onPress={onPress} activeOpacity={0.8} style={styles.quickBox}>
    <Ionicons name={icon} size={22} color={colors.gold} />
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const MiniField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.miniLabel}>{label}</Text>
    <Text style={styles.miniValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgBase },
  hero: { height: 240 },
  heroInner: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: colors.textSecondary, fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  headerName: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", marginTop: 4 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(227,163,54,0.14)",
    borderWidth: 1,
    borderColor: "rgba(227,163,54,0.35)",
  },
  levelTxt: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  stats: { flexDirection: "row", marginTop: spacing.lg, gap: spacing.sm },
  statBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder },
  statLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  statValue: { color: colors.textPrimary, fontSize: 18, fontWeight: "800", marginTop: 2 },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionEyebrow: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  eventTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: "800" },
  eventSubtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2, marginBottom: spacing.md },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  team: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", flex: 1, textAlign: "center" },
  score: { color: colors.gold, fontSize: 28, fontWeight: "900", letterSpacing: 1 },
  minuteRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: spacing.md },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  minute: { color: colors.red, fontSize: 12, fontWeight: "800" },
  phase: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  miniStat: { flex: 1 },
  miniLabel: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  miniValue: { color: colors.textPrimary, fontSize: 14, fontWeight: "800", marginTop: 2 },

  quickRow: { flexDirection: "row", gap: spacing.sm },
  quickBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  quickLabel: { color: colors.textPrimary, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  rewardValue: { color: colors.textPrimary, fontSize: 26, fontWeight: "900", marginTop: 4 },
  rewardUnit: { color: colors.gold, fontSize: 14, fontWeight: "700" },
  rewardReason: { color: colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 18 },
  safelockReason: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.sm, lineHeight: 18 },

  footerDisclaimer: {
    color: colors.textTertiary,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 16,
  },
});
