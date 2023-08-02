import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link"

export default function AppRebound({
  desc,
  linkProps,
  title,
}: {
  desc?: ReactNode
  linkProps: RegisteredLinkProps
  title: ReactNode
}) {
  return (
    <>
      <div className="fr-p-2w fr-enlarge-link fr-card flex flex-col  text-center shadow-tile ">
        <h3 className="fr-text--md fr-mb-1w">
          <Link {...linkProps}>{title}</Link>
        </h3>
        <p className="fr-text--sm fr-mb-0 flex grow flex-col justify-center">{desc}</p>
      </div>
    </>
  )
}
