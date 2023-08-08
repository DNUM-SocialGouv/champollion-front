import type { ReactNode } from "react"
import { Link, redirect, useLoaderData } from "react-router-dom"
import type { LoaderFunctionArgs } from "react-router-dom"

import {
  getEtablissementsInfo,
  getEtablissementsType,
  getContratsEtt,
  getEffectifsLast,
} from "../api"
import type {
  EtablissementInfo,
  EttContrat,
  LastEffectif,
  PaginationMetaData,
} from "../api/types"
import type { AppError } from "../helpers/errors"
import { errorWording, isAppError } from "../helpers/errors"
import { formatDate } from "../helpers/format"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Pagination } from "@codegouvfr/react-dsfr/Pagination"

import EtabBanner from "../components/EtabBanner"
import EtabInfo from "../components/EtabInfo"
import AppTable from "../components/AppTable"

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<Response | ETTLoader> {
  const siret = params.siret ? String(params.siret) : ""
  const page = params.page && Number(params.page) ? Number(params.page) : 1

  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    const responseParams: ResponseInit = {
      statusText: etabType.messageFr ?? errorWording.etab,
    }
    if (etabType.status) responseParams.status = etabType.status
    if (etabType.status == 404) responseParams.statusText = "SIRET introuvable."
    throw new Response("", responseParams)
  }

  if (!etabType.ett) {
    return redirect(`/etablissement/${siret}`)
  }

  const [info, lastEffectif, data] = await Promise.all([
    getEtablissementsInfo(etabType.id),
    getEffectifsLast(etabType.id),
    getContratsEtt({
      id: etabType.id,
      page,
    }),
  ])
  return {
    info,
    lastEffectif,
    page,
    raisonSociale: etabType.raisonSociale,
    siret,
    data,
  }
}

type ETTLoader = {
  info: EtablissementInfo | AppError
  lastEffectif: LastEffectif | AppError
  page: number
  raisonSociale: string
  siret: string
  data:
    | AppError
    | {
        contrats: EttContrat[]
        meta: PaginationMetaData
      }
}

type Column = "poste" | "etu" | "employee" | "startDate" | "endDate" | "motive"

type ContratsHeader = {
  key: Column
  label: string
  width: string
}

const headers = [
  { key: "poste", label: "Poste", width: "10%" },
  { key: "etu", label: "Etablissement utilisateur", width: "15%" },
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "endDate", label: "Date de fin", width: "10%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
] as ContratsHeader[]

type FormattedContrat = {
  id: number
  poste: string
  etu: ReactNode
  employee: string
  startDate: string
  endDate: string | null
  motive: string | null
}

export default function ETT() {
  const { data, info, lastEffectif, raisonSociale, siret } = useLoaderData() as ETTLoader

  return (
    <div className="flex w-full flex-col">
      <EtabBanner etabName={raisonSociale} isEtt={true} siret={siret} />
      <div className="fr-container fr-mt-3w">
        <h2 className="fr-text--xl fr-mb-1w">Informations sur l'établissement</h2>
        <hr />
        {isAppError(info) ? (
          <>
            <Alert
              className="fr-mb-2w"
              description="Pas de données disponibles"
              severity="error"
              title="Erreur"
            />
          </>
        ) : (
          <EtabInfo
            info={info}
            siret={siret}
            lastEffectif={(!isAppError(lastEffectif) && lastEffectif) || null}
          />
        )}
        <h2 className="fr-text--xl fr-mt-3w fr-mb-1w">
          Liste des contrats de mission déclarés
        </h2>
        <hr />
        {isAppError(data) ? (
          <>
            <Alert
              className="fr-mb-2w"
              description={errorWording.etab}
              severity="error"
              title="Erreur"
            />
          </>
        ) : (
          <ETTContrats contrats={data.contrats} meta={data.meta} />
        )}
      </div>
    </div>
  )
}

function ETTContrats({
  contrats,
  meta,
}: {
  contrats: EttContrat[]
  meta: PaginationMetaData
}) {
  const { page, siret } = useLoaderData() as ETTLoader

  const formatContrats = (items: EttContrat[]) =>
    items.map((contrat) => {
      const etu = contrat.etuSiret ? (
        <Link to={`/etablissement/${contrat.etuSiret}`}>
          {contrat.etuRaisonSociale} ({contrat.etuCodePostal})
        </Link>
      ) : (
        <></>
      )
      return {
        id: contrat.id,
        poste: contrat.libellePoste,
        etu,
        employee: `${contrat.prenoms} ${contrat.nomFamille}`,
        startDate: formatDate(contrat.dateDebut),
        endDate: formatDate(contrat.dateFin),
        motive: contrat.libelleMotifRecours,
      } as FormattedContrat
    })
  const formattedContrats = contrats.length > 0 ? formatContrats(contrats) : []

  return (
    <>
      {meta?.totalCount && formatContrats.length > 0 ? (
        <>
          <p>{meta.totalCount} résultats</p>
          <AppTable headers={headers} items={formattedContrats} />
          <Pagination
            count={meta.totalPages}
            defaultPage={page}
            getPageLinkProps={(page) => ({ to: `/ett/${siret}/${page}` })}
            showFirstLast
            classes={{
              list: "justify-center",
            }}
          />
        </>
      ) : (
        <p>Aucun résultat</p>
      )}
    </>
  )
}
