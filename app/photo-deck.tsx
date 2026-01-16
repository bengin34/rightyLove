import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

import { usePhotoStore } from '@/stores/photoStore';
import {
  pickImagesFromLibrary,
  likePhoto,
} from '@/services/photo';
import {
  sharePhoto,
  copyMessageToClipboard,
  PHOTO_SHARE_TEMPLATES,
} from '@/services/sharing';
import type { Photo } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function PhotoDeckScreen() {
  const insets = useSafeAreaInsets();
  const storePhotos = usePhotoStore((state) => state.photos);
  const todayLikedCount = usePhotoStore((state) => state.todayLikedCount);
  const todaySharedCount = usePhotoStore((state) => state.todaySharedCount);

  const [deckOrder, setDeckOrder] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const leftSwipeMessageOpacity = useSharedValue(0);

  const lastIdsKeyRef = useRef('');

  useEffect(() => {
    const ids = storePhotos.map((photo) => photo.id);
    const idsKey = [...ids].sort().join('|');

    if (idsKey !== lastIdsKeyRef.current) {
      lastIdsKeyRef.current = idsKey;
      const shuffled = [...ids].sort(() => Math.random() - 0.5);
      setDeckOrder(shuffled);
      setCurrentIndex((prev) => Math.min(prev, Math.max(shuffled.length - 1, 0)));
    }
  }, [storePhotos]);

  const deckPhotos = useMemo(() => {
    const photoById = new Map(storePhotos.map((photo) => [photo.id, photo]));
    return deckOrder
      .map((id) => photoById.get(id))
      .filter((photo): photo is Photo => !!photo);
  }, [deckOrder, storePhotos]);

  useEffect(() => {
    if (deckPhotos.length === 0 && currentIndex !== 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= deckPhotos.length && deckPhotos.length > 0) {
      setCurrentIndex(deckPhotos.length - 1);
    }
  }, [deckPhotos.length, currentIndex]);

  const handleAddPhotos = useCallback(async () => {
    setIsLoading(true);
    const result = await pickImagesFromLibrary();
    setIsLoading(false);

    if (!result.success && result.error) {
      Alert.alert('Error', result.error);
    }
  }, []);

  const handleLike = useCallback(() => {
    const photo = deckPhotos[currentIndex];
    if (photo) {
      likePhoto(photo.id);
    }

    // Show heart animation
    setShowHeart(true);
    heartScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 }),
      withTiming(0, { duration: 300 })
    );
    setTimeout(() => setShowHeart(false), 800);

    // Move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      translateX.value = 0;
      translateY.value = 0;
      rotation.value = 0;
    }, 300);
  }, [currentIndex, deckPhotos, heartScale, translateX, translateY, rotation]);

  const handleShareStart = useCallback(() => {
    // Reset card position before showing modal
    translateX.value = 0;
    translateY.value = 0;
    rotation.value = 0;
    setShowShareModal(true);
  }, [translateX, translateY, rotation]);

  const handleShareWithoutMessage = useCallback(async () => {
    const photo = deckPhotos[currentIndex];
    if (!photo) return;

    // Close modal first
    setShowShareModal(false);

    // Wait for modal to fully dismiss, then open share sheet
    setTimeout(async () => {
      const result = await sharePhoto(photo.localUri, photo.id);

      if (!result.success && result.error) {
        Alert.alert('Error', result.error);
        return;
      }

      // Move to next card after sharing
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        translateX.value = 0;
        translateY.value = 0;
        rotation.value = 0;
      }, 300);
    }, 400);
  }, [deckPhotos, currentIndex, translateX, translateY, rotation]);

  const handleShareWithTemplate = useCallback(
    async (templateId: string) => {
      const photo = deckPhotos[currentIndex];
      const template = PHOTO_SHARE_TEMPLATES.find((t) => t.id === templateId);

      if (!photo || !template) return;

      // Copy message to clipboard first
      await copyMessageToClipboard(template.message);

      // Close modal
      setShowShareModal(false);

      // Show copied feedback
      setShowCopiedFeedback(true);

      // Wait for modal to fully dismiss and feedback to show, then open share sheet
      setTimeout(async () => {
        setShowCopiedFeedback(false);

        // Small delay to ensure feedback modal is gone before share sheet opens
        setTimeout(async () => {
          const result = await sharePhoto(photo.localUri, photo.id);

          if (!result.success && result.error) {
            Alert.alert('Error', result.error);
            return;
          }

          // Move to next card after sharing
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            translateX.value = 0;
            translateY.value = 0;
            rotation.value = 0;
          }, 300);
        }, 100);
      }, 800);
    },
    [currentIndex, deckPhotos, translateX, translateY, rotation]
  );

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotation.value = withSpring(0);
  }, [translateX, translateY, rotation]);

  const shakeCard = useCallback(() => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    rotation.value = withSequence(
      withTiming(-2, { duration: 50 }),
      withTiming(2, { duration: 50 }),
      withTiming(-2, { duration: 50 }),
      withTiming(2, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    leftSwipeMessageOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(1, { duration: 1500 }),
      withTiming(0, { duration: 300 })
    );
  }, [translateX, rotation, leftSwipeMessageOpacity]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow right and up swipes
      if (event.translationX < 0) {
        // Left swipe - bounce back with resistance
        translateX.value = event.translationX * 0.2;
      } else {
        translateX.value = event.translationX;
      }

      if (event.translationY < 0) {
        translateY.value = event.translationY;
      } else {
        translateY.value = event.translationY * 0.2;
      }

      rotation.value = event.translationX * 0.05;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Right swipe - Like
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handleLike)();
      } else if (event.translationY < -SWIPE_THRESHOLD) {
        // Up swipe - Share
        translateY.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        runOnJS(handleShareStart)();
      } else if (event.translationX < -30) {
        // Left swipe attempt - show cute message inside card
        runOnJS(shakeCard)();
      } else {
        // Bounce back
        runOnJS(resetPosition)();
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]),
  }));

  const shareOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, -SWIPE_THRESHOLD], [0, 1]),
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value > 0 ? 1 : 0,
  }));

  const leftSwipeMessageStyle = useAnimatedStyle(() => ({
    opacity: leftSwipeMessageOpacity.value,
    transform: [{ scale: interpolate(leftSwipeMessageOpacity.value, [0, 1], [0.8, 1]) }],
  }));

  const isDeckEmpty = currentIndex >= deckPhotos.length;
  const hasNoPhotos = storePhotos.length === 0;

  return (
    <View style={styles.container}>
      {/* Header with safe area */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <View style={styles.headerButtonInner}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Deck</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleAddPhotos}
          disabled={isLoading}
        >
          <View style={[styles.headerButtonInner, styles.addButtonInner]}>
            <Ionicons name="add" size={24} color="#FF6B9D" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={16} color="#FF6B9D" />
          <Text style={styles.statText}>{todayLikedCount} liked today</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="share-social" size={16} color="#8B5CF6" />
          <Text style={styles.statText}>{todaySharedCount} shared today</Text>
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {hasNoPhotos ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={styles.emptyTitle}>No photos yet</Text>
            <Text style={styles.emptyText}>
              Add photos from your gallery to start building your "Us" album
            </Text>
            <TouchableOpacity
              style={styles.addPhotosButton}
              onPress={handleAddPhotos}
              disabled={isLoading}
            >
              <Ionicons name="images" size={24} color="#FFFFFF" />
              <Text style={styles.addPhotosText}>
                {isLoading ? 'Adding...' : 'Add Photos'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : isDeckEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>
              You've swiped through all your photos today. Come back tomorrow for
              more memories!
            </Text>
            <TouchableOpacity
              style={styles.addPhotosButton}
              onPress={handleAddPhotos}
              disabled={isLoading}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addPhotosText}>
                {isLoading ? 'Adding...' : 'Add More Photos'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Background cards - show up to 3 stacked behind */}
            {deckPhotos
              .slice(currentIndex + 1, currentIndex + 4)
              .reverse()
              .map((photo, reversedIndex) => {
                const index = Math.min(2, deckPhotos.length - currentIndex - 2 - reversedIndex);
                return (
                  <View
                    key={photo.id}
                    style={[
                      styles.card,
                      styles.backgroundCard,
                      {
                        zIndex: -index - 1,
                        transform: [
                          { scale: 0.92 - index * 0.04 },
                          { translateY: 12 + index * 14 },
                        ],
                        opacity: 0.9 - index * 0.15,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: photo.localUri }}
                      style={styles.cardImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                );
              })}

            {/* Remaining photos indicator */}
            {deckPhotos.length - currentIndex > 1 && (
              <View style={styles.remainingIndicator}>
                <Text style={styles.remainingText}>
                  +{deckPhotos.length - currentIndex - 1} more
                </Text>
              </View>
            )}

            {/* Top card (swipeable) */}
            <GestureDetector gesture={gesture}>
              <Animated.View style={[styles.card, cardStyle]}>
                <Image
                  source={{ uri: deckPhotos[currentIndex].localUri }}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={200}
                />

                {/* Like overlay */}
                <Animated.View
                  style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}
                >
                  <Ionicons name="heart" size={80} color="#FFFFFF" />
                  <Text style={styles.overlayText}>LIKE</Text>
                </Animated.View>

                {/* Share overlay */}
                <Animated.View
                  style={[styles.overlay, styles.shareOverlay, shareOverlayStyle]}
                >
                  <Ionicons name="share-social" size={80} color="#FFFFFF" />
                  <Text style={styles.overlayText}>SHARE</Text>
                </Animated.View>

                {/* Left swipe cute message (inside card) */}
                <Animated.View
                  style={[styles.overlay, styles.leftSwipeOverlay, leftSwipeMessageStyle]}
                >
                  <Text style={styles.leftSwipeEmoji}>💕</Text>
                  <Text style={styles.leftSwipeTitle}>Only love here</Text>
                  <Text style={styles.leftSwipeText}>
                    In this app, you only have the right to love
                  </Text>
                </Animated.View>
              </Animated.View>
            </GestureDetector>

            {/* Heart animation */}
            {showHeart && (
              <Animated.View style={[styles.heartAnimation, heartAnimStyle]}>
                <Ionicons name="heart" size={120} color="#FF6B9D" />
              </Animated.View>
            )}
          </>
        )}
      </View>

      {/* Instructions */}
      {!hasNoPhotos && !isDeckEmpty && (
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Ionicons name="arrow-forward" size={20} color="#FF6B9D" />
            <Text style={styles.instructionText}>Swipe right to like</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="arrow-up" size={20} color="#8B5CF6" />
            <Text style={styles.instructionText}>Swipe up to share</Text>
          </View>
        </View>
      )}

      {/* Counter */}
      {!hasNoPhotos && !isDeckEmpty && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {deckPhotos.length}
          </Text>
        </View>
      )}

      {/* Share Template Modal */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowShareModal(false);
          resetPosition();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share with a message</Text>
            <Text style={styles.modalSubtitle}>
              Tap to copy message, then paste it in WhatsApp
            </Text>

            {PHOTO_SHARE_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateButton}
                onPress={() => handleShareWithTemplate(template.id)}
              >
                <View style={styles.templateContent}>
                  <View style={styles.templateTextContainer}>
                    <Text style={styles.templateLabel}>{template.label}</Text>
                    <Text style={styles.templateMessage}>{template.message}</Text>
                  </View>
                  <View style={styles.copyIcon}>
                    <Ionicons name="copy-outline" size={20} color="#8B5CF6" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.shareWithoutMessageButton}
              onPress={handleShareWithoutMessage}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text style={styles.shareWithoutMessageText}>Share without message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowShareModal(false);
                resetPosition();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Copied Feedback Overlay (not a Modal to avoid blocking share sheet) */}
      {showCopiedFeedback && (
        <View style={styles.copiedOverlay} pointerEvents="none">
          <View style={styles.copiedContent}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.copiedText}>Message copied!</Text>
            <Text style={styles.copiedSubtext}>Paste it in WhatsApp</Text>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonInner: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  backgroundCard: {
    // zIndex is set dynamically per card
  },
  remainingIndicator: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeOverlay: {
    backgroundColor: 'rgba(255, 107, 157, 0.7)',
  },
  shareOverlay: {
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  heartAnimation: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftSwipeOverlay: {
    backgroundColor: 'rgba(255, 107, 157, 0.9)',
    padding: 24,
  },
  leftSwipeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  leftSwipeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  leftSwipeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addPhotosText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  counter: {
    alignItems: 'center',
    paddingBottom: 24,
    marginTop: 8,
  },
  counterText: {
    fontSize: 14,
    color: '#9CA3AF',
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
  shareWithoutMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 8,
  },
  shareWithoutMessageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  templateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateTextContainer: {
    flex: 1,
  },
  copyIcon: {
    marginLeft: 12,
    padding: 4,
  },
  copiedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  copiedContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  copiedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  copiedSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});
