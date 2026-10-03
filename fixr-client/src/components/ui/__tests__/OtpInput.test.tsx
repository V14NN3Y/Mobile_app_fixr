import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { OtpInput } from '../OtpInput';

// Les 6 cases sont volontairement masquées au lecteur d'écran (importantForAccessibility
//="no-hide-descendants" sur le groupe décoratif) : les requêtes de @testing-library sont
// conscientes de l'accessibilité (RNTL 14) et ne les « voient » donc pas non plus, comme un
// vrai lecteur d'écran. On teste le contrat de callback (onChange/onComplete), pas le texte
// affiché dans les cases.

function Controlled({ onComplete }: { onComplete?: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <OtpInput
      testID="otp"
      value={value}
      onChange={setValue}
      onComplete={onComplete}
      accessibilityLabel="Code à 6 chiffres"
    />
  );
}

describe('OtpInput', () => {
  it('répercute la saisie sur le champ (contrôlé par value/onChange)', async () => {
    await render(<Controlled />);
    const input = screen.getByTestId('otp');
    await fireEvent.changeText(input, '123');
    expect(input.props.value).toBe('123');
  });

  it('appelle onComplete une fois les 6 chiffres saisis', async () => {
    const onComplete = jest.fn();
    await render(<Controlled onComplete={onComplete} />);
    await fireEvent.changeText(screen.getByTestId('otp'), '482917');
    expect(onComplete).toHaveBeenCalledWith('482917');
  });

  it("n'appelle pas onComplete avant les 6 chiffres", async () => {
    const onComplete = jest.fn();
    await render(<Controlled onComplete={onComplete} />);
    await fireEvent.changeText(screen.getByTestId('otp'), '4829');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('ignore les caractères non numériques', async () => {
    await render(<Controlled />);
    const input = screen.getByTestId('otp');
    await fireEvent.changeText(input, '4a8b2c');
    expect(input.props.value).toBe('482');
  });

  it('tronque au-delà de la longueur attendue', async () => {
    await render(<Controlled />);
    const input = screen.getByTestId('otp');
    await fireEvent.changeText(input, '1234567890');
    expect(input.props.value).toBe('123456');
  });

  it('expose une accessibilityLabel sur le vrai champ', async () => {
    await render(<Controlled />);
    expect(screen.getByLabelText('Code à 6 chiffres')).toBeTruthy();
  });
});
