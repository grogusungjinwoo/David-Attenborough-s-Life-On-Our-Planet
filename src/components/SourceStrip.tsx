import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import type { SourceRecord, SourceRef } from "../domain/storyModel";

export type SourceStripProps = {
  sourceRefs: SourceRef[];
  sources: SourceRecord[];
  title?: string;
  compact?: boolean;
  className?: string;
};

const familyLabels: Record<SourceRecord["family"], string> = {
  manuscript: "Manuscript",
  "public-data": "Public data",
  "reference-repo": "Reference repo"
};

export function SourceStrip({
  sourceRefs,
  sources,
  title = "Sources",
  compact = false,
  className
}: SourceStripProps) {
  const sourceById = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources]
  );

  return (
    <section
      className={[
        "source-strip",
        compact ? "source-strip--compact" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={title}
    >
      {!compact ? <span className="source-strip__title">{title}</span> : null}
      <div className="source-strip__list">
        {sourceRefs.length > 0 ? (
          sourceRefs.map((sourceRef) => {
            const source = sourceById.get(sourceRef.sourceId);
            const label = source?.label ?? sourceRef.sourceId;
            const details = formatSourceDetails(sourceRef);
            const key = [
              sourceRef.sourceId,
              sourceRef.pdfPage,
              sourceRef.printedPage,
              sourceRef.detail
            ].join(":");

            return (
              <article className="source-strip__item" key={key}>
                <div className="source-strip__meta">
                  <span className="source-strip__family">
                    {source ? familyLabels[source.family] : "Unresolved"}
                  </span>
                  {source?.href ? (
                    <a href={source.href} target="_blank" rel="noreferrer">
                      <span>{label}</span>
                      <ExternalLink aria-hidden="true" size={13} />
                    </a>
                  ) : (
                    <strong>{label}</strong>
                  )}
                </div>
                {details ? (
                  <p className="source-strip__detail">{details}</p>
                ) : source?.note ? (
                  <p className="source-strip__detail">{source.note}</p>
                ) : null}
              </article>
            );
          })
        ) : (
          <span className="source-strip__empty">No sources listed</span>
        )}
      </div>
    </section>
  );
}

function formatSourceDetails(sourceRef: SourceRef) {
  const pageDetails = [
    sourceRef.pdfPage ? `PDF p. ${sourceRef.pdfPage}` : undefined,
    sourceRef.printedPage ? `printed p. ${sourceRef.printedPage}` : undefined
  ].filter(Boolean);

  return [pageDetails.join(", "), sourceRef.detail].filter(Boolean).join(" - ");
}
