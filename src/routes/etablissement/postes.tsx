import { useEffect, useState } from "react"
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router-dom"
import { useEtabId } from "."

import {
  formatEffectifs,
  unitsOptions,
  getUnitOptionFromKey,
} from "../../helpers/effectifs"
import {
  formatContrats,
  getPostesOptionsFromQuery,
  getQueryPage,
  getQueryPostes,
  headers,
} from "../../helpers/contrats"
import { getEffectifs, getContratsEtu, getPostes, getEtablissementsType } from "../../api"
import { Effectif, EffectifUnit, EtuContrat, MetaData } from "../../api/types"
import { AppError, errorWording, isAppError } from "../../helpers/errors"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Pagination } from "@codegouvfr/react-dsfr/Pagination"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"
import { Select } from "@codegouvfr/react-dsfr/Select"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"
import EffectifBarChart from "../../components/EffectifBarChart"
import AppTable from "../../components/AppTable"

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<EtabPostesLoader> {
  // fetch etablissement postes
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      statusText: errorWording.etab,
    })
  }

  const etabPostes = await getPostes(etabType.id)

  if (isAppError(etabPostes)) {
    const responseParams: ResponseInit = {
      statusText: errorWording.etab,
    }
    if (etabPostes.status) responseParams.status = etabPostes.status
    if (etabPostes.status == 404) responseParams.statusText = "Postes introuvables."
    throw new Response("", responseParams)
  }

  const options = etabPostes.map(
    (poste, index) => ({ value: index, label: poste.libelle } as Option)
  )

  // fetch contrats for selected postes if any
  const { searchParams } = new URL(request.url)
  const queryPostes = getQueryPostes(searchParams)
  const postes = queryPostes ? queryPostes.split(",") : []

  let contratsData:
    | AppError
    | {
        contrats: EtuContrat[]
        meta: MetaData
      }
    | undefined = undefined

  if (postes.length > 0) {
    const page = getQueryPage(searchParams)

    contratsData = await getContratsEtu({
      id: etabType.id,
      startMonth: "2022-01-01",
      endMonth: "2022-12-01",
      postes,
      page,
    })
  }
  return {
    contratsData,
    options,
    queryPostes,
  }
}

type EtabPostesLoader = {
  contratsData:
    | AppError
    | {
        contrats: EtuContrat[]
        meta: MetaData
      }
    | undefined
  options: Option[]
  queryPostes: string
}

export default function EtabPostes() {
  const { state } = useNavigation()
  const { etabId } = useEtabId()
  const {
    contratsData,
    options,
    queryPostes: initialQueryPostes,
  } = useLoaderData() as EtabPostesLoader
  const [searchParams, setSearchParams] = useSearchParams()

  const [queryPostes, setQueryPostes] = useState(initialQueryPostes)
  const initialPosteOptions = getPostesOptionsFromQuery(queryPostes, options)
  const [selectedOptions, setSelectedOptions] = useState(initialPosteOptions) // updated live when Select changes
  const [selectedPostes, setSelectedPostes] = useState(initialPosteOptions) // updated only when validation button is clicked

  const [unitValue, setUnitValue] = useState("tot" as EffectifUnit)
  const [effectifsData, setEffectifsData] = useState(
    undefined as AppError | Effectif[] | undefined
  )

  const handlePostesValidated = async () => {
    setSelectedPostes([...selectedOptions])

    if (selectedOptions.length > 0) {
      const postes = selectedOptions.map((option) => option.label)

      const effectifs = await getEffectifs({
        id: etabId,
        startMonth: "2022-01-01",
        endMonth: "2022-12-01",
        unit: unitValue,
        postes,
      })
      setEffectifsData(effectifs)

      const encodedPostes = selectedOptions.map((option) =>
        encodeURIComponent(option.label)
      )
      setQueryPostes(encodedPostes.join(","))
      setSearchParams({ page: "1", postes: encodedPostes.join(",") })
    } else {
      setSearchParams({})
    }
  }

  useEffect(() => {
    const queryPostes = decodeURIComponent(searchParams.get("postes") ?? "")
    const newPostesFromUrl = getPostesOptionsFromQuery(queryPostes, options)
    setSelectedOptions(newPostesFromUrl)
    setSelectedPostes(newPostesFromUrl)
  }, [searchParams.get("postes")])

  useEffect(() => {
    if (
      selectedPostes.length > 0 &&
      formatContrats.length > 0 &&
      effectifsData === undefined
    ) {
      const postes = selectedPostes.map((option) => option.label)

      const fetchData = async () => {
        const effectifs = await getEffectifs({
          id: etabId,
          startMonth: "2022-01-01",
          endMonth: "2022-12-01",
          unit: unitValue,
          postes,
        })
        setEffectifsData(effectifs)
      }
      fetchData()
    }
  }, [])

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Sélection du poste</h2>
        <hr />
        <AppMultiSelect
          options={options}
          value={selectedOptions}
          label="Poste(s)"
          hintText="Sélectionnez un ou plusieurs postes dans la liste"
          onChange={(newValue) => setSelectedOptions([...(newValue as Option[])])}
        />
        <Button
          disabled={selectedOptions.length == 0 && selectedPostes.length == 0}
          onClick={handlePostesValidated}
          type="button"
        >
          Valider la sélection
        </Button>
      </div>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Évolution des effectifs</h2>
        <hr />
        {selectedPostes.length === 0 || effectifsData === undefined ? (
          <p className="italic text-tx-disabled-grey">
            Veuillez sélectionner un ou plusieurs postes.
          </p>
        ) : isAppError(effectifsData) ? (
          <Alert
            className="fr-mb-2w"
            description="Pas de données disponibles"
            severity="error"
            title="Erreur"
          />
        ) : (
          <EtabPostesEffectifs
            defaultData={effectifsData}
            selectedPostes={selectedPostes}
            onUnitChange={(unit) => setUnitValue(unit)}
          />
        )}
      </div>
      <div>
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Liste des contrats déclarés</h2>
        <hr />
        {selectedPostes.length === 0 || contratsData === undefined ? (
          <p className="italic text-tx-disabled-grey">
            Veuillez sélectionner un ou plusieurs postes.
          </p>
        ) : state === "loading" ? (
          <p>En cours de chargement...</p>
        ) : isAppError(contratsData) ? (
          <>
            <p className="text-tx-disabled-grey">
              Une erreur est survenue, aucun contrat n'a été trouvé pour les paramètres
              sélectionnés.
            </p>
            <Button linkProps={{ to: "" }} priority="secondary">
              Réinitialiser les paramètres
            </Button>
          </>
        ) : (
          <EtabPostesContrats
            contrats={contratsData.contrats}
            meta={contratsData.meta}
            queryPostes={queryPostes}
            defaultPage={getQueryPage(searchParams)}
          />
        )}
      </div>
    </>
  )
}

