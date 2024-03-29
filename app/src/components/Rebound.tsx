import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { trackEvent } from "../helpers/analytics"

import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link"

export default function Rebound({
  desc,
  linkProps,
  title,
  tracking,
}: {
  desc?: ReactNode
  linkProps: RegisteredLinkProps
  title: string
  tracking: { category: string }
}) {
  return (
    <>
      <div className="fr-p-2w fr-enlarge-link fr-card flex flex-col text-center shadow-tile ">
        <h3 className="fr-text--md fr-mb-1w">
          <Link
            {...linkProps}
            onClick={() =>
              trackEvent({
                category: tracking.category,
                action: "Lien rebond cliqué",
                properties: title,
              })
            }
          >
            {title}
          </Link>
        </h3>
        <p className="fr-text--sm fr-mb-0 flex grow flex-col justify-center">{desc}</p>
      </div>
    </>
  )
}
