export const metadata = {
  title: "ERP Turso",
  description: "Frontend ERP conectado ao Turso via Vercel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
