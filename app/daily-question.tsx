import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getDailyQuestion, submitAnswer } from '@/services/dailyQuestion';
import {
  shareAnswerHighlight,
  sendNudgeViaWhatsApp,
  NUDGE_TEMPLATES,
} from '@/services/sharing';
import { useCoupleStore } from '@/stores/coupleStore';
import type { DailyResponse, QuestionStatus } from '@/types';

const MAX_LENGTH = 500;

export default function DailyQuestionScreen() {
  const couple = useCoupleStore((state) => state.couple);
  const isPaired = couple?.memberB ? true : false;

  const [isLoading, setIsLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyResponse | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNudgeModal, setShowNudgeModal] = useState(false);

  // Determine status from daily data
  const getStatus = (): QuestionStatus => {
    if (!dailyData) return 'not_answered';
    if (dailyData.isUnlocked) return 'unlocked';
    if (dailyData.myStatus === 'answered') return 'waiting';
    return 'not_answered';
  };

  const status = getStatus();

  // Fetch daily question on mount
  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  const fetchDailyQuestion = async () => {
    setIsLoading(true);
    const result = await getDailyQuestion();
    setIsLoading(false);

    if (result.success && result.data) {
      setDailyData(result.data);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await submitAnswer(answer.trim());
    setIsSubmitting(false);

    if (result.success) {
      // Refresh to get updated state
      fetchDailyQuestion();
    } else {
      Alert.alert('Error', result.error || 'Failed to submit answer');
    }
  }, [answer, isSubmitting]);

  const handleNudge = useCallback(async (templateId: string) => {
    setShowNudgeModal(false);
    const result = await sendNudgeViaWhatsApp(templateId);

    if (!result.success && result.error) {
      Alert.alert('Error', result.error);
    }
  }, []);

  const handleShareHighlight = useCallback(async () => {
    if (!dailyData?.prompt?.question || !dailyData.myAnswer) return;

    const result = await shareAnswerHighlight(
      dailyData.prompt.question.text,
      dailyData.myAnswer.text,
      dailyData.partnerAnswer?.text
    );

    if (!result.success && result.error) {
      Alert.alert('Error', result.error);
    }
  }, [dailyData]);

  // Not paired state
  if (!isPaired) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Question</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.notPairedContainer}>
          <View style={styles.notPairedIcon}>
            <Ionicons name="people" size={64} color="#8B5CF6" />
          </View>
          <Text style={styles.notPairedTitle}>Pair with your partner first</Text>
          <Text style={styles.notPairedText}>
            Daily questions require you to be paired with your partner. Once paired,
            you'll both answer the same question each day and unlock each other's
            answers!
          </Text>
          <TouchableOpacity
            style={styles.pairButton}
            onPress={() => router.replace('/(onboarding)/pair-partner')}
          >
            <Ionicons name="link" size={20} color="#FFFFFF" />
            <Text style={styles.pairButtonText}>Pair Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Question</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading today's question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No question available
  if (!dailyData?.prompt) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Question</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#F59E0B" />
          <Text style={styles.errorTitle}>No question available</Text>
          <Text style={styles.errorText}>
            We couldn't load today's question. Please try again later.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDailyQuestion}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const question = dailyData.prompt.question;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Question</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionIcon}>
              <Ionicons name="chatbubbles" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.questionText}>{question.text}</Text>
            {question.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {question.tags.slice(0, 2).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* State A: Not Answered */}
          {status === 'not_answered' && (
            <View style={styles.answerSection}>
              <TextInput
                style={styles.answerInput}
                placeholder="Share your thoughts..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={answer}
                onChangeText={setAnswer}
                maxLength={MAX_LENGTH}
              />
              <View style={styles.inputFooter}>
                <Text
                  style={[
                    styles.charCount,
                    answer.length > MAX_LENGTH * 0.9 && styles.charCountWarning,
                  ]}
                >
                  {answer.length}/{MAX_LENGTH}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!answer.trim() || isSubmitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!answer.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Answer</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.disclaimer}>
                Your answer can't be edited after submission
              </Text>
            </View>
          )}

          {/* State B: Waiting for Partner */}
          {status === 'waiting' && dailyData.myAnswer && (
            <View style={styles.waitingSection}>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.statusText}>You answered</Text>
              </View>

              <View style={styles.myAnswerPreview}>
                <Text style={styles.myAnswerLabel}>Your answer:</Text>
                <Text style={styles.myAnswerText}>{dailyData.myAnswer.text}</Text>
              </View>

              <View style={styles.waitingInfo}>
                <View style={styles.waitingIcon}>
                  <Ionicons name="hourglass-outline" size={48} color="#F59E0B" />
                </View>
                <Text style={styles.waitingTitle}>Waiting for your partner</Text>
                <Text style={styles.waitingText}>
                  Once they answer, both responses will be revealed!
                </Text>
              </View>

              <TouchableOpacity
                style={styles.nudgeButton}
                onPress={() => setShowNudgeModal(true)}
              >
                <Ionicons name="notifications" size={20} color="#8B5CF6" />
                <Text style={styles.nudgeButtonText}>Send a Nudge</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* State C: Unlocked */}
          {status === 'unlocked' && dailyData.myAnswer && (
            <View style={styles.unlockedSection}>
              <View style={styles.unlockedBadge}>
                <Ionicons name="lock-open" size={24} color="#10B981" />
                <Text style={styles.unlockedBadgeText}>Unlocked!</Text>
              </View>

              <View style={styles.answersContainer}>
                <View style={styles.answerCard}>
                  <Text style={styles.answerCardLabel}>Your answer</Text>
                  <Text style={styles.answerCardText}>{dailyData.myAnswer.text}</Text>
                </View>

                <View style={styles.answerDivider}>
                  <View style={styles.dividerLine} />
                  <Ionicons name="heart" size={24} color="#FF6B9D" />
                  <View style={styles.dividerLine} />
                </View>

                {dailyData.partnerAnswer && (
                  <View style={[styles.answerCard, styles.partnerAnswerCard]}>
                    <Text style={styles.answerCardLabel}>Partner's answer</Text>
                    <Text style={styles.answerCardText}>
                      {dailyData.partnerAnswer.text}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.shareButton} onPress={handleShareHighlight}>
                <Ionicons name="share-social" size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share Highlight</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* State D: Missed */}
          {status === 'missed' && (
            <View style={styles.missedSection}>
              <View style={styles.missedIcon}>
                <Ionicons name="sad-outline" size={64} color="#9CA3AF" />
              </View>
              <Text style={styles.missedTitle}>Not unlocked today</Text>
              <Text style={styles.missedText}>
                One of you didn't answer in time. Try again tomorrow!
              </Text>
              <TouchableOpacity style={styles.okButton} onPress={() => router.back()}>
                <Text style={styles.okButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Nudge Template Modal */}
      <Modal
        visible={showNudgeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNudgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send a nudge</Text>
            <Text style={styles.modalSubtitle}>
              Choose a message to remind your partner
            </Text>

            {NUDGE_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateButton}
                onPress={() => handleNudge(template.id)}
              >
                <Text style={styles.templateLabel}>{template.label}</Text>
                <Text style={styles.templateMessage}>{template.message}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowNudgeModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Not paired state
  notPairedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notPairedIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  notPairedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  notPairedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pairButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  pairButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Question card
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 28,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Answer section (not answered)
  answerSection: {
    flex: 1,
  },
  answerInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  charCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  charCountWarning: {
    color: '#F59E0B',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  // Waiting section
  waitingSection: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  myAnswerPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  myAnswerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  myAnswerText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  waitingInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  waitingIcon: {
    marginBottom: 16,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  nudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  nudgeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  // Unlocked section
  unlockedSection: {
    flex: 1,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    gap: 8,
    marginBottom: 24,
  },
  unlockedBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  answersContainer: {
    marginBottom: 24,
  },
  answerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  partnerAnswerCard: {
    backgroundColor: '#FFF0F3',
  },
  answerCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerCardText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  answerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Missed section
  missedSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  missedIcon: {
    marginBottom: 24,
  },
  missedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  missedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  okButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  templateButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  templateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  templateMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});
