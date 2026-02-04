"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  phone: string;
  role: "USER" | "BUSINESS";
};

export type AuthContextType = {
  user: {
    id: string;
    name?: string;
    phone: string;
    role: "USER" | "BUSINESS";
  } | null;

  token: string | null;

  isAuthenticated: boolean;

  role: "USER" | "BUSINESS";

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

  /* ---------- LOAD FROM STORAGE ---------- */
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    const b = localStorage.getItem("activeBusinessId");

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
  }, []);

  /* ---------- ACTIONS ---------- */
  function login(data: any) {
    localStorage.setItem("token", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      localStorage.removeItem("user");
    }

    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    setToken(null);
    setActiveBusinessId(null);
  }

  function switchToBusiness(id: string | null) {
    if (id) {
      localStorage.setItem("activeBusinessId", id);
    } else {
      localStorage.removeItem("activeBusinessId");
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
