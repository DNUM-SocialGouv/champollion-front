import { useEffect } from "react"

import { formatDate } from "../helpers/date"
import { newsTypeEmoji, releaseNotes } from "../helpers/news"
type NewsType = "feat" | "fix" | "chore" | "ezwin" | "delete"

export default function News() {
  useEffect(() => {
    document.title = "VisuDSN - Nouveautés"
  }, [])

  return (
    <>
      <div className="fr-container fr-py-4w flex flex-col">
        <h1 className="fr-h2 fr-pt-4w text-center">
          Nouvelles fonctionnalités et correctifs
        </h1>
        <hr className="fr-mb-2w w-full" />
        {releaseNotes.map((release) => (
          <div className="fr-p-3w fr-mb-3w shadow-overlap" key={release.date}>
            <h2 className="fr-h4">Nouveautés du {formatDate(release.date)}</h2>
            <ul>
              {release.news.map((page, pageIdx) => (
                <li className="list-none" key={`${release.date}-${pageIdx}`}>
                  <h3 className="fr-h5">{page.category}</h3>
                  <ul>
                    {page.list.map((note, noteIdx) => (
                      <li key={`${release.date}-${pageIdx}-${noteIdx}`}>
                        <span>{newsTypeEmoji[note.type as NewsType]}</span> {note.desc}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}
