/**
 * Cloudflare Turnstile Verification Helper
 * Verifies human challenge tokens server-side using Cloudflare Siteverify API.
 */

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
  action?: string;
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In development environments without a configured secret key, permit request with warning
  if (!secretKey || secretKey.trim() === "") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Turnstile] TURNSTILE_SECRET_KEY is not set in development mode. Bypassing bot verification."
      );
      return { success: true, hostname: "localhost" };
    }
    return {
      success: false,
      errorCodes: ["missing-input-secret"],
    };
  }

  // Token is required
  if (!token || typeof token !== "string" || token.trim() === "") {
    return {
      success: false,
      errorCodes: ["missing-input-response"],
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey.trim());
    formData.append("response", token.trim());
    if (remoteIp) {
      formData.append("remoteip", remoteIp.trim());
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!res.ok) {
      console.error(
        `[Turnstile] Siteverify HTTP error: ${res.status} ${res.statusText}`
      );
      return {
        success: false,
        errorCodes: ["http-error"],
      };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
      hostname?: string;
      action?: string;
    };

    return {
      success: !!data.success,
      errorCodes: data["error-codes"],
      hostname: data.hostname,
      action: data.action,
    };
  } catch (error) {
    console.error("[Turnstile] Verification request failed:", error);
    return {
      success: false,
      errorCodes: ["internal-error"],
    };
  }
}
