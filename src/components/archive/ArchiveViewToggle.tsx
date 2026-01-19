import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '@/i18n';
import type { ArchiveViewMode } from '@/types';

interface ArchiveViewToggleProps {
  mode: ArchiveViewMode;
  onModeChange: (mode: ArchiveViewMode) => void;
}

export function ArchiveViewToggle({ mode, onModeChange }: ArchiveViewToggleProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, mode === 'default' && styles.activeTab]}
        onPress={() => onModeChange('default')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, mode === 'default' && styles.activeTabText]}>
          {t('Default')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, mode === 'timeline' && styles.activeTab]}
        onPress={() => onModeChange('timeline')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, mode === 'timeline' && styles.activeTabText]}>
          {t('Timeline')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#1F2937',
    fontWeight: '600',
  },
});
