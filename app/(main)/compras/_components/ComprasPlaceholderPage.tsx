type ComprasPlaceholderPageProps = {
  title: string;
};

export function ComprasPlaceholderPage({ title }: ComprasPlaceholderPageProps) {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">{title}</h1>
    </section>
  );
}
