import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Messages() {
  return (
    <ScreenPlaceholder
      title="19 · Conversations"
      route="(tabs)/messages/index"
      description="Lot 6 — design/Messages.dc.html (recherche, filtre Non lues, badges, en ligne)"
      links={[{ label: 'Chat (Koffi) →', href: '/messages/c_koffi' }]}
    />
  );
}
