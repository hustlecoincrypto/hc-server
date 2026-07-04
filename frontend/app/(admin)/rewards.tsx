import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { StatusPill } from "@/src/components/StatusPill";

export default function AdminRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [safelock, setSafelock] = useState<any>(null);

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

  const act = async (id: string, action: string) => {
    await api.rewardAction(id, action, notes[id]);
    load();
  };

  const liveDec = safelock?.decisions?.find((d: any) => d.event_id === "evt-live-brasil-noruega");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="admin-rewards-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ADMIN · REWARD REVIEW CENTER</Text>
          <Text style={styles.h1}>Reward Review</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        {loading && !rewards.length && <ActivityIndicator color={colors.gold} />}

        {liveDec && (
          <View style={styles.gate} testID="safelock-gate">
            <Ionicons name="shield-checkmark" size={16} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.gateTitle}>SafeLock gate active</Text>
              <Text style={styles.gateSub}>
                Approved pool cap: {liveDec.approved_pool.toLocaleString()} HC · admins cannot exceed this.
              </Text>
            </View>
          </View>
        )}

        {rewards.map((r) => (
          <View key={r.id} testID={`reward-review-${r.id}`} style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{r.winner_display_name}</Text>
                <Text style={styles.evt}>{r.event_title} · Rank {r.rank}º</Text>
              </View>
              <StatusPill status={r.status} />
            </View>

            <View style={styles.rowBetween}>
              <MiniStat label="Points" value={r.points.toLocaleString()} />
              <MiniStat label="Game HC" value={r.game_hc.toLocaleString()} gold />
            </View>

            {r.reason && (
              <Text style={styles.reason}>Note: {r.reason}</Text>
            )}
            {r.audit_note && (
              <Text style={styles.auditNote}>Audit: {r.audit_note}</Text>
            )}

            <TextInput
              testID={`reward-${r.id}-note`}
              value={notes[r.id] || ""}
              onChangeText={(t) => setNotes({ ...notes, [r.id]: t })}
              placeholder="Add audit note (optional)"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
            />

            <View style={styles.actions}>
              <ActionBtn testID={`reward-${r.id}-approve`} label="APPROVE" tone="ok" onPress={() => act(r.id, "APPROVE")} />
              <ActionBtn testID={`reward-${r.id}-reduce`} label="REDUCE" tone="warn" onPress={() => act(r.id, "REDUCE")} />
              <ActionBtn testID={`reward-${r.id}-freeze`} label="FREEZE" tone="info" onPress={() => act(r.id, "FREEZE")} />
              <ActionBtn testID={`reward-${r.id}-block`} label="BLOCK" tone="danger" onPress={() => act(r.id, "BLOCK")} />
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          Admins cannot bypass SafeLock or delete audit logs. All actions are recorded.
        </Text>
      </ScrollView>
    </View>
  );
}

const MiniStat: React.FC<{ label: string; value: string; gold?: boolean }> = ({ label, value, gold }) => (
  <View>
    <Text style={styles.miniLabel}>{label}</Text>
    <Text style={[styles.miniVal, gold && { color: colors.gold }]}>{value}</Text>
  </View>
);

const ActionBtn: React.FC<{ label: string; tone: "ok" | "warn" | "info" | "danger"; onPress: () => void; testID: string }> = ({
  label,
  tone,
  onPress,
  testID,
}) => {
  const toneStyle =
    tone === "ok"
      ? { bg: "rgba(46,125,50,0.18)", border: "#8AE58F", fg: "#8AE58F" }
      : tone === "warn"
      ? { bg: "rgba(227,163,54,0.14)", border: colors.gold, fg: colors.gold }
      : tone === "info"
      ? { bg: "rgba(59,130,246,0.18)", border: "#93C5FD", fg: "#93C5FD" }
      : { bg: "rgba(211,47,47,0.18)", border: "#FCA5A5", fg: "#FCA5A5" };
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      style={[styles.actionBtn, { backgroundColor: toneStyle.bg, borderColor: toneStyle.border }]}
      activeOpacity={0.85}
    >
      <Text style={[styles.actionTxt, { color: toneStyle.fg }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: "900", marginTop: 2 },

  gate: {
    flexDirection: "row", gap: 10, padding: spacing.md, alignItems: "center",
    backgroundColor: "rgba(227,163,54,0.10)", borderRadius: radius.md,
    borderWidth: 1, borderColor: "rgba(227,163,54,0.35)",
  },
  gateTitle: { color: colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  gateSub: { color: colors.textSecondary, fontSize: 11, marginTop: 2, lineHeight: 16 },

  card: { backgroundColor: colors.bgSurface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, gap: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.textPrimary, fontSize: 14, fontWeight: "800" },
  evt: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },

  miniLabel: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  miniVal: { color: colors.textPrimary, fontSize: 16, fontWeight: "800", marginTop: 2 },
  reason: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  auditNote: { color: colors.gold, fontSize: 11, fontStyle: "italic" },
  input: {
    backgroundColor: colors.bgSurfaceAlt, color: colors.textPrimary, borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, borderWidth: 1, borderColor: colors.glassBorder,
  },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1, alignItems: "center" },
  actionTxt: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  footer: { color: colors.textTertiary, fontSize: 11, textAlign: "center", marginTop: spacing.md, lineHeight: 16 },
});
