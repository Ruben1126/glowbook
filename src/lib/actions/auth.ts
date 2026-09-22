"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { linkAccountToAuthUser } from "@/lib/actions/account";

/** Étape 1 de la connexion pro : envoie un code à usage unique par e-mail. */
export async function sendLoginCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const redirectTo = String(formData.get("redirectTo") ?? "/pro/tableau-de-bord");

  if (!email || !email.includes("@")) {
    redirect(`/pro/connexion?erreur=${encodeURIComponent("Adresse e-mail invalide.")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    redirect(`/pro/connexion?erreur=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/pro/connexion?etape=code&email=${encodeURIComponent(email)}&suite=${encodeURIComponent(redirectTo)}`
  );
}

/** Étape 2 : vérifie le code reçu par e-mail et ouvre la session. */
export async function verifyLoginCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/pro/tableau-de-bord");

  const fail = (message: string) => {
    redirect(
      `/pro/connexion?etape=code&email=${encodeURIComponent(email)}&suite=${encodeURIComponent(redirectTo)}&erreur=${encodeURIComponent(message)}`
    );
  };

  if (!email || !code) fail("Code manquant.");

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error) fail("Code invalide ou expiré.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) fail("Session introuvable après vérification.");

  const { error: linkError } = await linkAccountToAuthUser(email, user!.id);
  if (linkError) {
    await supabase.auth.signOut();
    fail(linkError);
  }

  redirect(redirectTo);
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/pro");
}
