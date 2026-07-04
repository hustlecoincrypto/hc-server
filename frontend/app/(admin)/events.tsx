import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { StatusPill } from "@/src/components/StatusPill";

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [teamHome, setTeamHome] = useState("");
  const [teamAway, setTeamAway] = useState("");
  const [rarity, setRarity] = useState<"COMMON" | "RARE" | "EPIC" | "LEGENDARY">("COMMON");
  const [pool, setPool] = useState("5000");

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.events();
      setEvents(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!title) return;
    await api.createEvent({
      title,
      subtitle: "Custom event",
      team_home: teamHome || undefined,
      team_away: teamAway || undefined,
      rarity,
      requested_pool: parseInt(pool || "0", 10),
    });
    setTitle(""); setTeamHome(""); setTeamAway(""); setPool("5000");
    setShowCreate(false);
    load();
  };

  const setStatus = async (id: string, status: string) => {
    await api.updateEvent(id, { status });
    load();
  };

  const updateScore = async (id: string, side: "home" | "away", delta: number, current: number) => {
    await api.updateEvent(id, {
      [side === "home" ? "score_home" : "score_away"]: Math.max(0, current + delta),
    });
    load();
  };

  const updateMinute = async (id: string, delta: number, current: number) => {
    await api.updateEvent(id, { minute: Math.max(0, Math.min(120, current + delta)) });
    load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="admin-events-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>ADMIN · EVENT CONTROL</Text>
            <Text style={styles.h1}>Matchday Events</Text>
          </View>
          <TouchableOpacity
            testID="switch-to-player-button"
            onPress={() => router.replace("/(player)/home")}
            style={styles.switchBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={14} color={colors.gold} />
            <Text style={styles.switchTxt}>PLAYER VIEW</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        <TouchableOpacity
          testID="toggle-create-event"
          onPress={() => setShowCreate((s) => !s)}
          style={styles.createToggle}
          activeOpacity={0.85}
        >
          <Ionicons name={showCreate ? "close" : "add"} size={16} color={colors.gold} />
          <Text style={styles.createToggleTxt}>{showCreate ? "Cancel" : "Create new event"}</Text>
        </TouchableOpacity>

        {showCreate && (
          <View style={styles.createBox} testID="create-event-form">
            <Text style={styles.label}>Title</Text>
            <TextInput
              testID="event-title-input"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Sunday Derby Hustle"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Home team</Text>
                <TextInput
                  testID="event-home-input"
                  value={teamHome}
                  onChangeText={setTeamHome}
                  placeholder="optional"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Away team</Text>
                <TextInput
                  testID="event-away-input"
                  value={teamAway}
                  onChangeText={setTeamAway}
                  placeholder="optional"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.label}>Rarity</Text>
            <View style={styles.rarityRow}>
              {(["COMMON", "RARE", "EPIC", "LEGENDARY"] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  testID={`rarity-${r.toLowerCase()}`}
                  onPress={() => setRarity(r)}
                  style={[styles.rarityChip, rarity === r && styles.rarityChipActive]}
                >
                  <Text style={[styles.rarityTxt, rarity === r && styles.rarityTxtActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Requested Game HC pool</Text>
            <TextInput
              testID="event-pool-input"
              value={pool}
              onChangeText={setPool}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity
              testID="event-create-button"
              onPress={handleCreate}
              style={styles.createBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.createBtnTxt}>CREATE (DRAFT)</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && !events.length && <ActivityIndicator color={colors.gold} />}

        {events.map((e) => (
          <View key={e.id} testID={`admin-event-row-${e.id}`} style={styles.eventCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.evTitle}>{e.title}</Text>
                <Text style={styles.evSub}>{e.subtitle} · {e.rarity} · {e.region}</Text>
              </View>
              <StatusPill status={e.status} />
            </View>

            {e.match && (
              <View style={styles.controlGrid}>
                <ScoreControl
                  label={e.match.team_home}
                  score={e.match.score_home}
                  onDec={() => updateScore(e.id, "home", -1, e.match.score_home)}
                  onInc={() => updateScore(e.id, "home", 1, e.match.score_home)}
                />
                <ScoreControl
                  label={e.match.team_away}
                  score={e.match.score_away}
                  onDec={() => updateScore(e.id, "away", -1, e.match.score_away)}
                  onInc={() => updateScore(e.id, "away", 1, e.match.score_away)}
                />
              </View>
            )}

            {e.match && (
              <View style={styles.minuteRow}>
                <Text style={styles.minLabel}>Minute:</Text>
                <TouchableOpacity
                  testID={`event-${e.id}-minute-dec`}
                  onPress={() => updateMinute(e.id, -1, e.match.minute)}
                  style={styles.miniBtn}
                >
                  <Text style={styles.miniBtnTxt}>−</Text>
                </TouchableOpacity>
                <Text style={styles.minValue}>{e.match.minute}&apos;</Text>
                <TouchableOpacity
                  testID={`event-${e.id}-minute-inc`}
                  onPress={() => updateMinute(e.id, 1, e.match.minute)}
                  style={styles.miniBtn}
                >
                  <Text style={styles.miniBtnTxt}>+</Text>
                </TouchableOpacity>
                <Text style={styles.phaseTxt}>{e.match.phase}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              {["DRAFT", "PUBLISHED", "LIVE", "REWARDS_REVIEW", "COMPLETED", "RETIRED"].map((s) => (
                <TouchableOpacity
                  key={s}
                  testID={`event-${e.id}-set-${s}`}
                  onPress={() => setStatus(e.id, s)}
                  style={[styles.actionBtn, e.status === s && styles.actionBtnActive]}
                >
                  <Text style={[styles.actionTxt, e.status === s && styles.actionTxtActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaTxt}>Requested {e.requested_pool.toLocaleString()} HC</Text>
              <Text style={[styles.metaTxt, { color: colors.gold }]}>
                Approved {e.approved_pool.toLocaleString()} HC
              </Text>
              <Text style={styles.metaTxt}>{e.joined_users} joined</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const ScoreControl: React.FC<{ label: string; score: number; onDec: () => void; onInc: () => void }> = ({
  label,
  score,
  onDec,
  onInc,
}) => (
  <View style={styles.scoreBox}>
    <Text style={styles.scoreTeam}>{label}</Text>
    <View style={styles.scoreControls}>
      <TouchableOpacity onPress={onDec} style={styles.miniBtn}>
        <Text style={styles.miniBtnTxt}>−</Text>
      </TouchableOpacity>
      <Text style={styles.scoreBig}>{score}</Text>
      <TouchableOpacity onPress={onInc} style={styles.miniBtn}>
        <Text style={styles.miniBtnTxt}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: "900", marginTop: 2 },
  switchBtn: {
    flexDirection: "row", gap: 4, alignItems: "center",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill,
    backgroundColor: "rgba(227,163,54,0.14)", borderWidth: 1, borderColor: "rgba(227,163,54,0.35)",
  },
  switchTxt: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },

  createToggle: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    padding: spacing.sm, borderRadius: radius.md,
    backgroundColor: "rgba(227,163,54,0.10)", borderWidth: 1, borderColor: "rgba(227,163,54,0.35)",
  },
  createToggleTxt: { color: colors.gold, fontWeight: "800", fontSize: 12 },

  createBox: { backgroundColor: colors.bgSurface, borderRadius: radius.md, padding: spacing.md, gap: 8, borderWidth: 1, borderColor: colors.glassBorder },
  label: { color: colors.textSecondary, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginTop: 4 },
  input: {
    backgroundColor: colors.bgSurfaceAlt, color: colors.textPrimary, borderRadius: radius.sm,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, borderWidth: 1, borderColor: colors.glassBorder,
  },
  rarityRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  rarityChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.bgSurfaceAlt, borderWidth: 1, borderColor: colors.glassBorder },
  rarityChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  rarityTxt: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  rarityTxtActive: { color: "#0A0B10" },
  createBtn: { backgroundColor: colors.gold, alignSelf: "flex-start", paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill, marginTop: 8 },
  createBtnTxt: { color: "#0A0B10", fontWeight: "900", fontSize: 11, letterSpacing: 1 },

  eventCard: { backgroundColor: colors.bgSurface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, gap: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  evTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
  evSub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },

  controlGrid: { flexDirection: "row", gap: 8 },
  scoreBox: { flex: 1, padding: 10, borderRadius: radius.sm, backgroundColor: "rgba(0,0,0,0.25)", borderWidth: 1, borderColor: colors.glassBorder, alignItems: "center" },
  scoreTeam: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  scoreControls: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  scoreBig: { color: colors.gold, fontSize: 22, fontWeight: "900", minWidth: 24, textAlign: "center" },
  miniBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgSurfaceAlt, borderWidth: 1, borderColor: colors.glassBorder },
  miniBtnTxt: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },

  minuteRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  minLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  minValue: { color: colors.textPrimary, fontSize: 14, fontWeight: "800", minWidth: 40, textAlign: "center" },
  phaseTxt: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", marginLeft: 6, letterSpacing: 0.8 },

  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.bgSurfaceAlt, borderWidth: 1, borderColor: colors.glassBorder },
  actionBtnActive: { backgroundColor: "rgba(227,163,54,0.14)", borderColor: colors.gold },
  actionTxt: { color: colors.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  actionTxtActive: { color: colors.gold },

  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  metaTxt: { color: colors.textTertiary, fontSize: 10, fontWeight: "700" },
});