function EtabPostesEffectifs({
  defaultData,
  selectedPostes,
  onUnitChange,
}: {
  defaultData: Effectif[]
  selectedPostes: Option[]
  onUnitChange: (unitValue: EffectifUnit) => void
}) {
  const { etabId } = useEtabId()

  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const [unit, setUnit] = useState({ key: 1, option: getUnitOptionFromKey(1) })
  const [effectifsData, setEffectifsData] = useState(formatEffectifs(defaultData))
  const [isEffectifError, setIsEffectifError] = useState(false)

  const handleUnitSelected = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = Number(event.target.value)
    const newUnitOption = getUnitOptionFromKey(newKey)

    setUnit({ key: newKey, option: newUnitOption })
    onUnitChange(newUnitOption.value ?? "tot")
    const postes = selectedPostes.map((poste) => poste.label)

    const newData = await getEffectifs({
      id: etabId,
      startMonth: "2022-01-01",
      endMonth: "2022-12-01",
      unit: newUnitOption?.value || "tot",
      postes,
    })
    if (!isAppError(newData)) {
      setEffectifsData(formatEffectifs(newData))
      setIsEffectifError(false)
    } else setIsEffectifError(true)
  }

  return (
    <>
      <div className="fr-mb-2w lg:columns-2">
        <Select
          className="md:w-3/4"
          label="Unité des effectifs mensuels"
          nativeSelectProps={{
            onChange: handleUnitSelected,
            value: unit.key,
          }}
        >
          {unitsOptions.map(({ key, label, attr }) => (
            <option {...attr} key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <ToggleSwitch
          label="Superposer les barres des CDD et CTT"
          checked={areTempContractsStacked}
          onChange={(checked) => setAreTempContractsStacked(checked)}
        />
      </div>
      {isEffectifError ? (
        <Alert
          className="fr-mb-2w"
          description={errorWording.errorOccurred}
          severity="error"
          title="Erreur"
        />
      ) : (
        <div className="h-[500px]">
          <EffectifBarChart
            isStacked={areTempContractsStacked}
            unit="contrats"
            data={effectifsData}
          />
        </div>
      )}
    </>
  )
}

function EtabPostesContrats({
  contrats,
  meta,
  queryPostes,
  defaultPage,
}: {
  contrats: EtuContrat[]
  meta: MetaData
  queryPostes: string
  defaultPage: number
}) {
  const formattedContrats = formatContrats(contrats)

  return (
    <>
      {meta.totalCount > 0 ? (
        <>
          <p>{meta.totalCount} résultats</p>
          <AppTable headers={headers} items={formattedContrats} />
          {meta.totalPages > 1 && (
            <Pagination
              count={meta.totalPages}
              defaultPage={defaultPage}
              getPageLinkProps={(page) => {
                return {
                  to: { search: `?page=${page}&postes=${queryPostes}` },
                }
              }}
              showFirstLast
              classes={{
                list: "justify-center",
              }}
            />
          )}
        </>
      ) : (
        <p>Aucun résultat.</p>
      )}
    </>
  )
}
