import "./globals.css";

export const metadata = {
  title: "@examples/next",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body>{children}</body>
    </html>
  );
}
