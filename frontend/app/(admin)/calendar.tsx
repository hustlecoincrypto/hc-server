import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { StatusPill } from "@/src/components/StatusPill";

const STATUS_FLOW = ["DRAFT", "APPROVED", "PUBLISHED", "LIVE", "COMPLETED", "REWARDS_REVIEW", "RETIRED"];

function formatCountdown(seconds: number) {
  if (seconds <= 0) return "now";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AdminCalendar() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.calendar();
      setSlots(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const advance = async (slot: any) => {
    const i = STATUS_FLOW.indexOf(slot.status);
    const next = STATUS_FLOW[Math.min(STATUS_FLOW.length - 1, i + 1)];
    await api.updateCalendar(slot.id, next);
    load();
  };

  const grouped: Record<string, any[]> = {
    DAILY: slots.filter((s) => s.slot_type === "DAILY"),
    MATCHDAY: slots.filter((s) => s.slot_type === "MATCHDAY"),
    WEEKLY: slots.filter((s) => s.slot_type === "WEEKLY"),
    SPECIAL: slots.filter((s) => s.slot_type === "SPECIAL"),
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="admin-calendar-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ADMIN · GAME CALENDAR CONTROL</Text>
          <Text style={styles.h1}>Calendar & Schedule</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        {loading && !slots.length && <ActivityIndicator color={colors.gold} />}

        {Object.entries(grouped).map(([group, list]) =>
          list.length === 0 ? null : (
            <View key={group} style={{ gap: spacing.sm }}>
              <Text style={styles.groupLabel}>{group} SLOTS</Text>
              {list.map((s) => (
                <View key={s.id} testID={`calendar-slot-${s.id}`} style={styles.slotCard}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.slotTitle}>{s.title_pt}</Text>
                      <View style={styles.countdownRow}>
                        <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.countdownTxt}>starts in {formatCountdown(s.countdown_seconds)}</Text>
                      </View>
                    </View>
                    <StatusPill status={s.status} />
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.slotMeta}>{s.slot_type}</Text>
                    <TouchableOpacity
                      testID={`slot-${s.id}-advance`}
                      onPress={() => advance(s)}
                      style={styles.advanceBtn}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.advanceTxt}>ADVANCE →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: "900", marginTop: 2 },

  groupLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 2 },

  slotCard: { backgroundColor: colors.bgSurface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, gap: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  slotTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: "800" },
  countdownRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  countdownTxt: { color: colors.textSecondary, fontSize: 11 },
  slotMeta: { color: colors.textTertiary, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  advanceBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: "rgba(227,163,54,0.14)", borderWidth: 1, borderColor: "rgba(227,163,54,0.35)" },
  advanceTxt: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
});
