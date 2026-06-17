import Script from "next/script";

export const metadata = {
  title: "International Foods Control - Login"
};

export default function LoginPage() {
  return (
    <>
      <Script src="/login/login.js" strategy="afterInteractive" />
      <div className="login-page">
        <div className="login-box">
          <h2>Login</h2>
          <form action="/api/login" method="POST">
            <input name="email" placeholder="Email" />
            <input type="password" name="password" placeholder="Password" />
            <button type="submit">Sign In</button>
          </form>
          <div id="error" className="error-box" />
          <div className="login-footer">&copy; 2026 International Foods Control</div>
        </div>
      </div>
    </>
  );
}

