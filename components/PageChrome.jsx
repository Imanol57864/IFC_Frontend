import Link from 'next/link'

export default function PageChrome({ userEmail, children }) {
  return (
    <>
      <header>
        <h2>International Foods Control</h2>
        <div className="top-bar-grid">
          <div className="user-info">{userEmail}</div>
          <Link id="logout-btn" href="/logout" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        &copy; 2026 International Foods Control, México
      </footer>
    </>
  );
}
