import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { File } from 'expo-file-system';
import { markPhotoAsShared } from './photo';
import { translate } from '@/i18n';
import { useAppSettingsStore } from '@/stores/appSettingsStore';

// WhatsApp message templates for photo sharing
export const PHOTO_SHARE_TEMPLATES = [
  {
    id: 'thinking',
    labelKey: 'Thinking of you',
    messageKey: 'This photo reminded me of you 💕',
  },
  {
    id: 'remember',
    labelKey: 'Remember this?',
    messageKey: 'Remember this moment? 🥰',
  },
  {
    id: 'love',
    labelKey: 'I love us',
    messageKey: 'I love looking at our photos together ❤️',
  },
];

// WhatsApp message templates for mood sharing
export const MOOD_SHARE_TEMPLATES = {
  '🙂': 'I\'m feeling good today! 🙂',
  '😐': 'Having a so-so day... 😐',
  '😞': 'Feeling a bit down today... 😞',
  '😠': 'Having a frustrating day... 😠',
  '😴': 'Feeling tired today... 😴',
};

// WhatsApp message templates for daily question nudge
export const NUDGE_TEMPLATES = [
  {
    id: 'gentle',
    labelKey: 'Gentle reminder',
    messageKey:
      "Hey! I answered today's question on RightyLove. Can't wait to see yours! 💭",
  },
  {
    id: 'curious',
    labelKey: 'Curious',
    messageKey:
      "I'm so curious what your answer will be! Check out today's question on RightyLove 💕",
  },
  {
    id: 'unlock',
    labelKey: "Let's unlock it",
    messageKey:
      "There's a question waiting for us on RightyLove! Let's both answer to unlock it 🔓",
  },
];

const getLanguage = () => useAppSettingsStore.getState().language;

// Check if WhatsApp is available
export async function isWhatsAppAvailable(): Promise<boolean> {
  try {
    return await Linking.canOpenURL('whatsapp://send');
  } catch {
    return false;
  }
}

// Copy message to clipboard
export async function copyMessageToClipboard(
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await Clipboard.setStringAsync(message);
    return { success: true };
  } catch (err) {
    console.error('[copyMessageToClipboard] Error:', err);
    return { success: false, error: 'Failed to copy message' };
  }
}

// Share photo via system share sheet
export async function sharePhoto(
  photoUri: string,
  photoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[sharePhoto] Starting share for:', photoUri);

    // Check if file exists
    const file = new File(photoUri);
    if (!file.exists) {
      console.error('[sharePhoto] File does not exist:', photoUri);
      return { success: false, error: 'Photo file not found' };
    }

    const isAvailable = await Sharing.isAvailableAsync();
    console.log('[sharePhoto] Sharing available:', isAvailable);
    if (!isAvailable) {
      return { success: false, error: 'Sharing is not available on this device' };
    }

    // Determine mime type from file extension
    const extension = photoUri.split('.').pop()?.toLowerCase();
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
    const uti = extension === 'png' ? 'public.png' : 'public.jpeg';

    console.log('[sharePhoto] Opening share sheet...');
    await Sharing.shareAsync(photoUri, {
      mimeType,
      dialogTitle: translate(getLanguage(), 'Share photo'),
      UTI: uti,
    });
    console.log('[sharePhoto] Share sheet closed');

    // Mark photo as shared
    markPhotoAsShared(photoId);

    return { success: true };
  } catch (err) {
    console.error('[sharePhoto] Error:', err);
    return { success: false, error: 'Failed to share photo' };
  }
}

// Legacy function for backwards compatibility
export async function sharePhotoWithMessage(
  photoUri: string,
  photoId: string,
  _message: string
): Promise<{ success: boolean; error?: string }> {
  return sharePhoto(photoUri, photoId);
}

// Open WhatsApp with pre-filled message
export async function openWhatsAppWithMessage(
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (!canOpen) {
      return { success: false, error: 'WhatsApp is not installed' };
    }

    await Linking.openURL(whatsappUrl);
    return { success: true };
  } catch (err) {
    console.error('Error opening WhatsApp:', err);
    return { success: false, error: 'Failed to open WhatsApp' };
  }
}

// Share mood via WhatsApp
export async function shareMoodViaWhatsApp(
  mood: keyof typeof MOOD_SHARE_TEMPLATES
): Promise<{ success: boolean; error?: string }> {
  const language = getLanguage();
  const message = translate(language, MOOD_SHARE_TEMPLATES[mood]);
  return openWhatsAppWithMessage(message);
}

// Send nudge to partner via WhatsApp
export async function sendNudgeViaWhatsApp(
  templateId: string
): Promise<{ success: boolean; error?: string }> {
  const template = NUDGE_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    return { success: false, error: 'Invalid template' };
  }

  const message = translate(getLanguage(), template.messageKey);
  return openWhatsAppWithMessage(message);
}

// Share daily question answer highlight
export async function shareAnswerHighlight(
  question: string,
  myAnswer: string,
  partnerAnswer?: string
): Promise<{ success: boolean; error?: string }> {
  const language = getLanguage();
  let message = translate(
    language,
    '💕 Today\'s Question on RightyLove:\n\n"{{question}}"\n\nMy answer: "{{myAnswer}}"',
    {
      question,
      myAnswer,
    }
  );

  if (partnerAnswer) {
    message += translate(language, '\n\nTheir answer: "{{partnerAnswer}}"', {
      partnerAnswer,
    });
  }

  message += '\n\n#RightyLove';

  try {
    await Share.share({
      message,
      title: translate(language, 'Share Highlight'),
    });
    return { success: true };
  } catch (err) {
    console.error('Error sharing highlight:', err);
    return { success: false, error: 'Failed to share highlight' };
  }
}

// Share weekly recap
export async function shareWeeklyRecap(
  activeDays: number,
  photosLiked: number,
  questionsUnlocked: number,
  bucketItemsCompleted: number
): Promise<{ success: boolean; error?: string }> {
  const message = translate(
    getLanguage(),
    '📊 Our Week on RightyLove:\n\n✅ Active days: {{activeDays}}/7\n❤️ Photos liked: {{photosLiked}}\n🔓 Questions unlocked: {{questionsUnlocked}}\n🎯 Bucket items completed: {{bucketItemsCompleted}}\n\n#RightyLove #Couple',
    {
      activeDays,
      photosLiked,
      questionsUnlocked,
      bucketItemsCompleted,
    }
  );

  return openWhatsAppWithMessage(message);
}

// Share bucket list completion
export async function shareBucketCompletion(
  itemText: string,
  category: string
): Promise<{ success: boolean; error?: string }> {
  const categoryEmoji = {
    places: '📍',
    things: '✨',
    movies: '🎬',
  }[category] || '🎯';

  const message = translate(
    getLanguage(),
    '{{emoji}} We did it!\n\nJust completed: "{{itemText}}"\n\n#RightyLove #BucketList',
    { emoji: categoryEmoji, itemText }
  );

  return openWhatsAppWithMessage(message);
}
