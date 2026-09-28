/**
 * Écran de développement — catalogue de src/components/ui/ dans tous leurs états.
 * À comparer section par section avec design/Components.dc.html, en clair et en sombre
 * (interrupteur en en-tête). Route provisoire, retirée à la fin du Lot 1.
 */
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, ICON_NAMES } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Radio } from '@/components/ui/Radio';
import { RatingDisplay, RatingInput } from '@/components/ui/RatingInput';
import { Segmented } from '@/components/ui/Segmented';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stepper } from '@/components/ui/Stepper';
import { Switch } from '@/components/ui/Switch';
import { Tabs } from '@/components/ui/Tabs';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import type { BookingStatus } from '@/types/domain';
import { useTheme, type ThemePreference } from '@/theme/useTheme';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View className="gap-3 rounded-2xl border border-border-subtle bg-surface p-5">
      <View className="flex-row items-baseline justify-between gap-2">
        <Text variant="title3">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="tertiary" className="font-mono">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap items-center gap-2.5">{children}</View>;
}

function Label({ children }: { children: string }) {
  return (
    <Text variant="micro" tone="tertiary" className="w-full">
      {children}
    </Text>
  );
}

const ALL_STATUSES: BookingStatus[] = [
  'pending',
  'quotes',
  'confirmed',
  'on_the_way',
  'on_site',
  'in_progress',
  'done',
  'cancelled',
];

