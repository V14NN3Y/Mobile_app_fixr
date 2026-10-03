/**
 * Case CGU — design/Signup.dc.html. Segments « conditions d'utilisation » / « politique de
 * confidentialité » en gras, PAS de vrais liens dans la maquette (aucune page CGU/
 * confidentialité prévue à ce lot) : texte stylé, pas de navigation.
 *
 * Checkbox et le texte sont deux Pressable FRÈRES (pas l'un dans l'autre) : imbriquer un
 * Pressable dans un autre casse le bascule sur web — le clic sur la case interne remonte
 * par bulle jusqu'au conteneur externe, qui rebascule aussitôt en sens inverse (net : rien
 * ne change visuellement). Constaté en testant un rendu web réel — la case ne se cochait
 * jamais malgré un clic accepté par Playwright.
 */
import { Pressable, View } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';

export type TermsCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
  testID?: string;
};

export function TermsCheckbox({ checked, onChange, error = false, testID }: TermsCheckboxProps) {
  const t = fr.auth.signup;
  const fullLabel = `${t.termsPrefix}${t.termsConditions}${t.termsAnd}${t.termsPrivacy}${t.termsSuffix}`;
  const toggle = () => onChange(!checked);

  return (
    <View className="flex-row items-start gap-3">
      <View className="pt-0.5">
        <Checkbox
          checked={checked}
          onChange={onChange}
          error={error}
          accessibilityLabel={fullLabel}
          testID={testID}
        />
      </View>
      <Pressable onPress={toggle} className="flex-1" accessible={false}>
        <Text variant="body" tone="secondary" className="font-body-semibold">
          {t.termsPrefix}
          <Text variant="body" className="font-body-extrabold text-primary">
            {t.termsConditions}
          </Text>
          {t.termsAnd}
          <Text variant="body" className="font-body-extrabold text-primary">
            {t.termsPrivacy}
          </Text>
          {t.termsSuffix}
        </Text>
      </Pressable>
    </View>
  );
}
