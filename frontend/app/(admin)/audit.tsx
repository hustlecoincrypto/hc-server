import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { colors, radius, spacing } from "@/src/theme";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminAudit() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.auditLog();
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const flagged = items.filter((i) => i.severity === "HIGH");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }} testID="admin-audit-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ADMIN · ABUSE MONITOR / AUDIT LOG</Text>
          <Text style={styles.h1}>Audit & Abuse</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        {loading && !items.length && <ActivityIndicator color={colors.gold} />}

        <View style={styles.summaryGrid}>
          <SummaryBox label="Total actions" value={items.length} icon="list" />
          <SummaryBox label="Flagged" value={flagged.length} icon="warning" tone="warn" />
          <SummaryBox label="Blocked accts" value={items.filter((i) => i.action === "ACCOUNT_BLOCKED").length} icon="ban" tone="danger" />
        </View>

        <View style={styles.immutableBanner} testID="immutable-banner">
          <Ionicons name="lock-closed" size={14} color={colors.gold} />
          <Text style={styles.immutableTxt}>
            Immutable-style log (prototype). Admins cannot delete entries.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>ACTIVITY STREAM</Text>
        {items.map((it) => (
          <View key={it.id} testID={`audit-item-${it.id}`} style={styles.item}>
            <View style={styles.leftBar}>
              <View
                style={[
                  styles.severityDot,
                  {
                    backgroundColor:
                      it.severity === "HIGH" ? colors.red : it.severity === "WARN" ? colors.gold : colors.blue,
                  },
                ]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.action}>{it.action}</Text>
                <Text style={styles.time}>{timeAgo(it.at_iso)}</Text>
              </View>
              <Text style={styles.detail}>{it.detail}</Text>
              <View style={styles.metaRow}>
                <MetaChip label={it.actor} icon="person" />
                <MetaChip label={it.target} icon="link" />
                <View style={[styles.sevPill, { backgroundColor: it.severity === "HIGH" ? "rgba(211,47,47,0.18)" : it.severity === "WARN" ? "rgba(227,163,54,0.14)" : "rgba(59,130,246,0.18)" }]}>
                  <Text style={[styles.sevTxt, { color: it.severity === "HIGH" ? "#FCA5A5" : it.severity === "WARN" ? colors.gold : "#93C5FD" }]}>
                    {it.severity}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const SummaryBox: React.FC<{ label: string; value: number; icon: any; tone?: "warn" | "danger" }> = ({
  label,
  value,
  icon,
  tone,
}) => (
  <View style={styles.sumBox}>
    <Ionicons name={icon} size={16} color={tone === "danger" ? "#FCA5A5" : tone === "warn" ? colors.gold : colors.textSecondary} />
    <Text style={styles.sumVal}>{value}</Text>
    <Text style={styles.sumLabel}>{label}</Text>
  </View>
);

const MetaChip: React.FC<{ label: string; icon: any }> = ({ label, icon }) => (
  <View style={styles.metaChip}>
    <Ionicons name={icon} size={10} color={colors.textTertiary} />
    <Text style={styles.metaChipTxt}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: "900", marginTop: 2 },

  summaryGrid: { flexDirection: "row", gap: spacing.sm },
  sumBox: { flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.glassBorder, alignItems: "flex-start", gap: 6 },
  sumVal: { color: colors.textPrimary, fontSize: 20, fontWeight: "900" },
  sumLabel: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", letterSpacing: 0.6 },

  immutableBanner: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: spacing.sm,
    backgroundColor: "rgba(227,163,54,0.10)", borderRadius: radius.sm,
    borderWidth: 1, borderColor: "rgba(227,163,54,0.25)",
  },
  immutableTxt: { color: colors.textSecondary, fontSize: 11 },

  sectionHeader: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginTop: 4 },

  item: { flexDirection: "row", gap: 10, padding: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder },
  leftBar: { alignItems: "center", paddingTop: 4 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  action: { color: colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },
  time: { color: colors.textTertiary, fontSize: 10 },
  detail: { color: colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 16 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: spacing.sm, flexWrap: "wrap" },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.bgSurfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.glassBorder },
  metaChipTxt: { color: colors.textSecondary, fontSize: 10 },
  sevPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  sevTxt: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
});
