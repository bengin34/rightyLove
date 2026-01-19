/**
 * WidgetCardShell
 *
 * The common card wrapper for widget previews in the picker.
 * Features:
 * - Dark brown/purple panel with soft rounded corners
 * - Two zones separated by a thin divider
 * - Top zone: widget preview content
 * - Bottom zone: action row with "Add" or "Unlock" + chevron
 * - Lock icon for premium widgets
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';

// Optional: Use expo-linear-gradient if available for better visuals
let LinearGradient: any = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // expo-linear-gradient not installed, will use fallback
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Card takes most of screen width for vertical layout, with some padding
const CARD_WIDTH = SCREEN_WIDTH - 40; // 20px padding on each side
const CARD_HEIGHT = CARD_WIDTH * 0.75; // Shorter aspect ratio for vertical scroll

interface WidgetCardShellProps {
  children: React.ReactNode;
  isLocked: boolean;
  onPress: () => void;
}

export default function WidgetCardShell({
  children,
  isLocked,
  onPress,
}: WidgetCardShellProps) {
  const { t } = useTranslation();

  const cardContent = (
    <>
      {/* Lock icon for premium widgets */}
      {isLocked && (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={14} color="#F5A9B8" />
        </View>
      )}

      {/* Top zone: Widget preview */}
      <View style={styles.previewZone}>{children}</View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom zone: Action row */}
      <View style={styles.actionZone}>
        <Text style={styles.actionText}>
          {isLocked ? t('Unlock') : t('Add')}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#F5A9B8"
        />
      </View>
    </>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardContainer}
    >
      {LinearGradient ? (
        <LinearGradient
          colors={['#2D2438', '#1E1A26']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.card}
        >
          {cardContent}
        </LinearGradient>
      ) : (
        <View style={[styles.card, styles.cardFallback]}>
          {cardContent}
        </View>
      )}
    </TouchableOpacity>
  );
}

export const WIDGET_CARD_WIDTH = CARD_WIDTH;
export const WIDGET_CARD_HEIGHT = CARD_HEIGHT;

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  lockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 169, 184, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  previewZone: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(245, 169, 184, 0.15)',
    marginHorizontal: 20,
  },
  actionZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5A9B8',
    letterSpacing: 0.3,
  },
  cardFallback: {
    backgroundColor: '#241E2E',
  },
});
