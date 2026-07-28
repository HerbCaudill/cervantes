/** Placeholder progress summary that the manual reader can later connect to saved positions. */
export function ManualProgress() {
  return (
    <section aria-labelledby="reading-heading">
      <h2 id="reading-heading" className="section-label border-rule-hard border-b pb-2">
        Lectura del manual
      </h2>
      <div>
        {TASKS.map(task => (
          <div key={task} className="relative flex min-h-11 items-center justify-between">
            <span className="font-serif text-sm">{task}</span>
            <span className="text-faint font-mono text-[11px]">0 %</span>
            <span className="bg-rule absolute inset-x-0 bottom-0 h-px" />
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled
        className="text-soft border-rule flex min-h-11 w-full items-center justify-between border-b font-sans text-xs tracking-[0.08em] uppercase disabled:cursor-not-allowed"
      >
        <span>Seguir leyendo</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  )
}

/** Manual sections whose reading progress will be populated by the reader feature. */
const TASKS = ["Tarea 1", "Tarea 2", "Tarea 3", "Tarea 4", "Tarea 5"]
