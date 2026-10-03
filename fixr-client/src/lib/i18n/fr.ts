/**
 * Textes centralisés (CLAUDE.md) — Lot 2, groupe (auth). Texte des maquettes repris mot
 * pour mot (design/Main.dc.html, Onboarding1/2/3, Login, Otp, Signup, SignupErrors).
 * Les autres lots ajouteront leurs propres sections ici au fur et à mesure.
 */

export const fr = {
  auth: {
    welcome: {
      logo: 'fixr',
      title: 'Trouvez un artisan fiable près de chez vous',
      subtitle:
        'Plombiers, électriciens, frigoristes… vérifiés, notés et suivis en temps réel à Cotonou, Calavi et Porto-Novo.',
      primaryCta: 'Trouver un artisan',
      secondaryCta: 'Se connecter',
      legalPrefix: 'En continuant, vous acceptez nos ',
      legalTerms: "Conditions d'utilisation",
      legalAnd: ' et notre ',
      legalPrivacy: 'Politique de confidentialité',
      legalSuffix: '.',
      illustration: {
        artisanName: 'Koffi A.',
        artisanTrade: 'Plombier · Fidjrossè',
        rating: '4,9',
        reviews: '· 212 avis',
        onTheWay: 'En route · 12 min',
      },
    },

    onboarding: {
      skip: 'Passer',
      next: 'Suivant',
      createAccount: 'Créer mon compte',
      haveAccount: 'J’ai déjà un compte',
      stepLabel: (step: number) => `Étape ${step} sur 3`,
      slide1: {
        title: 'Le bon professionnel, en quelques secondes',
        description:
          'Comparez les notes, les avis et les disponibilités des artisans vérifiés autour de vous.',
        searchPlaceholder: 'Plombier',
        searchZone: '· Fidjrossè',
        topChoice: 'Top choix',
        artisans: [
          { name: 'Koffi Agbodjan', rating: '4,9', meta: '1,2 km · Dispo aujourd’hui' },
          { name: 'Sèdjro Houénou', rating: '4,7', meta: '2,8 km · Demain' },
          { name: 'Bernard Mensah', rating: '4,6', meta: '3,4 km · Sur devis' },
        ],
      },
      slide2: {
        title: 'Suivez chaque étape, sans stress',
        description:
          'Confirmation, arrivée de l’artisan, travaux, rapport final : vous savez toujours où en est votre intervention.',
        cardTitle: 'L’artisan est en route',
        cardEta: '12 min',
        steps: ['Confirmée', 'En route', 'Intervention', 'Rapport'],
      },
      slide3: {
        title: 'Des prix clairs, un service sécurisé',
        description:
          'Devis avant travaux, artisans vérifiés et paiement final uniquement après votre validation.',
        quoteTitle: 'Devis détaillé',
        quoteValidated: 'Validé',
        labor: 'Main d’œuvre',
        travel: 'Déplacement',
        materials: 'Matériel (3 pièces)',
        total: 'Total',
      },
    },

    login: {
      title: 'Bon retour parmi nous',
      subtitle: 'Connectez-vous pour suivre vos demandes et vos artisans.',
      tabPhone: 'Téléphone',
      tabEmail: 'E-mail',
      phoneLabel: 'Numéro de téléphone',
      phonePrefix: 'BJ +229',
      phoneHint: 'Nous vous enverrons un code à 6 chiffres par SMS.',
      receiveCode: 'Recevoir le code',
      emailLabel: 'Adresse e-mail',
      passwordLabel: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
      signIn: 'Se connecter',
      or: 'ou',
      continueWithGoogle: 'Continuer avec Google',
      continueWithApple: 'Continuer avec Apple',
      ssoComingSoon: (provider: string) => `Connexion ${provider} bientôt disponible`,
      forgotPasswordComingSoon: 'La récupération de mot de passe sera bientôt disponible.',
      noAccountYet: 'Pas encore de compte ?',
      createAccount: 'Créer un compte',
    },

    otp: {
      title: 'Entrez le code reçu',
      sentToPrefix: 'Envoyé par SMS au ',
      sentToSuffix: '.',
      edit: 'Modifier',
      groupLabel: 'Code à 6 chiffres',
      digitsEntered: (n: number) => `Code à 6 chiffres, ${n} sur 6 saisis`,
      resendPrefix: 'Renvoyer le code dans ',
      resendCta: 'Renvoyer le code',
      verify: 'Vérifier',
      verified: 'Code vérifié',
      continueCta: 'Continuer',
      invalidCode: 'Code invalide. Réessayez.',
    },

    signup: {
      title: 'Créez votre compte',
      subtitle: 'Moins d’une minute pour trouver votre premier artisan.',
      signIn: 'Se connecter',
      firstName: 'Prénom',
      lastName: 'Nom',
      phoneLabel: 'Numéro de téléphone',
      phonePrefix: '+229',
      emailLabel: 'Adresse e-mail',
      passwordLabel: 'Mot de passe',
      passwordStrength: { weak: 'Faible', medium: 'Moyenne', strong: 'Solide' },
      termsPrefix: "J'accepte les ",
      termsConditions: "conditions d'utilisation",
      termsAnd: ' et la ',
      termsPrivacy: 'politique de confidentialité',
      termsSuffix: ' de FIXR.',
      submit: 'Créer mon compte',
      errorsBanner: (n: number) =>
        n === 1
          ? '1 champ est à corriger avant de continuer.'
          : `${n} champs sont à corriger avant de continuer.`,
      phoneAlreadyExists: 'Ce numéro a déjà un compte.',
      passwordCriteria: {
        length: '8 caractères min.',
        uppercase: 'Une majuscule',
        digit: 'Un chiffre',
        symbol: 'Un symbole',
      },
    },

    common: {
      back: 'Retour',
      networkError: 'Connexion impossible. Réessayez.',
      retry: 'Réessayer',
    },
  },
} as const;

export default fr;
