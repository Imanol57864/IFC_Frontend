import "./globals.css";
export const metadata = {
  title: "International Foods Control",
  icons: {
    icon: "/favicon.jpg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

