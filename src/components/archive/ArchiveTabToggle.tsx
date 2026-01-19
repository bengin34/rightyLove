import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '@/i18n';
import type { ArchiveTabMode } from '@/types';

interface ArchiveTabToggleProps {
  tab: ArchiveTabMode;
  onTabChange: (tab: ArchiveTabMode) => void;
}

export function ArchiveTabToggle({ tab, onTabChange }: ArchiveTabToggleProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, tab === 'loveStats' && styles.activeTab]}
        onPress={() => onTabChange('loveStats')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, tab === 'loveStats' && styles.activeTabText]}>
          {t('Love Stats')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, tab === 'favouriteMoments' && styles.activeTab]}
        onPress={() => onTabChange('favouriteMoments')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, tab === 'favouriteMoments' && styles.activeTabText]}>
          {t('Favourite Moments')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
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
