import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from '@/i18n';
import type { FavouriteMoment } from '@/types';

interface FavouriteMomentsViewProps {
  moments: FavouriteMoment[];
  onAddMoment: (moment: Omit<FavouriteMoment, 'id' | 'createdAt'>) => void;
}

export function FavouriteMomentsView({ moments, onAddMoment }: FavouriteMomentsViewProps) {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSpecialEvent, setIsSpecialEvent] = useState(false);

  const resetForm = () => {
    setPhotoUri(null);
    setDate(new Date());
    setTitle('');
    setDescription('');
    setIsSpecialEvent(false);
  };

  const handleOpenModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    if (!photoUri) {
      Alert.alert(t('Error'), t('Please select a photo'));
      return;
    }
    if (!title.trim()) {
      Alert.alert(t('Error'), t('Please enter a title'));
      return;
    }

    onAddMoment({
      photoUri,
      date,
      title: title.trim(),
      description: description.trim() || undefined,
      isSpecialEvent,
    });

    handleCloseModal();
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Favourite Moments')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Moments List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {moments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>{t('No moments yet')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('Add your first favourite moment to remember forever')}
            </Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={handleOpenModal}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddButtonText}>{t('Add Moment')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          moments.map((moment) => (
            <View
              key={moment.id}
              style={[
                styles.momentCard,
                moment.isSpecialEvent && styles.specialEventCard,
              ]}
            >
              <Image source={{ uri: moment.photoUri }} style={styles.momentImage} />
              <View style={styles.momentContent}>
                {moment.isSpecialEvent && (
                  <View style={styles.specialBadge}>
                    <Ionicons name="heart" size={12} color="#FFFFFF" />
                    <Text style={styles.specialBadgeText}>{t('Special Moment')}</Text>
                  </View>
                )}
                <Text style={styles.momentTitle}>{moment.title}</Text>
                {moment.description && (
                  <Text style={styles.momentDescription}>{moment.description}</Text>
                )}
                <Text style={styles.momentDate}>{formatDate(moment.date)}</Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Add Moment Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={styles.cancelText}>{t('Cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('Add Moment')}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>{t('Save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Photo Picker */}
            <TouchableOpacity style={styles.photoPicker} onPress={handlePickImage}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.selectedPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={40} color="#9CA3AF" />
                  <Text style={styles.photoPlaceholderText}>{t('Tap to add photo')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Date Picker */}
            <Text style={styles.label}>{t('Date')}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Title */}
            <Text style={styles.label}>{t('Title')}</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={t('e.g., Our first trip together')}
              placeholderTextColor="#9CA3AF"
              maxLength={100}
            />

            {/* Description */}
            <Text style={styles.label}>{t('Description (optional)')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('Tell the story of this moment...')}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            {/* Special Event Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="heart" size={24} color="#FF6B9D" />
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleLabel}>{t('Special Moment')}</Text>
                  <Text style={styles.toggleDescription}>
                    {t("Mark this as a milestone (e.g., We said 'I love you')")}
                  </Text>
                </View>
              </View>
              <Switch
                value={isSpecialEvent}
                onValueChange={setIsSpecialEvent}
                trackColor={{ false: '#E5E7EB', true: '#FFB6C1' }}
                thumbColor={isSpecialEvent ? '#FF6B9D' : '#FFFFFF'}
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  momentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  specialEventCard: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  momentImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  momentContent: {
    padding: 16,
  },
  specialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  specialBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  momentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  momentDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  momentDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  photoPicker: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  selectedPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF5F7',
    padding: 16,
    borderRadius: 12,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
