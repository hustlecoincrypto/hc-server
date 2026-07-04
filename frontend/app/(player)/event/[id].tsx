import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { GlassCard } from "@/src/components/GlassCard";
import { StatusPill } from "@/src/components/StatusPill";

const HERO =
  "https://images.pexels.com/photos/15779126/pexels-photo-15779126.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const PHASES = [
  { key: "PRE_MATCH", label: "Pré-jogo" },
  { key: "FIRST_HALF", label: "1ª Parte" },
  { key: "HALFTIME", label: "Intervalo" },
  { key: "SECOND_HALF", label: "2ª Parte" },
  { key: "FULLTIME", label: "Fim" },
  { key: "REWARDS_REVIEW", label: "Revisão" },
];

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, { correct: boolean; points: number }>>({});
  const [joined, setJoined] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [e, m] = await Promise.all([api.event(id), api.missions(id)]);
    setEvent(e);
    setMissions(m);
    if (e?.id && (e.id === "evt-live-brasil-noruega" || e.id === "evt-hustle-diario")) {
      setJoined(true);
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const handleJoin = async () => {
    if (!id) return;
    await api.joinEvent(id);
    setJoined(true);
  };

  const submit = async (missionId: string) => {
    const sel = selected[missionId];
    if (sel === undefined) return;
    const r = await api.submitQuiz(missionId, sel);
    setFeedback({ ...feedback, [missionId]: { correct: r.correct, points: r.points_awarded } });
    await load();
  };

  if (!event) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const currentPhaseIndex = PHASES.findIndex((p) => p.key === event.match?.phase);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="event-detail-screen">
      <ImageBackground source={{ uri: HERO }} style={styles.hero} imageStyle={{ opacity: 0.5 }}>
        <LinearGradient
          colors={["rgba(10,11,16,0.4)", "rgba(10,11,16,0.95)", colors.bgBase]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={["top"]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="event-back-button"
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <StatusPill status={event.status} />
          </View>

          <View style={styles.heroInner}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.subtitle}>{event.subtitle}</Text>

            {event.match && (
              <>
                <View style={styles.scoreBoard}>
                  <View style={styles.teamCol}>
                    <Text style={styles.teamName}>{event.match.team_home}</Text>
                    <Text style={styles.teamScore}>{event.match.score_home}</Text>
                  </View>
                  <View style={styles.middleCol}>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveTxt}>{event.match.minute}&apos;</Text>
                    </View>
                    <Text style={styles.vs}>vs</Text>
                  </View>
                  <View style={styles.teamCol}>
                    <Text style={styles.teamName}>{event.match.team_away}</Text>
                    <Text style={styles.teamScore}>{event.match.score_away}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.md }}>
        {/* Phase timeline */}
        {event.match && (
          <GlassCard testID="event-phases-card">
            <Text style={styles.sectionEyebrow}>FASES DO EVENTO</Text>
            <View style={styles.phaseRow}>
              {PHASES.map((p, i) => (
                <View key={p.key} style={styles.phaseItem}>
                  <View
                    style={[
                      styles.phaseDot,
                      i <= currentPhaseIndex && { backgroundColor: colors.gold, borderColor: colors.gold },
                    ]}
                  />
                  <Text
                    style={[styles.phaseLabel, i === currentPhaseIndex && { color: colors.gold, fontWeight: "800" }]}
                  >
                    {p.label}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Join / eligibility */}
        <GlassCard testID="event-join-card">
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionEyebrow}>ESTADO DE PARTICIPAÇÃO</Text>
              <Text style={styles.joinStatus}>
                {joined ? "✓ Inscrito no evento" : "Ainda não inscrito"}
              </Text>
              <Text style={styles.eligibility}>
                Elegibilidade: sem carteira obrigatória. Recompensas em Game HC apenas.
              </Text>
            </View>
            {!joined && (
              <TouchableOpacity
                testID="join-event-button"
                onPress={handleJoin}
                style={styles.joinBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.joinBtnTxt}>PARTICIPAR</Text>
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>

        {/* Rewards preview */}
        {event.reward_tiers?.length > 0 && (
          <GlassCard testID="event-rewards-card">
            <View style={styles.rowBetween}>
              <Text style={styles.sectionEyebrow}>PRÉMIOS GAME HC</Text>
              <Text style={styles.approvedPill}>Pool: {event.approved_pool.toLocaleString("pt-PT")}</Text>
            </View>
            {event.reward_tiers.map((t: any) => (
              <View key={t.rank} style={styles.tierRow}>
                <Text style={styles.tierRank}>
                  {t.rank === 1 ? "🥇" : t.rank === 2 ? "🥈" : t.rank === 3 ? "🥉" : `${t.rank}º`}
                </Text>
                <Text style={styles.tierGap}>Top {t.rank}</Text>
                <Text style={styles.tierValue}>{t.game_hc.toLocaleString("pt-PT")} HC</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Missions */}
        <Text style={styles.sectionHeader}>MISSÕES E QUIZ</Text>
        {missions.map((m) => {
          const fb = feedback[m.id];
          return (
            <GlassCard key={m.id} testID={`mission-card-${m.id}`}>
              <View style={styles.rowBetween}>
                <Text style={styles.missionTitle}>{m.title_pt}</Text>
                <View style={styles.pointsPill}>
                  <Text style={styles.pointsTxt}>+{m.points} pt</Text>
                </View>
              </View>
              <Text style={styles.missionDesc}>{m.description_pt}</Text>

              {m.question && m.status !== "LOCKED" && (
                <View style={{ marginTop: spacing.sm, gap: 6 }}>
                  <Text style={styles.question}>{m.question}</Text>
                  {m.options.map((opt: string, i: number) => (
                    <TouchableOpacity
                      key={i}
                      testID={`mission-${m.id}-option-${i}`}
                      onPress={() => setSelected({ ...selected, [m.id]: i })}
                      disabled={m.status === "COMPLETED"}
                      style={[
                        styles.optionBtn,
                        selected[m.id] === i && styles.optionActive,
                        fb && fb.correct && m.correct_index === i && styles.optionCorrect,
                        fb && !fb.correct && selected[m.id] === i && styles.optionWrong,
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.optionTxt}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                  {m.status !== "COMPLETED" && (
                    <TouchableOpacity
                      testID={`mission-${m.id}-submit`}
                      onPress={() => submit(m.id)}
                      disabled={selected[m.id] === undefined}
                      style={[
                        styles.submitBtn,
                        selected[m.id] === undefined && { opacity: 0.4 },
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.submitTxt}>ENVIAR</Text>
                    </TouchableOpacity>
                  )}
                  {fb && (
                    <Text style={{ color: fb.correct ? "#8AE58F" : "#FCA5A5", fontSize: 12, marginTop: 6, fontWeight: "700" }}>
                      {fb.correct ? `✓ Correto! +${fb.points} pontos.` : "✗ Resposta incorreta."}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.rowBetween}>
                <Text style={styles.missionStatus}>
                  {m.status === "COMPLETED" ? "Concluída" : m.status === "LOCKED" ? "Bloqueada" : "Aberta"}
                </Text>
                {m.kind === "CHECK_IN" && (
                  <Text style={styles.tinyNote}>Sem apostas · demo local</Text>
                )}
              </View>
            </GlassCard>
          );
        })}

        <GlassCard testID="leaderboard-lock-card">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="lock-closed" size={16} color={colors.gold} />
            <Text style={styles.sectionEyebrow}>BLOQUEIO DO RANKING</Text>
          </View>
          <Text style={styles.lockDesc}>
            O ranking será bloqueado ao apito final. Recompensas passam por revisão SafeLock antes de serem
            libertadas em Game HC.
          </Text>
        </GlassCard>

        <Text style={styles.footerDisclaimer}>
          Recompensas em Game HC. Não são apostas, odds, nem pagamentos garantidos.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgBase },
  hero: { paddingBottom: spacing.lg },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: colors.glassBorder,
  },
  heroInner: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { color: colors.gold, fontSize: 13, fontWeight: "700", letterSpacing: 1.5, marginTop: 4 },

  scoreBoard: {
    marginTop: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: spacing.md, borderRadius: radius.xl, backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1, borderColor: "rgba(227,163,54,0.3)",
  },
  teamCol: { flex: 1, alignItems: "center", gap: 4 },
  teamName: { color: colors.textPrimary, fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  teamScore: { color: colors.gold, fontSize: 40, fontWeight: "900" },
  middleCol: { alignItems: "center", gap: 6, paddingHorizontal: spacing.sm },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(211,47,47,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },
  liveTxt: { color: "#FCA5A5", fontSize: 11, fontWeight: "800" },
  vs: { color: colors.textTertiary, fontSize: 11, fontWeight: "700" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionEyebrow: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  sectionHeader: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginTop: spacing.md },

  phaseRow: { flexDirection: "row", marginTop: spacing.sm, justifyContent: "space-between" },
  phaseItem: { alignItems: "center", flex: 1 },
  phaseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: colors.glassBorder },
  phaseLabel: { color: colors.textTertiary, fontSize: 9, marginTop: 6, fontWeight: "600", letterSpacing: 0.5 },

  joinStatus: { color: colors.textPrimary, fontSize: 15, fontWeight: "800", marginTop: 4 },
  eligibility: { color: colors.textSecondary, fontSize: 11, marginTop: 4, lineHeight: 16 },
  joinBtn: { backgroundColor: colors.gold, paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.pill },
  joinBtnTxt: { color: "#0A0B10", fontWeight: "900", letterSpacing: 1.2, fontSize: 11 },

  approvedPill: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  tierRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 12, borderTopWidth: 1, borderTopColor: colors.divider },
  tierRank: { fontSize: 18 },
  tierGap: { flex: 1, color: colors.textPrimary, fontSize: 13, fontWeight: "700" },
  tierValue: { color: colors.gold, fontSize: 14, fontWeight: "900" },

  missionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "800", flex: 1 },
  missionDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  pointsPill: { backgroundColor: "rgba(227,163,54,0.14)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pointsTxt: { color: colors.gold, fontSize: 11, fontWeight: "800" },
  question: { color: colors.textPrimary, fontSize: 13, fontWeight: "700", marginTop: 4 },
  optionBtn: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.glassBorder,
  },
  optionActive: { borderColor: colors.gold, backgroundColor: "rgba(227,163,54,0.10)" },
  optionCorrect: { borderColor: "#8AE58F", backgroundColor: "rgba(46,125,50,0.18)" },
  optionWrong: { borderColor: "#FCA5A5", backgroundColor: "rgba(211,47,47,0.18)" },
  optionTxt: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },
  submitBtn: { marginTop: 8, alignSelf: "flex-start", backgroundColor: colors.gold, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.pill },
  submitTxt: { color: "#0A0B10", fontWeight: "900", letterSpacing: 1.2, fontSize: 11 },
  missionStatus: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginTop: spacing.sm },
  tinyNote: { color: colors.textTertiary, fontSize: 10, marginTop: spacing.sm },

  lockDesc: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.sm, lineHeight: 18 },

  footerDisclaimer: { color: colors.textTertiary, fontSize: 11, textAlign: "center", marginTop: spacing.md, lineHeight: 16 },
});
