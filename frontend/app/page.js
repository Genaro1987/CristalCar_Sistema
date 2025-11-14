export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>ERP – Stack Turso + GitHub + Vercel</h1>
      <p>Frontend operacionalizado com Next.js 14 na Vercel.</p>
      <p>
        Para validar a conexão com o banco, acesse{" "}
        <code>/api/health-db</code> deste mesmo domínio.
      </p>
    </main>
  );
}
