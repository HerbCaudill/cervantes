import { ManualBlockList } from "@/components/ManualBlockList"
import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { ManualAsset, ManualSection, ManualTopic } from "@/manual/types"

/** One anchored topic within a continuous tarea reader. */
export function ManualTopicSection({ assets, section, topic, topicNumber }: Props) {
  const anchor = getManualTopicSlug(section, topic)
  const sourceBlocks =
    topic.blocks[0]?.type === "heading" && topic.blocks[0].text === topic.title ?
      topic.blocks.slice(1)
    : topic.blocks

  return (
    <section
      aria-labelledby={anchor}
      className="border-rule-hard scroll-mt-2 border-t pt-[1.4rem] first:border-t-0 first:pt-0"
      data-reader-topic={topic.id}
    >
      <p className="text-red mb-2 font-mono text-[10.5px] tracking-[0.08em] uppercase">
        Tema {String(topicNumber).padStart(2, "0")}
      </p>
      <h2
        id={anchor}
        className="scroll-mt-2 pb-[0.85rem] font-serif text-[23px] leading-[1.12] font-bold text-balance"
      >
        {topic.title}
      </h2>
      <div className="flex flex-col gap-[0.85rem] pb-[1.4rem]">
        <ManualBlockList blocks={sourceBlocks} assets={assets} />
      </div>
    </section>
  )
}

interface Props {
  /** Manual assets available to topic blocks */
  assets: ManualAsset[]
  /** Parent tarea */
  section: ManualSection
  /** Topic rendered at this position */
  topic: ManualTopic
  /** One-based topic position within the tarea */
  topicNumber: number
}
