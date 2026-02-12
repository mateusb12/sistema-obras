export function AdminPanel() {
  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-900">
      <h3 className="font-semibold">Painel Administrativo</h3>
      <p className="text-sm">
        Área restrita para gestão avançada de usuários e parâmetros.
      </p>
    </section>
  );
}

export function EngineeringPanel() {
  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
      <h3 className="font-semibold">Painel de Engenharia</h3>
      <p className="text-sm">
        Área de planejamento técnico e evolução dos relatórios.
      </p>
    </section>
  );
}
