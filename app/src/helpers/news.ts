type NewsType = "feat" | "fix" | "chore" | "ezwin" | "delete"

export const newsTypeEmoji: Record<NewsType, string> = {
  chore: "🛠️",
  delete: "🚫",
  ezwin: "✨",
  feat: "🎉",
  fix: "🚧",
}

type NewsPage = {
  category: string
  list: { type: NewsType; desc: string }[]
}

type ReleaseNote = {
  date: string
  news: NewsPage[]
}

export const releaseNotes: ReleaseNote[] = [
  {
    date: "2023-07-28",
    news: [
      {
        category: "Liste des contrats",
        list: [
          {
            type: "feat",
            desc: "Ajout du filtre par salarié",
          },
          {
            type: "feat",
            desc: "Ajout de la date de naissance des salariés",
          },
          {
            type: "fix",
            desc: "Correctif : lorsqu'on sélectionne un motif de recours, les contrats dont le motif n'est pas précisé ne s'affichent plus.",
          },
        ],
      },
      {
        category: "Page d'accueil",
        list: [
          {
            type: "feat",
            desc: "Affichage des 10 derniers établissements recherchés (les 2 premiers sont visibles, les autres sont cachés et s'affichent en cliquant sur “Voir plus”",
          },
          {
            type: "feat",
            desc: "Liste de liens externes utiles (SI Précarité, inscription à la newsletter du projet, formulaires liés au projet…)",
          },
          {
            type: "ezwin",
            desc: "Affichage des nouveautés",
          },
        ],
      },
      {
        category: "Recours abusif - Effectifs",
        list: [
          {
            type: "feat",
            desc: "Nouvelle unité ETP-heures",
          },
          {
            type: "feat",
            desc: "Ajout d'une FAQ pour expliquer les unités",
          },
          {
            type: "chore",
            desc: "Renommage de l'unité moyenne en ETP jour",
          },
          {
            type: "chore",
            desc: "Prise en compte des jours ouvrés dans le calcul des effectifs",
          },
          {
            type: "delete",
            desc: "Suppression de l'unité d'effectifs au dernier jour du mois, finalement peu pertinente.",
          },
        ],
      },
      {
        category: "Délai de carence",
        list: [
          {
            type: "feat",
            desc: "Calcul d'anomalies de délai de carence selon les dispositions supplétives, et affichage sous forme de liste d'anomalies (ou infractions potentielles). Attention à bien vérifier les informations fournies pour que le calcul soit correct.",
          },
          {
            type: "feat",
            desc: "Ajout des 5 accords de branches étendus qui concernent le plus de salariés (d'autres à venir plus tard)",
          },
        ],
      },
    ],
  },
]
