import { useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from '@/i18n';
import type { ArchiveItem, TimelineItem } from '@/types';
import { TimelineDateBadge } from './TimelineDateBadge';
import { MomentImageCard } from './MomentImageCard';
import { MomentPillCard } from './MomentPillCard';
import { toTimelineItems, MOCK_ARCHIVE_ITEMS } from './toTimelineItems';

interface ArchiveTimelineViewProps {
  items?: ArchiveItem[];
  onItemPress?: (item: TimelineItem) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ArchiveTimelineView({ items, onItemPress }: ArchiveTimelineViewProps) {
  const { t } = useTranslation();

  // Use provided items or fall back to mock data for development
  const archiveItems = items ?? MOCK_ARCHIVE_ITEMS;

  // Convert to timeline items
  const timelineItems = useMemo(() => toTimelineItems(archiveItems), [archiveItems]);

  const handleItemPress = useCallback(
    (item: TimelineItem) => {
      onItemPress?.(item);
    },
    [onItemPress]
  );

  const renderItem = useCallback(
    ({ item }: { item: TimelineItem }) => (
      <View style={styles.row}>
        <TimelineDateBadge date={item.date} />
        <View style={styles.cardContainer}>
          {item.kind === 'image' && item.imageUrl ? (
            <MomentImageCard
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              commentCount={item.commentCount}
              mediaCount={item.mediaCount}
              onPress={() => handleItemPress(item)}
            />
          ) : (
            <MomentPillCard
              emoji={item.emoji}
              title={item.title}
              relativeLabel={item.relativeLabel}
              onPress={() => handleItemPress(item)}
            />
          )}
        </View>
      </View>
    ),
    [handleItemPress]
  );

  const keyExtractor = useCallback((item: TimelineItem) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>{t('Save Your')}</Text>
        <Text style={styles.headerTitle}>{t('Favourite Moments')}</Text>
      </View>
    ),
    [t]
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📸</Text>
        <Text style={styles.emptyText}>{t('No moments yet')}</Text>
        <Text style={styles.emptySubtext}>
          {t('Your special memories will appear here')}
        </Text>
      </View>
    ),
    [t]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={timelineItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0D',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    minHeight: SCREEN_HEIGHT - 200,
  },
  header: {
    paddingVertical: 24,
    paddingLeft: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  cardContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});
