/**
 * Réponses rapides défilantes (design/Chat.dc.html, « .qr ») — réutilise Chip variant="filter"
 * (fond primary-soft très proche du blanc de la maquette, bordure/texte primary déjà exacts),
 * pas de nouveau composant de puce pour une variante visuellement quasi identique.
 */
import { ScrollView } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { fr } from '@/lib/i18n/fr';

export type QuickRepliesProps = {
  replies: readonly string[];
  onPick: (reply: string) => void;
  disabled?: boolean;
};

export function QuickReplies({ replies, onPick, disabled }: QuickRepliesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={fr.messages.chat.quickRepliesLabel}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      {replies.map((reply) => (
        <Chip key={reply} variant="filter" onPress={() => onPick(reply)} disabled={disabled}>
          {reply}
        </Chip>
      ))}
    </ScrollView>
  );
}
