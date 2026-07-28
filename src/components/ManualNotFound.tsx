import { AppLink } from "@/navigation/AppLink"

/** Accessible fallback for an unknown manual or application route. */
export function ManualNotFound() {
  return (
    <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
      <h2 className="border-rule-hard border-b py-[0.85rem] font-serif text-[23px] leading-[1.12] font-bold">
        Página no encontrada
      </h2>
      <AppLink
        href="/manual"
        className="text-soft border-rule flex min-h-11 items-center border-b font-sans text-xs tracking-[0.08em] uppercase"
      >
        Ir al índice del manual
      </AppLink>
    </div>
  )
}
