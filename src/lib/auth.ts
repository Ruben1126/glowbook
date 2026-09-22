import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Account, AccountRole } from "@/lib/types";

/** Compte "accounts" lié à l'utilisateur Supabase Auth courant, ou null. */
export async function getCurrentAccount(): Promise<Account | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return (data as Account) ?? null;
}

/** Redirige vers la connexion si personne n'est authentifié. */
export async function requireAccount(): Promise<Account> {
  const account = await getCurrentAccount();
  if (!account) redirect("/pro/connexion");
  return account;
}

/** Redirige si le compte connecté n'a pas l'un des rôles autorisés. */
export async function requireRole(roles: AccountRole[]): Promise<Account> {
  const account = await requireAccount();
  if (!roles.includes(account.role)) redirect("/pro");
  return account;
}
