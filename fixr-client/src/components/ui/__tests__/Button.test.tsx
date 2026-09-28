import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button, type ButtonVariant } from '../Button';

// @testing-library/react-native@14 : render/fireEvent sont asynchrones (act() interne).
describe('Button', () => {
  it('affiche son libellé', async () => {
    await render(<Button onPress={() => {}}>Confirmer</Button>);
    expect(screen.getByText('Confirmer')).toBeOnTheScreen();
  });

  it('appelle onPress au toucher', async () => {
    const onPress = jest.fn();
    await render(<Button onPress={onPress}>Confirmer</Button>);
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmer' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas onPress quand disabled", async () => {
    const onPress = jest.fn();
    await render(
      <Button onPress={onPress} disabled>
        Confirmer
      </Button>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmer' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("n'appelle pas onPress pendant le chargement", async () => {
    const onPress = jest.fn();
    await render(
      <Button onPress={onPress} loading>
        Confirmer
      </Button>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmer' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('expose accessibilityState.disabled quand désactivé', async () => {
    await render(
      <Button onPress={() => {}} disabled>
        Confirmer
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Confirmer' })).toHaveProp('accessibilityState', {
      disabled: true,
      busy: false,
    });
  });

  it('affiche le spinner et reste occupé pendant le chargement', async () => {
    await render(
      <Button onPress={() => {}} loading>
        Envoi…
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Envoi…' });
    expect(button).toHaveProp('accessibilityState', { disabled: true, busy: true });
    expect(screen.getByText('Envoi…')).toBeOnTheScreen();
  });

  it('icône seule : exige et expose un accessibilityLabel', async () => {
    await render(
      <Button icon="message" iconOnly accessibilityLabel="Message" onPress={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Message' })).toBeOnTheScreen();
  });

  it.each<ButtonVariant>(['primary', 'secondary', 'tertiary', 'destructive'])(
    'rend la variante %s sans erreur',
    async (variant) => {
      await render(
        <Button variant={variant} onPress={() => {}}>
          Action
        </Button>,
      );
      expect(screen.getByRole('button', { name: 'Action' })).toBeOnTheScreen();
    },
  );
});
