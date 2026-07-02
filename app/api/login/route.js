import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { setAuthCookies } from "@/lib/auth";
import { getPublicUrl } from "@/lib/requestUrl";

export async function POST(request) {
  const expectsJson = (request.headers.get("content-type") || "").includes("application/json");

  try {
    const { email, password } = await readLoginPayload(request);
    let message = null;

    if (!email || !password) {
      message = "Se requiere del email y la contraseña.";
    } else {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          message = "Email o contraseña incorrectos.";
        } else if (error.message.includes("Email not confirmed")) {
          message = "Tu email aún no ha sido confirmado.";
        } else {
          message = error;
        }
      } else {
        const redirectTo = "/main_catalog";
        const response = expectsJson
          ? NextResponse.json({ ok: true, redirectTo })
          : NextResponse.redirect(getPublicUrl(request, redirectTo), { status: 303 });
        setAuthCookies(response, data.session);
        response.headers.set("Cache-Control", "no-store");
        return response;
      }
    }

    return loginFailure(request, message, expectsJson);
  } catch (error) {
    console.error("Login route failed:", error);
    return loginFailure(request, "El ingreso a la plataforma falló, favor de reportarlo.", expectsJson);
  }
}

function loginFailure(request, message, expectsJson) {
  const text = typeof message === "string" ? message : message?.message || "No fue posible iniciar sesión.";

  if (expectsJson) {
    return NextResponse.json(
      { ok: false, message: text },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.redirect(
    getPublicUrl(request, `/login?error=${encodeURIComponent(text)}`),
    { status: 303 }
  );
}

async function readLoginPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return {
      email: String(body.email || ""),
      password: String(body.password || "")
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = new URLSearchParams(await request.text());
    return {
      email: String(body.get("email") || ""),
      password: String(body.get("password") || "")
    };
  }

  const form = await request.formData().catch(() => null);
  return {
    email: String(form?.get("email") || ""),
    password: String(form?.get("password") || "")
  };
}
