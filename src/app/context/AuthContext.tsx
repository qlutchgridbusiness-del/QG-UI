"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { safeClear, safeGetItem, safeRemoveItem, safeSetItem } from "@/app/lib/safeStorage";

type User = {
  id: string;
  phone: string;
  role: "USER" | "BUSINESS" | "ADMIN";
};

export type AuthContextType = {
  user: {
    id: string;
    name?: string;
    phone: string;
    role: "USER" | "BUSINESS" | "ADMIN";
  } | null;

  token: string | null;

  isAuthenticated: boolean;
  isAuthReady: boolean;

  role: "USER" | "BUSINESS" | "ADMIN";

  businesses: {
    id: string;
    name: string;
  }[];

  activeBusinessId: string | null;

  switchToUser: () => void;
  login: (data: { token: string; user: User }) => void;
  switchToBusiness: (businessId: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  /* ---------- LOAD FROM STORAGE ---------- */
  useEffect(() => {
    const t = safeGetItem("token");
    const u = safeGetItem("user");
    const b = safeGetItem("activeBusinessId");

    if (t) setToken(t);

    if (u && u !== "undefined") {
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        console.error("Invalid user in localStorage", u);
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    if (b && b !== "undefined") {
      setActiveBusinessId(b);
    }

    setIsAuthReady(true);
  }, []);

  /* ---------- ACTIONS ---------- */
  function login(data: any) {
    safeSetItem("token", data.token);
    if (data.user) {
      safeSetItem("user", JSON.stringify(data.user));
    } else {
      safeRemoveItem("user");
    }

    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    safeClear();
    setUser(null);
    setToken(null);
    setActiveBusinessId(null);
  }

  function switchToBusiness(id: string | null) {
    if (id) {
      safeSetItem("activeBusinessId", id);
    } else {
      safeRemoveItem("activeBusinessId");
    }
    setActiveBusinessId(id);
  }

  function switchToUser() {
    switchToBusiness(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isAuthReady,
        role: user?.role ?? "USER",
        businesses: [],
        activeBusinessId,
        login,
        logout,
        switchToBusiness,
        switchToUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------- HOOK ---------- */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
