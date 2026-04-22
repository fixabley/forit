import { authStorage, type StoredTokens, type StoredUser } from '@/lib/auth/storage';
import * as React from 'react';

export interface AuthTokens extends StoredTokens {}
export interface AuthUser extends StoredUser {}

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  signIn: (tokens: AuthTokens, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [tokens, setTokens] = React.useState<AuthTokens | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Restore session from SecureStore on mount
  React.useEffect(() => {
    (async () => {
      try {
        const [storedTokens, storedUser] = await Promise.all([
          authStorage.getTokens(),
          authStorage.getUser(),
        ]);
        if (storedTokens && storedUser) {
          setTokens(storedTokens);
          setUser(storedUser);
        }
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const signIn = React.useCallback(async (tokens: AuthTokens, user: AuthUser) => {
    await Promise.all([
      authStorage.saveTokens(tokens.accessToken, tokens.refreshToken),
      authStorage.saveUser(user),
    ]);
    setTokens(tokens);
    setUser(user);
  }, []);

  const signOut = React.useCallback(async () => {
    await authStorage.clear();
    setTokens(null);
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isSignedIn: !!tokens,
      isLoaded,
      signIn,
      signOut,
    }),
    [user, tokens, isLoaded, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
