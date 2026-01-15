import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[`${size}Size`], style]}>
      {leftIcon}
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
        {children}
      </Text>
      {rightIcon}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
  },

  // Variants
  primary: {
    backgroundColor: '#FFF0F3',
  },
  secondary: {
    backgroundColor: '#EDE9FE',
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  danger: {
    backgroundColor: '#FEE2E2',
  },
  neutral: {
    backgroundColor: '#F3F4F6',
  },

  // Sizes
  smSize: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mdSize: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  // Text
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FF6B9D',
  },
  secondaryText: {
    color: '#8B5CF6',
  },
  successText: {
    color: '#10B981',
  },
  warningText: {
    color: '#F59E0B',
  },
  dangerText: {
    color: '#EF4444',
  },
  neutralText: {
    color: '#6B7280',
  },

  // Text sizes
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 14,
  },
});
