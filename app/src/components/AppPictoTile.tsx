import { AnchorHTMLAttributes } from "react"
import { Link, LinkProps } from "react-router-dom"

type AppPictoTileProps = {
  desc?: string
  pictogramUrl?: string
  title: string
  horizontal?: boolean
  linkProps?: LinkProps
  anchorProps?: AnchorHTMLAttributes<HTMLAnchorElement>
}

export default function AppPictoTile({
  anchorProps,
  desc,
  pictogramUrl,
  horizontal,
  linkProps,
  title,
}: AppPictoTileProps) {
  return (
    <>
      <div
        className={`fr-tile fr-tile--sm fr-enlarge-link fr-p-2w ${
          horizontal ? "fr-tile--horizontal" : ""
        }`}
      >
        <div className="fr-tile__body">
          <h3 className="fr-tile__title">
            {linkProps ? (
              <Link {...linkProps}>{title}</Link>
            ) : anchorProps ? (
              <a {...anchorProps}>{title}</a>
            ) : (
              <>{title}</>
            )}
          </h3>
          {!!desc && <p className="fr-tile__desc fr-pb-3w">{desc}</p>}
        </div>
        {!!pictogramUrl && (
          <div className="fr-tile__header">
            <div className="fr-tile__pictogram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="fr-artwork"
                viewBox="0 0 80 80"
                width="80px"
                height="80px"
              >
                {(["artwork-decorative", "artwork-minor", "artwork-major"] as const).map(
                  (label) => (
                    <use
                      key={label}
                      className={`fr-${label}`}
                      xlinkHref={`${pictogramUrl}#${label}`}
                    />
                  )
                )}
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
