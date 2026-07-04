import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";
import { StatusPill } from "@/src/components/StatusPill";

export default function AdminSafeLock() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await api.safelock();
      setData(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const recompute = async () => {
    setComputing(true);
    try {
      await api.recomputeSafelock();
      await load();
    } finally {
      setComputing(false);
    }
  };

  if (!data) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="admin-safelock-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>ADMIN · SAFELOCK EVENT GOVERNOR</Text>
            <Text style={styles.h1}>SafeLock Control</Text>
          </View>
          <TouchableOpacity
            testID="safelock-recompute-button"
            onPress={recompute}
            disabled={computing}
            style={styles.recomputeBtn}
            activeOpacity={0.85}
          >
            {computing ? (
              <ActivityIndicator color={colors.gold} size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={14} color={colors.gold} />
                <Text style={styles.recomputeTxt}>RECOMPUTE</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        {/* Fund summary grid */}
        <View style={styles.grid} testID="safelock-fund-grid">
          <FundBox label="Demo Fund Balance" value={`${(data.fund_balance / 1000).toFixed(0)}k HC`} big />
          <FundBox
            label="Weekly Cap Remaining"
            value={`${(data.weekly_cap_remaining / 1000).toFixed(1)}k HC`}
            sub={`of ${(data.weekly_cap_total / 1000).toFixed(0)}k`}
          />
          <FundBox label="Active Events Today" value={String(data.active_today)} />
          <FundBox label="Scheduled This Week" value={String(data.scheduled_this_week)} />
        </View>

        {/* Decisions list */}
        <Text style={styles.sectionHeader}>EVENT DECISIONS</Text>
        {data.decisions.map((d: any) => (
          <View key={d.id} testID={`safelock-decision-${d.event_id}`} style={styles.decCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.decTitle}>{d.event_title}</Text>
                <Text style={styles.decRarity}>{d.rarity}</Text>
              </View>
              <StatusPill status={d.status} />
            </View>

            <View style={styles.poolRow}>
              <View style={styles.poolCol}>
                <Text style={styles.poolLabel}>REQUESTED</Text>
                <Text style={styles.poolVal}>{d.requested_pool.toLocaleString()}</Text>
              </View>
              <View style={styles.arrow}>
                <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
              </View>
              <View style={styles.poolCol}>
                <Text style={styles.poolLabel}>APPROVED</Text>
                <Text style={[styles.poolVal, { color: colors.gold }]}>{d.approved_pool.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <MetaTag label="Activity" value={d.activity_level} />
              <MetaTag label="Risk" value={d.risk_level} tone={d.risk_level === "HIGH" ? "danger" : d.risk_level === "MEDIUM" ? "warn" : "ok"} />
              <MetaTag label="Joined" value={d.joined_users} />
              <MetaTag label="Eligible" value={d.eligible_users_estimate} />
            </View>

            <View style={styles.reason}>
              <Ionicons name="information-circle" size={13} color={colors.textSecondary} />
              <Text style={styles.reasonTxt}>{d.reason}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.footerNote}>
          SafeLock enforces caps, reserve health and abuse thresholds. Admins cannot bypass caps or delete
          audit logs.
        </Text>
      </ScrollView>
    </View>
  );
}

const FundBox: React.FC<{ label: string; value: string; sub?: string; big?: boolean }> = ({ label, value, sub, big }) => (
  <View style={[styles.fundBox, big && styles.fundBoxBig]}>
    <Text style={styles.fundLabel}>{label}</Text>
    <Text style={[styles.fundVal, big && { color: colors.gold }]}>{value}</Text>
    {sub && <Text style={styles.fundSub}>{sub}</Text>}
  </View>
);

const MetaTag: React.FC<{ label: string; value: string | number; tone?: "ok" | "warn" | "danger" }> = ({ label, value, tone }) => (
  <View style={styles.metaTag}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text
      style={[
        styles.metaValue,
        tone === "danger" && { color: "#FCA5A5" },
        tone === "warn" && { color: colors.gold },
        tone === "ok" && { color: "#8AE58F" },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgBase },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: "900", marginTop: 2 },
  recomputeBtn: {
    flexDirection: "row", gap: 6, alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: "rgba(227,163,54,0.14)", borderWidth: 1, borderColor: "rgba(227,163,54,0.35)",
  },
  recomputeTxt: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 1 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  fundBox: {
    flex: 1, minWidth: "45%",
    backgroundColor: colors.bgSurface, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  fundBoxBig: { minWidth: "100%", borderColor: "rgba(227,163,54,0.35)" },
  fundLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  fundVal: { color: colors.textPrimary, fontSize: 20, fontWeight: "900", marginTop: 4 },
  fundSub: { color: colors.textTertiary, fontSize: 10, marginTop: 2 },

  sectionHeader: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginTop: spacing.sm },

  decCard: { backgroundColor: colors.bgSurface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, gap: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  decTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: "800" },
  decRarity: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", marginTop: 2, letterSpacing: 1 },

  poolRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.sm, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: radius.sm, gap: 12 },
  poolCol: { flex: 1, alignItems: "center" },
  arrow: { paddingHorizontal: 4 },
  poolLabel: { color: colors.textTertiary, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  poolVal: { color: colors.textPrimary, fontSize: 15, fontWeight: "900", marginTop: 2 },

  metaRow: { flexDirection: "row", gap: 6 },
  metaTag: { flex: 1, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.bgSurfaceAlt, alignItems: "center" },
  metaLabel: { color: colors.textTertiary, fontSize: 9, fontWeight: "700", letterSpacing: 0.8 },
  metaValue: { color: colors.textPrimary, fontSize: 11, fontWeight: "800", marginTop: 2 },

  reason: { flexDirection: "row", gap: 6, alignItems: "flex-start", padding: 8, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: radius.sm },
  reasonTxt: { flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 16 },

  footerNote: { color: colors.textTertiary, fontSize: 11, textAlign: "center", lineHeight: 16, marginTop: spacing.md },
});
