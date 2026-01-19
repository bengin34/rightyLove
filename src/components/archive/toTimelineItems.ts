import type { ArchiveItem, TimelineItem } from '@/types';

/**
 * Calculate relative time label from a date
 */
export function getRelativeLabel(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 14) {
    return '1 week ago';
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} weeks ago`;
  } else if (diffDays < 60) {
    return '1 month ago';
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

/**
 * Convert archive items to timeline items
 * Rules:
 * - Sort by createdAt (desc)
 * - If item has an image -> kind: 'image'
 * - If item is milestone/no image -> kind: 'pill'
 */
export function toTimelineItems(archiveItems: ArchiveItem[]): TimelineItem[] {
  // Sort by date descending
  const sorted = [...archiveItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return sorted.map((item) => {
    const date = new Date(item.createdAt);
    const hasImage = item.type === 'moment' && !!item.imageUrl;

    return {
      id: item.id,
      kind: hasImage ? 'image' : 'pill',
      date,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      emoji: item.emoji,
      commentCount: item.commentCount,
      mediaCount: item.mediaCount,
      relativeLabel: getRelativeLabel(date),
    };
  });
}

/**
 * Sample mock data for development preview
 */
export const MOCK_ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    id: '1',
    type: 'moment',
    title: 'Our first holiday together 🏖️',
    description:
      'Our first holiday together was in beautiful Sardinia. It was the first time spending a full week together.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    createdAt: new Date('2026-01-19'),
    commentCount: 5,
    mediaCount: 3,
  },
  {
    id: '2',
    type: 'milestone',
    title: "We said 'I love you'",
    emoji: '💞',
    createdAt: new Date('2026-01-14'),
  },
  {
    id: '3',
    type: 'moment',
    title: 'Night out 💞',
    description:
      'An amazing evening out in the city. We tried that new restaurant everyone was talking about and danced until late.',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    createdAt: new Date('2025-12-30'),
    commentCount: 24,
    mediaCount: 5,
  },
];
