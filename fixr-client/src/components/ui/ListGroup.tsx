/**
 * Groupe de lignes — design/Profile.dc.html + Settings.dc.html (`.grp`/`.gh`) : carte blanche
 * bordée, rayon 20, titre majuscule gris optionnel au-dessus. Les lignes (ListRow) tracent
 * elles-mêmes leur séparateur bas, sauf la dernière.
 */
import type { ReactNode } from 'react';
import { Children } from 'react';
import { View } from 'react-native';

import { Text } from './Text';

export type ListGroupProps = {
  title?: string;
  children: ReactNode;
  testID?: string;
};

export function ListGroup({ title, children, testID }: ListGroupProps) {
  const items = Children.toArray(children);

  return (
    <View testID={testID} className="gap-2">
      {title ? (
        <Text variant="micro" tone="tertiary" className="px-1">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-[20px] border border-border-subtle bg-surface">
        {items.map((child, i) => (
          <View key={i} className={i < items.length - 1 ? 'border-b border-border-subtle' : undefined}>
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}
