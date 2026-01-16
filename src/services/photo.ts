import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { usePhotoStore } from '@/stores/photoStore';
import { useActivityStore } from '@/stores/activityStore';
import type { Photo } from '@/types';

// Get photos directory instance
function getPhotosDirectory(): Directory {
  return new Directory(Paths.document, 'photos');
}

// Ensure photos directory exists
function ensurePhotosDir(): void {
  const photosDir = getPhotosDirectory();
  if (!photosDir.exists) {
    photosDir.create();
  }
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Request camera permissions
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

// Request media library permissions
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    console.log('[requestMediaLibraryPermission] Calling requestMediaLibraryPermissionsAsync...');
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('[requestMediaLibraryPermission] Result:', JSON.stringify(result));
    return result.status === 'granted';
  } catch (err) {
    console.error('[requestMediaLibraryPermission] Error:', err);
    throw err;
  }
}

// Pick multiple images from library
export async function pickImagesFromLibrary(): Promise<{
  success: boolean;
  photos?: Photo[];
  error?: string;
}> {
  console.log('[pickImagesFromLibrary] Starting...');
  try {
    console.log('[pickImagesFromLibrary] Requesting permission...');
    const hasPermission = await requestMediaLibraryPermission();
    console.log('[pickImagesFromLibrary] Permission result:', hasPermission);
    if (!hasPermission) {
      return { success: false, error: 'Permission to access media library was denied' };
    }

    console.log('[pickImagesFromLibrary] Launching image picker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 0, // 0 means unlimited selection
    });
    console.log('[pickImagesFromLibrary] Picker result:', result.canceled, result.assets?.length);

    if (result.canceled || !result.assets?.length) {
      return { success: false, error: 'No images selected' };
    }

    console.log('[pickImagesFromLibrary] Ensuring photos directory...');
    ensurePhotosDir();

    const photos: Photo[] = [];

    const photosDir = getPhotosDirectory();
    console.log('[pickImagesFromLibrary] Photos dir URI:', photosDir.uri);

    for (const asset of result.assets) {
      console.log('[pickImagesFromLibrary] Processing asset:', asset.uri);
      const id = generateId();
      const fileExtension = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${id}.${fileExtension}`;

      // Copy image to app's document directory for persistence
      const sourceFile = new File(asset.uri);
      const destFile = new File(photosDir, fileName);
      console.log('[pickImagesFromLibrary] Copying from', sourceFile.uri, 'to', destFile.uri);
      sourceFile.copy(destFile);
      console.log('[pickImagesFromLibrary] Copy complete');

      const photo: Photo = {
        id,
        localUri: destFile.uri,
        createdAt: new Date(),
      };

      photos.push(photo);
    }

    // Add photos to store
    console.log('[pickImagesFromLibrary] Adding', photos.length, 'photos to store');
    usePhotoStore.getState().addPhotos(photos);

    console.log('[pickImagesFromLibrary] Success!');
    return { success: true, photos };
  } catch (err) {
    console.error('[pickImagesFromLibrary] Error:', err);
    return { success: false, error: 'Failed to pick images' };
  }
}

// Take a photo with camera
export async function takePhoto(): Promise<{
  success: boolean;
  photo?: Photo;
  error?: string;
}> {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return { success: false, error: 'Permission to access camera was denied' };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return { success: false, error: 'No photo taken' };
    }

    ensurePhotosDir();

    const photosDir = getPhotosDirectory();
    const asset = result.assets[0];
    const id = generateId();
    const fileExtension = asset.uri.split('.').pop() || 'jpg';
    const fileName = `${id}.${fileExtension}`;

    // Copy image to app's document directory for persistence
    const sourceFile = new File(asset.uri);
    const destFile = new File(photosDir, fileName);
    sourceFile.copy(destFile);

    const photo: Photo = {
      id,
      localUri: destFile.uri,
      createdAt: new Date(),
    };

    // Add photo to store
    usePhotoStore.getState().addPhoto(photo);

    return { success: true, photo };
  } catch (err) {
    console.error('Error taking photo:', err);
    return { success: false, error: 'Failed to take photo' };
  }
}

// Delete a photo from storage and store
export async function deletePhoto(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const photos = usePhotoStore.getState().photos;
    const photo = photos.find((p) => p.id === id);

    if (!photo) {
      return { success: false, error: 'Photo not found' };
    }

    // Delete file from storage
    const file = new File(photo.localUri);
    if (file.exists) {
      file.delete();
    }

    // Remove from store
    usePhotoStore.getState().removePhoto(id);

    return { success: true };
  } catch (err) {
    console.error('Error deleting photo:', err);
    return { success: false, error: 'Failed to delete photo' };
  }
}

// Like a photo (swipe right)
export function likePhoto(id: string): void {
  usePhotoStore.getState().likePhoto(id);
  useActivityStore.getState().logPhotoActivity();
}

// Share photo and mark as shared
export function markPhotoAsShared(id: string): void {
  usePhotoStore.getState().sharePhoto(id);
}

// Get photos for deck display (shuffled for daily variety)
export function getDeckPhotos(): Photo[] {
  const photos = usePhotoStore.getState().photos;

  // Shuffle photos for variety
  const shuffled = [...photos].sort(() => Math.random() - 0.5);

  return shuffled;
}

// Get photo count
export function getPhotoCount(): number {
  return usePhotoStore.getState().photos.length;
}

// Check if user has photos
export function hasPhotos(): boolean {
  return usePhotoStore.getState().photos.length > 0;
}
