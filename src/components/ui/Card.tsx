import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
}

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
  disabled = false,
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`${padding}Padding`],
    disabled && styles.disabled,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  outline: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  disabled: {
    opacity: 0.6,
  },
  nonePadding: {
    padding: 0,
  },
  smPadding: {
    padding: 12,
  },
  mdPadding: {
    padding: 20,
  },
  lgPadding: {
    padding: 24,
  },
});
