import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/stores/authStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

type RelationshipType = 'dating' | 'married' | 'long-distance';
type Duration = '<1' | '1-3' | '3-5' | '5+';

export default function RelationshipInfoScreen() {
  const { t, language } = useTranslation();
  const { setRelationshipType: saveRelationshipType, setDuration: saveDuration, setRelationshipStartDate } = useAuthStore();
  const [relationshipType, setRelationshipType] = useState<RelationshipType | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const relationshipOptions: { value: RelationshipType; label: string; emoji: string }[] = [
    { value: 'dating', label: t('Dating'), emoji: '💕' },
    { value: 'married', label: t('Married'), emoji: '💍' },
    { value: 'long-distance', label: t('Long Distance'), emoji: '✈️' },
  ];

  const durationOptions: { value: Duration; label: string }[] = [
    { value: '<1', label: t('Less than 1 year') },
    { value: '1-3', label: t('1-3 years') },
    { value: '3-5', label: t('3-5 years') },
    { value: '5+', label: t('5+ years') },
  ];

  const handleContinue = () => {
    if (!relationshipType) return;
    // Save to store
    saveRelationshipType(relationshipType);
    if (duration) saveDuration(duration);
    if (startDate) setRelationshipStartDate(startDate);
    router.push('/(onboarding)/notification-time');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('Tell us about your relationship')}</Text>
          <Text style={styles.subtitle}>{t('This helps us personalize your daily questions')}</Text>

          <Text style={styles.sectionTitle}>{t('Relationship Type')}</Text>
          <View style={styles.optionsRow}>
            {relationshipOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  relationshipType === option.value && styles.optionCardSelected,
                ]}
                onPress={() => setRelationshipType(option.value)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    relationshipType === option.value && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('When did your relationship start?')}</Text>
          <Text style={styles.sectionSubtitle}>{t('We\'ll remind you before your anniversary')}</Text>

          <TouchableOpacity
            style={[styles.datePickerButton, startDate && styles.datePickerButtonSelected]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={startDate ? '#FF6B9D' : '#9CA3AF'}
            />
            <Text style={[styles.datePickerText, startDate && styles.datePickerTextSelected]}>
              {startDate ? formatDate(startDate) : t('Select your anniversary date')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={styles.datePicker}
              />
              <TouchableOpacity
                style={styles.dateConfirmButton}
                onPress={() => {
                  if (!startDate) setStartDate(new Date());
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateConfirmText}>{t('Done')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('How long have you been together?')}</Text>
          <View style={styles.durationOptions}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.durationOption,
                  duration === option.value && styles.durationOptionSelected,
                ]}
                onPress={() => setDuration(option.value)}
              >
                <Text
                  style={[
                    styles.durationLabel,
                    duration === option.value && styles.durationLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !relationshipType && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!relationshipType}
        >
          <Text style={styles.continueButtonText}>{t('Continue')}</Text>
        </TouchableOpacity>
        <Text style={styles.skipText}>{t('Date and duration are optional')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF0F3',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionLabelSelected: {
    color: '#FF6B9D',
  },
  durationOptions: {
    gap: 12,
  },
  durationOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  durationOptionSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF0F3',
  },
  durationLabel: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  durationLabelSelected: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  continueButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 8,
  },
  datePickerButtonSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF0F3',
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
  },
  datePickerTextSelected: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  datePicker: {
    height: 180,
  },
  dateConfirmButton: {
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dateConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
});
