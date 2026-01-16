import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBucketStore } from '@/stores/bucketStore';
import { useActivityStore } from '@/stores/activityStore';
import { openWhatsAppWithMessage } from '@/services/sharing';
import type { BucketCategory, BucketItem } from '@/types';

const CATEGORIES: { key: BucketCategory; label: string; emoji: string }[] = [
  { key: 'places', label: 'Places', emoji: '🌍' },
  { key: 'things', label: 'Things to Try', emoji: '✨' },
  { key: 'movies', label: 'Movies', emoji: '🎬' },
];

export default function BucketListScreen() {
  const [activeCategory, setActiveCategory] = useState<BucketCategory>('places');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const insets = useSafeAreaInsets();

  // Get from store
  const { addItem, toggleComplete, getActiveItems, getCompletedItems } = useBucketStore();
  const { logBucketActivity } = useActivityStore();

  const filteredItems = showCompleted
    ? getCompletedItems(activeCategory)
    : getActiveItems(activeCategory);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    addItem(newItemText.trim(), activeCategory);
    setNewItemText('');
    setIsAddModalVisible(false);
  };

  const handleToggleComplete = useCallback((id: string, wasCompleted: boolean) => {
    toggleComplete(id);
    // Log activity when completing an item (not when uncompleting)
    if (!wasCompleted) {
      logBucketActivity();
    }
  }, [toggleComplete, logBucketActivity]);

  const handleShareItem = useCallback(async (item: BucketItem) => {
    const emoji = CATEGORIES.find(c => c.key === item.category)?.emoji || '';
    const status = item.completedAt ? 'We did it!' : 'On our bucket list';
    const message = `${emoji} ${status}: "${item.text}" 💕`;

    const result = await openWhatsAppWithMessage(message);
    if (!result.success && result.error) {
      Alert.alert('Sharing failed', result.error);
    }
  }, []);

  const renderItem = ({ item }: { item: BucketItem }) => {
    const isCompleted = !!item.completedAt;
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => handleToggleComplete(item.id, isCompleted)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
          {isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <Text style={[styles.itemText, isCompleted && styles.itemTextCompleted]}>
          {item.text}
        </Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => handleShareItem(item)}
        >
          <Ionicons name="share-social-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bucket List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryTab, activeCategory === cat.key && styles.categoryTabActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.categoryLabel,
                activeCategory === cat.key && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterToggle}>
        <TouchableOpacity
          style={[styles.filterButton, !showCompleted && styles.filterButtonActive]}
          onPress={() => setShowCompleted(false)}
        >
          <Text style={[styles.filterText, !showCompleted && styles.filterTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, showCompleted && styles.filterButtonActive]}
          onPress={() => setShowCompleted(true)}
        >
          <Text style={[styles.filterText, showCompleted && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>
              {CATEGORIES.find((c) => c.key === activeCategory)?.emoji}
            </Text>
            <Text style={styles.emptyText}>
              {showCompleted
                ? 'No completed items yet'
                : 'Add your first bucket list item!'}
            </Text>
          </View>
        }
      />

      {/* Add Item Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Bucket List</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalCategoryInfo}>
              <Text style={styles.modalCategoryEmoji}>
                {CATEGORIES.find((c) => c.key === activeCategory)?.emoji}
              </Text>
              <Text style={styles.modalCategoryLabel}>
                {CATEGORIES.find((c) => c.key === activeCategory)?.label}
              </Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="What do you want to do together?"
              placeholderTextColor="#9CA3AF"
              value={newItemText}
              onChangeText={setNewItemText}
              multiline
              autoFocus
            />

            <TouchableOpacity
              style={[styles.modalAddButton, !newItemText.trim() && styles.modalAddButtonDisabled]}
              onPress={handleAddItem}
              disabled={!newItemText.trim()}
            >
              <Text style={styles.modalAddButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#FF6B9D',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  categoryTabActive: {
    backgroundColor: '#FF6B9D',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  filterToggle: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#FFF0F3',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FF6B9D',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  shareButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  modalCategoryEmoji: {
    fontSize: 24,
  },
  modalCategoryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalAddButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalAddButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  modalAddButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
