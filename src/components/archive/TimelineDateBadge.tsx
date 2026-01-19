import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '@/i18n';

interface TimelineDateBadgeProps {
  date: Date;
}

const MONTH_ABBR: Record<string, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  tr: ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  it: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
  fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
};

export function TimelineDateBadge({ date }: TimelineDateBadgeProps) {
  const { language } = useTranslation();

  const monthIndex = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();

  const monthAbbr = MONTH_ABBR[language]?.[monthIndex] ?? MONTH_ABBR.en[monthIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.month}>{monthAbbr}</Text>
      <Text style={styles.day}>{day}</Text>
      <Text style={styles.year}>{year}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  day: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  year: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
