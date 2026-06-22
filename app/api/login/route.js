import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { setAuthCookies } from "@/lib/auth";
import { getPublicUrl } from "@/lib/requestUrl";

export async function POST(request) {
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
          message = "Tu email aun no ha sido confirmado.";
        } else {
          message = error;
        }
      } else {
        const response = NextResponse.redirect(
          getPublicUrl(request, "/main_catalog/laboratories"),
          { status: 303 }
        );
        setAuthCookies(response, data.session);
        response.headers.set("Cache-Control", "no-store");
        return response;
      }
    }

    return redirectToLogin(request, message);
  } catch (error) {
    console.error("Login route failed:", error);
    return redirectToLogin(request, "El ingreso a la plataforma falló, favor de reportarlo.");
  }
}

function redirectToLogin(request, message) {
  return NextResponse.redirect(
    getPublicUrl(request, `/login?error=${encodeURIComponent(message)}`),
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
