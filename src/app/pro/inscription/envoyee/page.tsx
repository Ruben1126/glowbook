export default function InscriptionEnvoyeePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-brand-dark">Fiche créée, en attente de validation</h1>
      <p className="mt-3 text-ink/70">
        Merci ! Votre fiche a été enregistrée et sera vérifiée par notre équipe avant d'être
        publiée. Vous recevrez un e-mail dès qu'elle sera en ligne.
      </p>
      <p className="mt-4 text-sm text-ink/50">
        En attendant, vous pouvez déjà vous connecter à votre espace pro pour compléter votre
        fiche (horaires, équipe, prestations).
      </p>
    </div>
  );
}
