import { AppLink } from "@/navigation/AppLink"

/** Deep-linkable search shell contained within the Manual destination. */
export function ManualSearch() {
  return (
    <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
      <AppLink
        href="/manual"
        className="text-soft flex min-h-11 items-center font-sans text-xs tracking-[0.08em] uppercase"
      >
        ← Índice del manual
      </AppLink>
      <h2 className="border-rule-hard border-b py-[0.85rem] font-serif text-[23px] leading-[1.12] font-bold">
        Buscar en el manual
      </h2>
      <label className="section-label mt-[0.85rem]" htmlFor="manual-search">
        Buscar en el manual
      </label>
      <input
        id="manual-search"
        type="search"
        placeholder="Escribe una palabra o frase"
        className="border-rule-hard bg-paper text-ink mt-2 min-h-11 border-b px-2 font-serif text-[17px]"
      />
      <p className="text-soft border-rule mt-[0.85rem] border-y py-[0.85rem] font-serif text-[17px] leading-[1.5]">
        Los resultados estarán disponibles con el lector del manual.
      </p>
    </div>
  )
}
