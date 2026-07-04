import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { statusColor, colors, radius } from "../theme";

type Props = { status: string; testID?: string; overrideLabel?: string };

export const StatusPill: React.FC<Props> = ({ status, testID, overrideLabel }) => {
  const s = statusColor[status] || { bg: "rgba(255,255,255,0.08)", fg: colors.textSecondary, label: status };
  return (
    <View testID={testID} style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.txt, { color: s.fg }]}>{overrideLabel || s.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  txt: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
});
