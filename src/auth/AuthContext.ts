import { createContext, useContext } from "react";

export type AccountMode = "local" | "guest" | "account";

export interface AuthContextValue {
  /** local: accounts not configured · guest: chose to skip sign-in · account: signed in */
  mode: AccountMode;
  email: string | null;
  /** Leave guest mode and show the sign-in screen (guest data is kept and uploaded to a new account). */
  startSignIn: () => void;
  signOut: () => Promise<void>;
  /** Deletes the signed-in user's cloud copy (no-op when not signed in). */
  deleteCloudData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  mode: "local",
  email: null,
  startSignIn: () => {},
  signOut: async () => {},
  deleteCloudData: async () => {},
});

export const useAuth = () => useContext(AuthContext);
