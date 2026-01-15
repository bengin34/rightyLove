import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Share } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Photo = {
  id: string;
  uri: string;
  createdAt: Date;
};

// Placeholder photos for demo
const DEMO_PHOTOS: Photo[] = [
  { id: '1', uri: 'https://picsum.photos/seed/1/400/600', createdAt: new Date() },
  { id: '2', uri: 'https://picsum.photos/seed/2/400/600', createdAt: new Date() },
  { id: '3', uri: 'https://picsum.photos/seed/3/400/600', createdAt: new Date() },
  { id: '4', uri: 'https://picsum.photos/seed/4/400/600', createdAt: new Date() },
  { id: '5', uri: 'https://picsum.photos/seed/5/400/600', createdAt: new Date() },
];

export default function PhotoDeckScreen() {
  const [photos, setPhotos] = useState(DEMO_PHOTOS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const handleLike = useCallback(() => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
    // TODO: Log like event
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleShare = useCallback(async () => {
    const photo = photos[currentIndex];
    try {
      await Share.share({
        message: `Check out this memory! 💕\n\nFrom our RightyLove album`,
        // url: photo.uri, // iOS only
      });
      // TODO: Log share event
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [currentIndex, photos]);

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotation.value = withSpring(0);
  }, [translateX, translateY, rotation]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow right and up swipes
      if (event.translationX < 0) {
        // Left swipe - bounce back
        translateX.value = event.translationX * 0.3;
      } else {
        translateX.value = event.translationX;
      }
      translateY.value = event.translationY < 0 ? event.translationY : event.translationY * 0.3;
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
        runOnJS(handleShare)();
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

  const isDeckEmpty = currentIndex >= photos.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Deck</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={28} color="#FF6B9D" />
        </TouchableOpacity>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {isDeckEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>
              You've swiped through all your photos today
            </Text>
            <TouchableOpacity style={styles.addPhotosButton}>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addPhotosText}>Add More Photos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Background cards */}
            {photos.slice(currentIndex + 1, currentIndex + 3).reverse().map((photo, index) => (
              <View
                key={photo.id}
                style={[
                  styles.card,
                  styles.backgroundCard,
                  { transform: [{ scale: 0.95 - index * 0.05 }, { translateY: 10 + index * 10 }] },
                ]}
              >
                <Image source={{ uri: photo.uri }} style={styles.cardImage} />
              </View>
            ))}

            {/* Top card (swipeable) */}
            <GestureDetector gesture={gesture}>
              <Animated.View style={[styles.card, cardStyle]}>
                <Image source={{ uri: photos[currentIndex].uri }} style={styles.cardImage} />

                {/* Like overlay */}
                <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
                  <Ionicons name="heart" size={80} color="#FF6B9D" />
                </Animated.View>

                {/* Share overlay */}
                <Animated.View style={[styles.overlay, styles.shareOverlay, shareOverlayStyle]}>
                  <Ionicons name="share-social" size={80} color="#8B5CF6" />
                </Animated.View>
              </Animated.View>
            </GestureDetector>

            {/* Heart animation */}
            {showHeart && (
              <View style={styles.heartAnimation}>
                <Ionicons name="heart" size={100} color="#FF6B9D" />
              </View>
            )}
          </>
        )}
      </View>

      {/* Instructions */}
      {!isDeckEmpty && (
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
      {!isDeckEmpty && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {photos.length}
          </Text>
        </View>
      )}
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
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
    zIndex: -1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    backgroundColor: 'rgba(255, 107, 157, 0.3)',
  },
  shareOverlay: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  heartAnimation: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  counterText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
