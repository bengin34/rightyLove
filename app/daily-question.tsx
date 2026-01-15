import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Share, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type QuestionStatus = 'not_answered' | 'waiting' | 'unlocked' | 'missed';

export default function DailyQuestionScreen() {
  // TODO: Get from store/server
  const [status, setStatus] = useState<QuestionStatus>('not_answered');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = "What's one small thing your partner does that always makes you smile?";
  const myAnswer = "When you make me coffee in the morning without me asking. It shows you're thinking of me.";
  const partnerAnswer = "The way you always hold my hand when we walk together, even after all this time.";
  const maxLength = 280;

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;
    setIsSubmitting(true);
    // TODO: Submit to server
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus('waiting');
    }, 1000);
  };

  const handleNudge = async () => {
    try {
      await Share.share({
        message: `Hey! 💕 I answered today's question on RightyLove. Your turn to unlock our answers!`,
      });
    } catch (error) {
      console.error('Error sending nudge:', error);
    }
  };

  const handleShareHighlight = async () => {
    try {
      await Share.share({
        message: `Today's RightyLove question:\n"${question}"\n\nOur answers 💕\n\nMe: "${myAnswer}"\n\nPartner: "${partnerAnswer}"`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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

        <View style={styles.content}>
          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionIcon}>
              <Ionicons name="chatbubbles" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.questionText}>{question}</Text>
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
                maxLength={maxLength}
              />
              <View style={styles.inputFooter}>
                <Text style={styles.charCount}>
                  {answer.length}/{maxLength}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.submitButton, !answer.trim() && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!answer.trim() || isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.disclaimer}>
                Your answer can't be edited after submission
              </Text>
            </View>
          )}

          {/* State B: Waiting for Partner */}
          {status === 'waiting' && (
            <View style={styles.waitingSection}>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.statusText}>You answered</Text>
              </View>

              <View style={styles.myAnswerPreview}>
                <Text style={styles.myAnswerLabel}>Your answer:</Text>
                <Text style={styles.myAnswerText}>{myAnswer}</Text>
              </View>

              <View style={styles.waitingInfo}>
                <View style={styles.waitingIcon}>
                  <Ionicons name="hourglass" size={48} color="#F59E0B" />
                </View>
                <Text style={styles.waitingTitle}>Waiting for your partner</Text>
                <Text style={styles.waitingText}>
                  Once they answer, both responses will be revealed!
                </Text>
              </View>

              <TouchableOpacity style={styles.nudgeButton} onPress={handleNudge}>
                <Ionicons name="notifications" size={20} color="#8B5CF6" />
                <Text style={styles.nudgeButtonText}>Send a Nudge</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* State C: Unlocked */}
          {status === 'unlocked' && (
            <View style={styles.unlockedSection}>
              <View style={styles.unlockedBadge}>
                <Ionicons name="lock-open" size={24} color="#10B981" />
                <Text style={styles.unlockedBadgeText}>Unlocked!</Text>
              </View>

              <View style={styles.answersContainer}>
                <View style={styles.answerCard}>
                  <Text style={styles.answerCardLabel}>Your answer</Text>
                  <Text style={styles.answerCardText}>{myAnswer}</Text>
                </View>

                <View style={styles.answerDivider}>
                  <View style={styles.dividerLine} />
                  <Ionicons name="heart" size={24} color="#FF6B9D" />
                  <View style={styles.dividerLine} />
                </View>

                <View style={[styles.answerCard, styles.partnerAnswerCard]}>
                  <Text style={styles.answerCardLabel}>Partner's answer</Text>
                  <Text style={styles.answerCardText}>{partnerAnswer}</Text>
                </View>
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
                <Ionicons name="sad" size={64} color="#9CA3AF" />
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
        </View>
      </KeyboardAvoidingView>
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
    flex: 1,
    paddingHorizontal: 20,
  },
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
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
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
  missedSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
});
