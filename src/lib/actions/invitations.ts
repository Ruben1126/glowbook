"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { linkAccountToAuthUser } from "@/lib/actions/account";

function fail(token: string, message: string, extra = ""): never {
  redirect(`/pro/invitation/${token}?erreur=${encodeURIComponent(message)}${extra}`);
}

async function findPendingInvitation(token: string) {
  const admin = createAdminClient();
  const { data: salon } = await admin
    .from("salons")
    .select("*")
    .eq("invitation_token", token)
    .eq("status", "invited")
    .maybeSingle();

  if (!salon) return null;

  const { data: account } = await admin
    .from("accounts")
    .select("*")
    .eq("id", salon.owner_account_id)
    .maybeSingle();

  return account ? { salon, account } : null;
}

/** Étape 1 : le salon accepte les CGU et demande son code de connexion. */
export async function startInvitationAcceptance(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const accepted = formData.get("accepted") === "on";

  if (!accepted) fail(token, "Vous devez accepter les CGU et la politique de confidentialité.");

  const found = await findPendingInvitation(token);
  if (!found) fail(token, "Invitation introuvable, expirée ou déjà utilisée.");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: found!.account.email,
    options: { shouldCreateUser: true },
  });
  if (error) fail(token, error.message);

  redirect(`/pro/invitation/${token}?etape=code`);
}

/** Étape 2 : code vérifié → compte lié et fiche publiée directement. */
export async function confirmInvitationAcceptance(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  const found = await findPendingInvitation(token);
  if (!found) fail(token, "Invitation introuvable, expirée ou déjà utilisée.");

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: found!.account.email,
    token: code,
    type: "email",
  });
  if (error) fail(token, "Code invalide ou expiré.", "&etape=code");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) fail(token, "Session introuvable après vérification.", "&etape=code");

  const { error: linkError } = await linkAccountToAuthUser(found!.account.email, user!.id);
  if (linkError) fail(token, linkError, "&etape=code");

  const admin = createAdminClient();
  await admin
    .from("salons")
    .update({ status: "approved", invitation_accepted_at: new Date().toISOString() })
    .eq("id", found!.salon.id);

  redirect("/pro/tableau-de-bord");
}
