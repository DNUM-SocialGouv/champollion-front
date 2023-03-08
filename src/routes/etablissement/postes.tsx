import { useEffect, useState } from "react"
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router-dom"

import Button from "@codegouvfr/react-dsfr/Button"
import Pagination from "@codegouvfr/react-dsfr/Pagination"
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch"
import Select from "@codegouvfr/react-dsfr/Select"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"
import EffectifBarChart, { MonthData } from "../../components/EffectifBarChart"
import AppTable from "../../components/AppTable"
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
import { EtuContrat } from "../../api/types"
import { useEtabId } from "."

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<EtabPostesLoader> {
  // fetch etablissement postes
  const siret = params.siret ? String(params.siret) : ""
  const { id: etabId } = await getEtablissementsType(siret)
  const etabPostes = await getPostes(etabId)
  const options = etabPostes.map(
    (poste, index) => ({ value: index, label: poste.libelle } as Option)
  )

  // fetch contrats for selected postes if any
  const { searchParams } = new URL(request.url)
  const queryPostes = getQueryPostes(searchParams)
  const postes = queryPostes ? queryPostes.split(",") : []

  let contrats: EtuContrat[] = [],
    nbContrats = 0,
    totalContratsPages = 1,
    isContratsError = false

  if (postes.length > 0) {
    const page = getQueryPage(searchParams)

    try {
      const { data, meta } = await getContratsEtu({
        id: etabId,
        startMonth: "2022-01-01",
        endMonth: "2022-12-01",
        postes,
        page,
      })
      contrats = data
      nbContrats = meta.totalCount
      totalContratsPages = meta.totalPages
    } catch (err) {
      isContratsError = true
    }
  }
  return {
    contrats,
    isContratsError,
    nbContrats,
    options,
    queryPostes,
    totalContratsPages,
  }
}

type EtabPostesLoader = {
  contrats: EtuContrat[]
  isContratsError: boolean
  nbContrats: number
  options: Option[]
  queryPostes: string
  totalContratsPages: number
}

export default function EtabPostes() {
  const { state } = useNavigation()
  const { etabId } = useEtabId()
  const {
    contrats,
    isContratsError,
    nbContrats,
    options,
    queryPostes: initialQueryPostes,
    totalContratsPages,
  } = useLoaderData() as EtabPostesLoader
  const [searchParams, setSearchParams] = useSearchParams()

  const [queryPostes, setQueryPostes] = useState(initialQueryPostes)
  const initialPosteOptions = getPostesOptionsFromQuery(queryPostes, options)
  const [selectedOptions, setSelectedOptions] = useState(initialPosteOptions) // updated live when Select changes
  const [selectedPostes, setSelectedPostes] = useState(initialPosteOptions) // updated only when validation button is clicked

  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const [unit, setUnit] = useState({ key: 1, option: getUnitOptionFromKey(1) })
  const [effectifsData, setEffectifsData] = useState([] as MonthData[])

  const formattedContrats = formatContrats(contrats)

  const handleUnitSelected = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = Number(event.target.value)
    const newUnitOption = getUnitOptionFromKey(newKey)

    setUnit({ key: newKey, option: newUnitOption })
    const postes = selectedPostes.map((poste) => poste.label)

    const newData = await getEffectifs({
      id: etabId,
      startMonth: "2022-01-01",
      endMonth: "2022-12-01",
      unit: newUnitOption?.value || "tot",
      postes,
    })
    setEffectifsData(formatEffectifs(newData))
  }

  const handlePostesValidated = async () => {
    setSelectedPostes([...selectedOptions])

    if (selectedOptions.length > 0) {
      const postes = selectedOptions.map((option) => option.label)

      const effectifs = await getEffectifs({
        id: etabId,
        startMonth: "2022-01-01",
        endMonth: "2022-12-01",
        unit: unit.option?.value || "tot",
        postes,
      })
      setEffectifsData(formatEffectifs(effectifs))

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
      effectifsData.length === 0
    ) {
      const postes = selectedPostes.map((option) => option.label)

      const fetchData = async () => {
        const effectifs = await getEffectifs({
          id: etabId,
          startMonth: "2022-01-01",
          endMonth: "2022-12-01",
          unit: unit.option?.value || "tot",
          postes,
        })
        setEffectifsData(formatEffectifs(effectifs))
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
          onChange={(newValue: readonly Option[]) => setSelectedOptions([...newValue])}
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
        {selectedPostes.length > 0 ? (
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
            <div className="h-[500px]">
              <EffectifBarChart
                isStacked={areTempContractsStacked}
                unit="contrats"
                data={effectifsData}
              />
            </div>
          </>
        ) : (
          <p className="italic text-tx-disabled-grey">
            Veuillez sélectionner un ou plusieurs postes.
          </p>
        )}
      </div>
      <div>
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Liste des contrats déclarés</h2>
        <hr />
        {selectedPostes.length === 0 ? (
          <p className="italic text-tx-disabled-grey">
            Veuillez sélectionner un ou plusieurs postes.
          </p>
        ) : state === "loading" ? (
          <p>En cours de chargement...</p>
        ) : isContratsError ? (
          <>
            <p className="text-tx-disabled-grey">
              Une erreur est survenue, aucun contrat n'a été trouvé pour les paramètres
              sélectionnés.
            </p>
            <Button linkProps={{ to: "" }} priority="secondary">
              Réinitialiser les paramètres
            </Button>
          </>
        ) : totalContratsPages && nbContrats ? (
          <>
            <p>{nbContrats} résultats</p>
            <AppTable headers={headers} items={formattedContrats} />
            {totalContratsPages && (
              <Pagination
                count={totalContratsPages}
                defaultPage={getQueryPage(searchParams)}
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
      </div>
    </>
  )
}
