export default function Footer() {
  return (
    <footer className="flex items-center justify-between text-sm pl-6 py-4 mt-4 mb-4">
      <div className="font-bold text-[rgba(4,14,35,0.64)]">
        © 2026 Qive. Todos os direitos reservados. Desenvolvido em São Carlos, a Capital da Tecnologia
      </div>
      <div className="flex gap-4 text-[#0c3cf7]">
        <a href="#" className="hover:underline">
          Termos de serviço
        </a>
        <a href="#" className="hover:underline">
          Contato
        </a>
      </div>
    </footer>
  );
}
