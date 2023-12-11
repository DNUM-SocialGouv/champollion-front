import Badge from "@codegouvfr/react-dsfr/Badge"

export default function JobMergedBadge({
  merged,
  short = false,
}: {
  merged: boolean
  short?: boolean
}) {
  return (
    <>
      {merged && (
        <Badge
          severity="new"
          className={`fr-ml-1w ${
            short ? "fr-px-1v before:mx-0 before:content-['*']" : ""
          }`}
          small
        >
          {short ? "" : "Fusionné"}
        </Badge>
      )}
    </>
  )
}
