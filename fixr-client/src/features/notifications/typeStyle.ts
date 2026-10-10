/**
 * Icône + couleur par type de notification (design/Notifications.dc.html) — résolu via
 * colorClasses, comme Badge mode="status" résout déjà tokens.statusTone. 7 des 8 types
 * illustrés par la maquette correspondent exactement à des tokens existants (vérifié
 * hex-pour-hex) ; `security` a nécessité 2 nouveaux tokens (neutralSoft/neutralInk,
 * src/theme/tokens.ts). `request_accepted` n'a aucune maquette source (9ᵉ membre du type
 * NotificationType, absent des 8 fixtures) : valeur retenue par proximité sémantique avec
 * quote_received, à valider côté design.
 */
import type { IconName } from '@/components/ui/Icon';
import type { ColorToken } from '@/theme/tokens';
import type { NotificationType } from '@/types/domain';

export type NotificationTypeStyle = {
  bgToken: ColorToken;
  inkToken: ColorToken;
  icon: IconName;
  filled?: boolean;
};

export const NOTIFICATION_TYPE_STYLE: Record<NotificationType, NotificationTypeStyle> = {
  on_the_way: { bgToken: 'accentSoft', inkToken: 'accentInk', icon: 'navigation' },
  message: { bgToken: 'primarySoft', inkToken: 'primary', icon: 'message' },
  quote_received: { bgToken: 'successSoft', inkToken: 'successInk', icon: 'check' },
  booking_changed: { bgToken: 'warningSoft', inkToken: 'warning', icon: 'calendar' },
  report_ready: { bgToken: 'primarySoft', inkToken: 'primary', icon: 'document' },
  payment: { bgToken: 'successSoft', inkToken: 'successInk', icon: 'card' },
  review_request: { bgToken: 'warningSoft', inkToken: 'warning', icon: 'star', filled: false },
  security: { bgToken: 'neutralSoft', inkToken: 'neutralInk', icon: 'shieldAlert' },
  request_accepted: { bgToken: 'successSoft', inkToken: 'successInk', icon: 'check' },
};
