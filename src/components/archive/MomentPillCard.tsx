import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MomentPillCardProps {
  emoji?: string;
  title: string;
  relativeLabel?: string;
  onPress?: () => void;
}

export function MomentPillCard({
  emoji,
  title,
  relativeLabel,
  onPress,
}: MomentPillCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {relativeLabel && (
        <Text style={styles.relativeLabel}>{relativeLabel}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)', // Purple tint with low opacity
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 10,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  relativeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF6B9D', // Pink accent
  },
});