export default function Catalogue() {
  const insets = useSafeAreaInsets();
  const { preference, setPreference } = useTheme();
  const { show } = useToast();

  const [chipSelected, setChipSelected] = useState(true);
  const [segmentedValue, setSegmentedValue] = useState<'list' | 'map'>('list');
  const [tabsValue, setTabsValue] = useState<'upcoming' | 'ongoing' | 'done' | 'cancelled'>('upcoming');
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [radioValue, setRadioValue] = useState<'relevance' | 'top_rated'>('relevance');
  const [rating, setRating] = useState(4);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
          gap: 16,
        }}
      >
        <View className="gap-3">
          <Text variant="display">Catalogue</Text>
          <Text variant="body" tone="secondary">
            src/components/ui/ — comparer avec design/Components.dc.html.
          </Text>
          <Segmented<ThemePreference>
            value={preference}
            onChange={setPreference}
            options={[
              { value: 'light', label: 'Clair' },
              { value: 'dark', label: 'Sombre' },
              { value: 'system', label: 'Système' },
            ]}
          />
        </View>

        <Section title="Texte" subtitle="<Text variant />">
          <Text variant="display">Trouvez un artisan fiable</Text>
          <Text variant="title1">De quoi avez-vous besoin ?</Text>
          <Text variant="title2">L'artisan est en route</Text>
          <Text variant="title3">Recommandés pour vous</Text>
          <Text variant="bodyLg">Comparez les notes, les avis et les disponibilités.</Text>
          <Text variant="body">Plombier depuis 2017, je travaille surtout à Fidjrossè.</Text>
          <Text variant="label">Numéro de téléphone</Text>
          <Text variant="caption" tone="secondary">
            Plombier · Fidjrossè · 1,2 km
          </Text>
          <Text variant="micro" tone="tertiary">
            EN ROUTE · FX-24817
          </Text>
        </Section>

        <Section title="Icônes" subtitle="<Icon name size color />">
          <Row>
            {ICON_NAMES.map((name) => (
              <View key={name} className="w-16 items-center gap-1">
                <View className="h-14 w-14 items-center justify-center rounded-xl border border-border-subtle bg-surface">
                  <Icon name={name} color="#12161F" />
                </View>
                <Text variant="micro" tone="tertiary" numberOfLines={1} className="normal-case">
                  {name}
                </Text>
              </View>
            ))}
          </Row>
        </Section>

        <Section title="Boutons" subtitle="<Button variant size loading disabled />">
          <Label>Primaire — presser pour voir l'état pressé</Label>
          <Row>
            <Button variant="primary" onPress={() => show('Confirmé')}>
              Confirmer
            </Button>
            <Button variant="primary" loading>
              Confirmer
            </Button>
            <Button variant="primary" disabled>
              Confirmer
            </Button>
          </Row>
          <Label>Secondaire</Label>
          <Row>
            <Button variant="secondary" onPress={() => {}}>
              Se connecter
            </Button>
            <Button variant="secondary" loading>
              Chargement
            </Button>
            <Button variant="secondary" disabled>
              Se connecter
            </Button>
          </Row>
          <Label>Tertiaire</Label>
          <Row>
            <Button variant="tertiary" onPress={() => {}}>
              Voir le profil
            </Button>
            <Button variant="tertiary" loading>
              Voir le profil
            </Button>
            <Button variant="tertiary" disabled>
              Voir le profil
            </Button>
          </Row>
          <Label>Destructif</Label>
          <Row>
            <Button variant="destructive" onPress={() => setConfirmVisible(true)}>
              Annuler la réservation
            </Button>
            <Button variant="destructive" loading>
              Annulation…
            </Button>
            <Button variant="destructive" disabled>
              Annuler
            </Button>
          </Row>
          <Label>Tailles (52 / 44 / 40) et icône seule</Label>
          <Row>
            <Button variant="primary" size="lg" onPress={() => {}}>
              Taille 52
            </Button>
            <Button variant="primary" size="md" onPress={() => {}}>
              Taille 44
            </Button>
            <Button variant="primary" size="sm" onPress={() => {}}>
              Taille 40
            </Button>
            <Button variant="secondary" icon="message" iconOnly accessibilityLabel="Message" onPress={() => {}} />
          </Row>
        </Section>

        <Section title="Champs" subtitle="<TextField label hint error icon disabled />">
          <TextField label="Défaut" placeholder="Ex. Fuite sous l'évier" />
          <TextField label="Avec icône et aide" icon="mail" placeholder="nom@exemple.com" hint="Nous ne partageons jamais votre e-mail." />
          <TextField label="Erreur" defaultValue="aurore@gmail" error="Adresse incomplète — ex. nom@gmail.com" />
          <TextField label="Désactivé" defaultValue="+229 01 97 45 12 36" disabled />
        </Section>

        <Section title="Puces, filtres, onglets" subtitle="<Chip /> <Segmented /> <Tabs />">
          <Row>
            <Chip variant="selected">Tout</Chip>
            <Chip>Service</Chip>
            <Chip variant="filter" removable onRemove={() => setChipSelected(false)}>
              Aujourd'hui
            </Chip>
            <Chip icon="star" iconColor="#E0A21B">
              4+
            </Chip>
            {!chipSelected ? null : (
              <Text variant="caption" tone="tertiary">
                (chip retirée : {String(!chipSelected)})
              </Text>
            )}
          </Row>
          <Segmented
            value={segmentedValue}
            onChange={setSegmentedValue}
            options={[
              { value: 'list', label: 'Liste' },
              { value: 'map', label: 'Carte' },
            ]}
          />
          <Tabs
            value={tabsValue}
            onChange={setTabsValue}
            options={[
              { value: 'upcoming', label: 'À venir' },
              { value: 'ongoing', label: 'En cours' },
              { value: 'done', label: 'Terminées' },
              { value: 'cancelled', label: 'Annulées' },
            ]}
          />
        </Section>

        <Section title="Sélection" subtitle="<Switch /> <Checkbox /> <Radio />">
          <Row>
            <Switch value={switchOn} onValueChange={setSwitchOn} accessibilityLabel="Interrupteur" />
            <Switch value={false} onValueChange={() => {}} disabled accessibilityLabel="Interrupteur désactivé" />
          </Row>
          <Row>
            <Checkbox checked={checked} onChange={setChecked} accessibilityLabel="Case à cocher" />
            <Checkbox checked={false} onChange={() => {}} accessibilityLabel="Case décochée" />
            <Checkbox checked disabled onChange={() => {}} accessibilityLabel="Case désactivée" />
          </Row>
          <Row>
            <Radio selected={radioValue === 'relevance'} onSelect={() => setRadioValue('relevance')} accessibilityLabel="Pertinence" />
            <Radio selected={radioValue === 'top_rated'} onSelect={() => setRadioValue('top_rated')} accessibilityLabel="Mieux notés" />
          </Row>
        </Section>

        <Section title="Badges & avatars" subtitle="<Badge /> <Avatar />">
          <Label>Statuts</Label>
          <Row>
            {ALL_STATUSES.map((status) => (
              <Badge key={status} mode="status" status={status} />
            ))}
          </Row>
          <Label>Niveaux de vérification</Label>
          <Row>
            <Badge mode="verification" level="identity" />
            <Badge mode="verification" level="pro" />
          </Row>
          <Label>Tailles, pastille en ligne, pile</Label>
          <Row>
            <Avatar initials="KA" size={72} />
            <Avatar initials="MS" size={52} online />
            <Avatar initials="CA" size={40} />
            <AvatarStack items={[{ initials: 'FA' }, { initials: 'YH' }, { initials: 'RB' }, { initials: 'PL' }]} max={3} />
          </Row>
        </Section>

        <Section title="Carte artisan (Card)" subtitle="<Card elevation />">
          <Card>
            <View className="flex-row gap-3">
              <Avatar initials="KA" size={56} />
              <View className="flex-1 gap-0.5">
                <View className="flex-row justify-between">
                  <Text variant="label">Koffi Agbodjan</Text>
                  <Text variant="label">★ 4,9</Text>
                </View>
                <Text variant="caption" tone="secondary">
                  Plombier · 9 ans
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-1.5">
              <Badge mode="status" status="confirmed" />
            </View>
          </Card>
          <Row>
            <Card elevation="e1" className="w-24 items-center justify-center">
              <Text variant="micro" tone="tertiary" className="normal-case">
                elev-1
              </Text>
            </Card>
            <Card elevation="e2" className="w-24 items-center justify-center">
              <Text variant="micro" tone="tertiary" className="normal-case">
                elev-2
              </Text>
            </Card>
            <Card elevation="e3" className="w-24 items-center justify-center">
              <Text variant="micro" tone="tertiary" className="normal-case">
                elev-3
              </Text>
            </Card>
          </Row>
        </Section>

        <Section title="Skeletons & état vide" subtitle="<Skeleton /> <EmptyState />">
          <Card>
            <View className="flex-row gap-3">
              <Skeleton width={52} height={52} rounded={999} />
              <View className="flex-1 justify-center gap-2">
                <Skeleton width="70%" height={14} />
                <Skeleton width="45%" height={12} />
              </View>
            </View>
            <Skeleton height={40} rounded={12} />
          </Card>
          <EmptyState
            icon="calendar"
            title="Aucune réservation à venir"
            description="Décrivez votre besoin, on s'occupe du reste."
            action={{ label: 'Décrire mon besoin', onPress: () => {} }}
          />
        </Section>

        <Section title="Bandeaux" subtitle="<Banner tone />">
          <Banner tone="info">Les artisans répondent en 25 min en moyenne.</Banner>
          <Banner tone="warning">En attente de votre validation (48 h)</Banner>
          <Banner tone="error">Impossible d'envoyer la photo. Réessayez.</Banner>
          <Banner tone="offline">Hors connexion · affichage des données enregistrées</Banner>
        </Section>

        <Section title="Toasts, dialogue, panneau" subtitle="useToast() · <ConfirmDialog /> · <Sheet />">
          <Row>
            <Button variant="secondary" size="md" onPress={() => show('Adresse enregistrée')}>
              Toast simple
            </Button>
            <Button
              variant="secondary"
              size="md"
              onPress={() => show('Adresse enregistrée', { action: { label: 'Annuler', onPress: () => {} } })}
            >
              Toast + action
            </Button>
            <Button variant="secondary" size="md" onPress={() => sheetRef.current?.present()}>
              Ouvrir la sheet
            </Button>
          </Row>
          <ConfirmDialog
            visible={confirmVisible}
            title="Annuler cette réservation ?"
            description="Christelle sera prévenue immédiatement."
            confirmLabel="Oui, annuler"
            cancelLabel="Garder ma réservation"
            destructive
            onConfirm={() => setConfirmVisible(false)}
            onCancel={() => setConfirmVisible(false)}
          />
          <Sheet ref={sheetRef}>
            <Text variant="title3">Trier par</Text>
            <View className="gap-1">
              <View className="flex-row items-center justify-between border-b border-border-subtle py-2.5">
                <Text variant="label">Pertinence</Text>
                <Radio selected={radioValue === 'relevance'} onSelect={() => setRadioValue('relevance')} accessibilityLabel="Pertinence" />
              </View>
              <View className="flex-row items-center justify-between py-2.5">
                <Text variant="label">Mieux notés</Text>
                <Radio selected={radioValue === 'top_rated'} onSelect={() => setRadioValue('top_rated')} accessibilityLabel="Mieux notés" />
              </View>
            </View>
          </Sheet>
        </Section>

        <Section title="Progression" subtitle="<Stepper /> <ProgressBar />">
          <Label>Étapes de demande</Label>
          <Stepper steps={['1 · Besoin', '2 · Adresse', '3 · Date', '4 · Confirmer']} currentIndex={1} />
          <Label>Continue</Label>
          <ProgressBar value={62} />
        </Section>

        <Section title="Notation" subtitle="<RatingInput /> <RatingDisplay />">
          <RatingInput value={rating} onChange={setRating} label={rating >= 4 ? 'Très bien' : 'Correct'} />
          <View className="flex-row items-center justify-between border-t border-border-subtle pt-3">
            <Text variant="label">Ponctualité</Text>
            <RatingDisplay value={5} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text variant="label">Communication</Text>
            <RatingDisplay value={4} />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}
