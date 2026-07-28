import { formatSection } from "@/lib/formatSection"
import type { SectionStats } from "@/types"

/** Dense bank-status table grouped by manual section. */
export function SectionStatsTable({ stats }: Props) {
  const totals = stats.reduce(
    (total, section) => ({
      due: total.due + section.due,
      bank: total.bank + section.bank,
      learned: total.learned + section.learned,
    }),
    { due: 0, bank: 0, learned: 0 },
  )

  return (
    <section aria-labelledby="sections-heading">
      <h2 id="sections-heading" className="sr-only">
        Estado por sección
      </h2>
      <table className="w-full table-fixed border-collapse font-sans text-[13px] tabular-nums">
        <thead className="border-rule-hard border-y text-[10px] tracking-[0.1em] uppercase">
          <tr>
            <th className="w-[55%] py-2 text-left font-medium">Sección</th>
            <th className="py-2 text-right font-medium">Pend.</th>
            <th className="py-2 text-right font-medium">Banco</th>
            <th className="py-2 text-right font-medium">Fijadas</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(section => (
            <tr key={section.section} className="border-rule border-b">
              <th className="py-2 pr-3 text-left font-normal">{formatSection(section.section)}</th>
              <td className={section.due > 0 ? "py-2 text-right" : "text-faint py-2 text-right"}>
                {section.due}
              </td>
              <td className="py-2 text-right">{section.bank}</td>
              <td
                className={section.learned === 0 ? "text-faint py-2 text-right" : "py-2 text-right"}
              >
                {section.learned}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-ink border-b font-medium">
          <tr>
            <th className="py-2 text-left">Total</th>
            <td className="py-2 text-right">{totals.due}</td>
            <td className="py-2 text-right">{totals.bank}</td>
            <td className="py-2 text-right">{totals.learned}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}

interface Props {
  /** Bank status grouped by section */
  stats: SectionStats[]
}
