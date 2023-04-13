import { useState } from "react"
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router-dom"
import ls from "localstorage-slim"

import { getEtablissementsType, getPostesAta } from "../../../api"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Stepper } from "@codegouvfr/react-dsfr/Stepper"
import AppMultiSelect, { Option } from "../../../components/AppMultiSelect"
import { errorWording, isAppError } from "../../../helpers/errors"

type CarencePostesLoader = {
  options: Option[]
  savedFusions: Option[][]
}

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const duplicatedPostes = Object.values(data)
    .map((x) => (typeof x === "string" ? x.split(",") : ""))
    .filter((x) => x.length > 1)
    .flat()
    .filter((item, index, array) => array.indexOf(item) !== index)
  if (duplicatedPostes.length > 0)
    return {
      message: `Vous ne pouvez pas sélectionner un même libellé dans des fusions différentes :
      ${duplicatedPostes.toString().replace(",", ", ")}`,
    }
  const fusionsLabels = Object.values(data)
    .map((fusion) => (typeof fusion === "string" && fusion.split(",")) || [])
    .filter((fusion) => Array.isArray(fusion) && fusion.length > 1)
  ls.set(`carence.${params.siret}.fusions`, fusionsLabels)
  if (data.navigation === "previous") return redirect("../parametres")
  return redirect("../contrats")
}

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<CarencePostesLoader> {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      statusText: errorWording.etab,
    })
  }

  const etabPostes = await getPostesAta(etabType.id)

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

  const localFusionsLabels = ls.get(`carence.${params.siret}.fusions`) as
    | string[][]
    | null
  const savedFusions: Option[][] = Array.isArray(localFusionsLabels)
    ? localFusionsLabels.map((fusion) =>
        fusion
          .map(
            (label) => options.find((option) => option.label === label) || ({} as Option)
          )
          .filter((option) => Object.keys(option).length > 0)
      )
    : []
  return { options, savedFusions }
}

export default function CarencePostes() {
  const error = useActionData() as { message: string }
  const { options, savedFusions } = useLoaderData() as CarencePostesLoader
  const [fusions, setFusions] = useState(savedFusions)

  const handleAddFusion = () => setFusions([...fusions, []])
  const handleDeleteFusion = (index: number) => {
    const beforeDeletedElement = fusions.slice(0, index)
    const afterDeletedElement = fusions.slice(index + 1)
    setFusions([...beforeDeletedElement, ...afterDeletedElement])
  }

  return (
    <>
      <Stepper
        currentStep={2}
        nextTitle="Vérifier les informations sur les contrats"
        stepCount={3}
        title="Fusionner des postes"
      />
      <Form className="flex flex-col" method="post">
        <p>
          Vous pouvez choisir de fusionner certains libellés de postes correspondant à la
          même identité de poste.
        </p>
        {fusions.length > 0 &&
          fusions.map((fusion, index) => (
            <div
              key={index}
              className="fr-pt-2w fr-px-2w fr-mb-2w border border-solid border-bd-default-grey bg-bg-alt-grey"
            >
              <div className="flex flex-initial items-center">
                <AppMultiSelect
                  className=" fr-mr-2w w-full"
                  options={options}
                  value={fusions[index]}
                  label="Fusionner les postes suivants :"
                  onChange={(newValue) => {
                    const newFusions = fusions.map((fusion, idx) =>
                      idx === index ? [...(newValue as Option[])] : fusion
                    )
                    setFusions(newFusions)
                  }}
                />
                <input
                  type="hidden"
                  name={`fusion-${index}`}
                  value={fusions[index].map((x) => x.label)}
                />
                <div className="fr-mt-1w">
                  <Button
                    iconId="fr-icon-delete-line"
                    type="button"
                    onClick={() => handleDeleteFusion(index)}
                    priority="secondary"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
              <p className="fr-text--sm italic">
                Le nouveau nom du poste ainsi constitué est le 1e libellé sélectionné :{" "}
                {fusion[0]?.label || ""}
              </p>
            </div>
          ))}

        <Button
          className="fr-mt-2w fr-mb-8w"
          iconId="fr-icon-add-line"
          type="button"
          onClick={handleAddFusion}
          priority="secondary"
        >
          Ajouter une fusion
        </Button>
        {!!error && (
          <Alert
            className="fr-mb-2w"
            description={error?.message}
            severity="error"
            title="Erreur"
          />
        )}
        <div className="fr-mt-4w self-end">
          <Button
            className="fr-mr-2w"
            priority="secondary"
            nativeButtonProps={{ name: "navigation", value: "previous" }}
            type="submit"
          >
            Précédent
          </Button>
          <Button nativeButtonProps={{ name: "navigation", value: "next" }} type="submit">
            Suivant
          </Button>
        </div>
      </Form>
    </>
  )
}
