import type { ForecastDay } from "@/types"

/** Seven-day strip showing how many questions come due on each local date. */
export function ForecastStrip({ forecast }: Props) {
  return (
    <section aria-labelledby="forecast-heading">
      <h2 id="forecast-heading" className="section-label border-rule-hard border-b pb-2">
        Próximos 7 días
      </h2>
      <ol className="grid grid-cols-7">
        {forecast.map((day, index) => {
          const date = new Date(`${day.date}T12:00:00`)
          return (
            <li
              key={day.date}
              className="border-rule flex min-w-0 flex-col items-center border-r py-2 last:border-r-0"
            >
              <span className="font-sans text-[10px] tracking-[0.08em] uppercase">
                {index === 0 ?
                  "Hoy"
                : new Intl.DateTimeFormat("es-ES", { weekday: "short" })
                    .format(date)
                    .replace(".", "")
                }
              </span>
              <strong
                className={
                  index === 0 ?
                    "text-red mt-1 font-mono text-base font-normal"
                  : "mt-1 font-mono text-base font-normal"
                }
              >
                {day.due}
              </strong>
              <span className="text-faint font-mono text-[10px]">{date.getDate()}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

interface Props {
  /** Due counts for today and the following six days */
  forecast: ForecastDay[]
}
