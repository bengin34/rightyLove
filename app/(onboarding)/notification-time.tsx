import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getLocale, useTranslation } from '@/i18n';

export default function NotificationTimeScreen() {
  const { t, language } = useTranslation();
  const [time, setTime] = useState(new Date(2024, 0, 1, 9, 0)); // Default 9:00 AM
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const iosPickerProps =
    Platform.OS === 'ios'
      ? { textColor: '#111827', themeVariant: 'light' as const }
      : {};

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(getLocale(language), {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatPresetTime = (hour: number) => {
    const presetDate = new Date(2024, 0, 1, hour, 0);
    return formatTime(presetDate);
  };

  const presetTimes = [
    { label: t('Morning'), hour: 9 },
    { label: t('Afternoon'), hour: 14 },
    { label: t('Evening'), hour: 19 },
  ];

  const handlePresetSelect = (hour: number) => {
    const newTime = new Date(time);
    newTime.setHours(hour, 0, 0, 0);
    setTime(newTime);
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleContinue = () => {
    // TODO: Save notification time to store and schedule notifications
    router.push('/(onboarding)/pair-partner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('When should we remind you?')}</Text>
        <Text style={styles.subtitle}>
          {t("We'll send you a gentle nudge at this time each day")}
        </Text>

        <Text style={styles.sectionTitle}>{t('Quick presets')}</Text>
        <View style={styles.presetsRow}>
          {presetTimes.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.presetCard,
                time.getHours() === preset.hour && styles.presetCardSelected,
              ]}
              onPress={() => handlePresetSelect(preset.hour)}
            >
              <Text style={styles.presetLabel}>{preset.label}</Text>
              <Text
                style={[
                  styles.presetTime,
                  time.getHours() === preset.hour && styles.presetTimeSelected,
                ]}
              >
                {formatPresetTime(preset.hour)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('Or pick a custom time')}</Text>
        <View style={styles.pickerContainer}>
          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={styles.androidTimeButton}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.androidTimeText}>{formatTime(time)}</Text>
            </TouchableOpacity>
          )}
          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              style={styles.picker}
              {...iosPickerProps}
            />
          )}
        </View>

        <View style={styles.selectedTime}>
          <Text style={styles.selectedTimeLabel}>{t('Daily reminder at')}</Text>
          <Text style={styles.selectedTimeValue}>{formatTime(time)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>{t('Continue')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(onboarding)/pair-partner')}>
          <Text style={styles.skipText}>{t('Skip for now')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
    marginBottom: 16,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  presetCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  presetCardSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF0F3',
  },
  presetLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  presetTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  presetTimeSelected: {
    color: '#FF6B9D',
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  picker: {
    width: '100%',
    height: 150,
  },
  androidTimeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  androidTimeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
  },
  selectedTime: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  selectedTimeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedTimeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B9D',
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
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});
