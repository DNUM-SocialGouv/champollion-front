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
    date: "2023-11-28",
    news: [
      {
        category: "Contrats",
        list: [
          {
            type: "feat",
            desc: "Ajout de tous les types de contrats présents en DSN",
          },
          {
            type: "feat",
            desc: "Possibilité de filtrer les contrats d'apprentissages",
          },
          {
            type: "ezwin",
            desc: "Abréviations pour les natures de contrats et les motifs de recours",
          },
        ],
      },
      {
        category: "FAQ",
        list: [
          {
            type: "ezwin",
            desc: "Tableaux de correspondance des abréviations de nature de contrats et motifs de recours avec les intitulés complets.",
          },
        ],
      },
    ],
  },
  {
    date: "2023-11-20",
    news: [
      {
        category: "Postes",
        list: [
          {
            type: "feat",
            desc: "Ajout de suggestions automatiques de fusion de postes.",
          },
          {
            type: "feat",
            desc: "Affichage du détail des postes fusionnés sélectionnés dans les onglets Délai de carence et Contrats.",
          },
        ],
      },
      {
        category: "Synthèse",
        list: [
          {
            type: "feat",
            desc: "Possibilité de sélectionner des jours d'ouverture et fermeture exceptionnels",
          },
          {
            type: "feat",
            desc: "Définir si les jours fériés sont des jours habituellement chômés ou non.",
          },
          {
            type: "ezwin",
            desc: "On affiche le nombre total de salariés du dernier mois plutôt que le dernier effectif CDI et CDD, dans les informations globales.",
          },
          {
            type: "feat",
            desc: "A côté du nom de l'établissement, on indique s'il est ouvert ou fermé.",
          },
        ],
      },
      {
        category: "Contrats",
        list: [
          {
            type: "feat",
            desc: "Affichage du sexe du salarié (H pour Homme, F pour Femme).",
          },
          {
            type: "feat",
            desc: "Si un établissement change de SIRET, la date de début de contrat est désormais la date initiale du contrat, et non la date de changement d'établissement",
          },
        ],
      },
      {
        category: "FAQ",
        list: [
          {
            type: "ezwin",
            desc: "Mise à jour de la FAQ : vous y trouverez désormais des vidéos de démonstration de l'utilisation du site, ainsi que les liens vers les arrêtés sur lesquels s'appuie l'outil.",
          },
        ],
      },
    ],
  },
  {
    date: "2023-10-05",
    news: [
      {
        category: "Nouveau nom !",
        list: [
          {
            type: "feat",
            desc: "Le nouveau nom a été décidé : VisuDSN, pour remplacer Champollion.",
          },
        ],
      },
    ],
  },
  {
    date: "2023-10-03",
    news: [
      {
        category: "Liste des contrats",
        list: [
          {
            type: "feat",
            desc: "Possibilité de supprimer une date de fin de contrat.",
          },
          {
            type: "feat",
            desc: "Possibilité de réinitialiser une date de fin de contrat, pour récupérer la date d'origine et effacer la correction apportée.",
          },
          {
            type: "fix",
            desc: "Prise en compte des dates corrigées dans tous les onglets de l'application (chiffres clés, détection de fraude potentielle).",
          },
        ],
      },
      {
        category: "Recours abusif",
        list: [
          {
            type: "feat",
            desc: "Affichage du détail des postes sélectionné au-dessus de l'histogramme (notamment des postes inclus dans des fusions).",
          },
          {
            type: "chore",
            desc: 'Un bouton "interrupteur" permet de choisir l\'affichage des effectifs entre graphique et tableau (précédemment, le tableau était affiché comme un encart déroulant).',
          },
        ],
      },
      {
        category: "Délai de carence",
        list: [
          {
            type: "feat",
            desc: "Chiffres clés : ratio de contrats en infraction potentielle par rapport au total de contrats étudiés",
          },
          {
            type: "feat",
            desc: "Chiffres clés : répartition des contrats en infraction potentielle par libellé de poste",
          },
        ],
      },
    ],
  },
  {
    date: "2023-09-18",
    news: [
      {
        category: "Page de synthèse",
        list: [
          {
            type: "feat",
            desc: "Chiffres clés : nombre de contrats par nature (CDI, CDD, CTT)",
          },
          {
            type: "feat",
            desc: "Chiffres clés : répartition des jours travaillés par nature de contrat",
          },
          {
            type: "feat",
            desc: "Chiffres clés : répartition des jours travaillés par libellés de poste",
          },
        ],
      },
      {
        category: "Liste des contrats",
        list: [
          {
            type: "feat",
            desc: "Export des contrats au format Excel et CSV (en plus de LibreOffice).",
          },
          {
            type: "ezwin",
            desc: "Dans l'export tableur, les dates sont au format AAAA-MM-JJ pour faciliter le tri par date.",
          },
        ],
      },
      {
        category: "Postes",
        list: [
          {
            type: "feat",
            desc: "Chiffres clés : répartition des jours travaillés par libellés de poste (avec possibilité de filtrer les natures de contrats, motifs de recours, dates).",
          },
          {
            type: "ezwin",
            desc: "Dans les listes déroulantes pour sélectionner les fusions de poste, possibilité de masquer les libellés déjà fusionnés ailleurs.",
          },
        ],
      },
      {
        category: "Pages d'un établissement",
        list: [
          {
            type: "feat",
            desc: "La période par défaut sélectionnée dans les filtres est la dernière année glissante jusqu'à la dernière déclaration DSN de l'établissement connue sur cet outil.",
          },
        ],
      },
      {
        category: "Recours abusif",
        list: [
          {
            type: "feat",
            desc: "Chiffres clés : répartition des jours travaillés par nature de contrat (avec possibilité de filtrer les postes, motifs de recours, dates).",
          },
          {
            type: "fix",
            desc: "Pour éviter les confusions, il est possible de sélectionner des dates uniquement sur les périodes où l'outil a connaissance de la déclaration DSN mensuelle.",
          },
        ],
      },
    ],
  },
  {
    date: "2023-08-04",
    news: [
      {
        category: "Liste des contrats",
        list: [
          {
            type: "feat",
            desc: "Export des contrats d'un établissement au format tableur LibreOffice",
          },
        ],
      },
      {
        category: "Page d'accueil",
        list: [
          {
            type: "feat",
            desc: "Nouvelle page listant les erreurs connues que nous n'avons pas encore corrigées",
          },
          {
            type: "ezwin",
            desc: "Nouveau formulaire de satisfaction et de vote pour les prochaines améliorations à apporter au site.",
          },
        ],
      },
      {
        category: "Postes",
        list: [
          {
            type: "fix",
            desc: "Correctif d'une erreur de sauvegarde des fusions de poste (lorsque de nouvelles fusions contenaient un libellé déjà sauvegardé auparavant dans une autre fusion)",
          },
        ],
      },
      {
        category: "Délai de carence",
        list: [
          {
            type: "ezwin",
            desc: "Ajout des détails de calcul des délais de carence, et d'informations plus complètes sur l'accord de branche étendu sélectionné",
          },
        ],
      },
    ],
  },
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
