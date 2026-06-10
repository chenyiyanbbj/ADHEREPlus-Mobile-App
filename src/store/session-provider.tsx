import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import { mockPatientProfile, mockUser } from "@/store/mock-data";

interface SessionShape {
  user: typeof mockUser;
  profile: typeof mockPatientProfile;
}

interface SessionContextShape {
  session: SessionShape | null;
  loading: boolean;
  signIn: (loginId: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextShape | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionShape | null>(null);
  const [loading, setLoading] = useState(false);

  const value = useMemo<SessionContextShape>(
    () => ({
      session,
      loading,
      async signIn(loginId, password) {
        setLoading(true);

        try {
          if (loginId.trim().toUpperCase() !== mockUser.login_id || password.trim().length < 4) {
            return { ok: false, message: "Invalid patient code or password." };
          }

          setSession({ user: mockUser, profile: mockPatientProfile });
          return { ok: true };
        } finally {
          setLoading(false);
        }
      },
      async signOut() {
        setSession(null);
      },
    }),
    [loading, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return context;
}
