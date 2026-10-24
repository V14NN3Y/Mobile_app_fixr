-- Lot 8 — docs/MODELE-DONNEES.md n'a pas de colonne pour Review.service
-- (src/types/domain.ts), un texte libre décrivant la prestation ("Ménage après travaux"…),
-- affiché partout où un avis l'est. La moitié des avis du seed (rv1/rv2/rv4/rv5/rv6) n'ont
-- pas de booking_id du tout (avis historiques sans réservation liée) : impossible de
-- toujours le dériver par jointure sur bookings.title. Ajout minimal, cohérent avec
-- payment_methods (migration 0001) — un ajout documenté au schéma partagé, pas une
-- improvisation silencieuse.
alter table reviews add column service text not null default '';
