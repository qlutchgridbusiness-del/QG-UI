// src/types/global.d.ts
import type { RecaptchaVerifier as RV } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: RV;
  }
}
