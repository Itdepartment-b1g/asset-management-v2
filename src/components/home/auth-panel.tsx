"use client";

import { useState } from "react";
import LoginList from "@/components/login/list";
import SignupList from "@/components/signup/list";

export default function HomeAuthPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  if (mode === "signup") {
    return (
      <SignupList
        embedded
        stayOnPage
        onSwitchToLogin={() => setMode("login")}
      />
    );
  }

  return (
    <LoginList
      embedded
      stayOnPage
      onSwitchToSignup={() => setMode("signup")}
    />
  );
}
