import html2canvas from "html2canvas"
import FileSaver from "file-saver"
import { AppError } from "../../helpers/errors"
import { EtablissementPoste } from "../../api/types"
import { getFullJobTitle } from "../../helpers/filters"

const captureChart = (
  raisonSociale: string,
  Postes: number[],
  startDate: string,
  endDate: string,
  elementId: string,
  listPostes: AppError | EtablissementPoste[],
  jobListWithoutMerges: EtablissementPoste[],
  queryMotives: number[],
  formattedMergesIds: number[][] | undefined
) => {
  const element: HTMLElement | null = document.querySelector(`#${elementId}`)

  const motivesCodes = [1, 2, 3, 4] as const // make array immutable
  type MotivesCode = (typeof motivesCodes)[number]

  const motivesLabels: Record<MotivesCode, string> = {
    1: "Remplacement d'un salarié",
    2: "Accroissement temporaire d'activité",
    3: "Usage / saisonnier",
    4: "Autre",
  }

  if (element !== null) {
    html2canvas(element, { logging: true }).then((originalCanvas: HTMLCanvasElement) => {
      const newCanvas = document.createElement("canvas")
      newCanvas.width = originalCanvas.width + 50
      newCanvas.height = originalCanvas.height + 400
      const ctx = newCanvas.getContext("2d")

      if (ctx !== null) {
        ctx.drawImage(originalCanvas, 5, 340)
        ctx.fillStyle = "black"
        ctx.font = "30px Arial"
        ctx.fillText("Recours abusif:", 10, 30)
        ctx.font = "20px Arial"

        const PostesFiltres: string[] = []

        if (listPostes && Array.isArray(listPostes)) {
          listPostes.forEach((obj) => {
            Postes.forEach((poste) => {
              if (obj.posteId === poste) {
                if (obj.merged === 1) {
                  PostesFiltres.push(
                    `"${getFullJobTitle(
                      poste,
                      jobListWithoutMerges,
                      formattedMergesIds
                    )}" `
                  )
                } else {
                  PostesFiltres.push(`"${obj.libellePoste}" `)
                }
              }
            })
          })
        }

        const MotivesFilters: string[] = []

        {
          queryMotives.map((motive) => {
            const typedMotive = motive as MotivesCode
            if (motivesCodes.includes(typedMotive)) {
              MotivesFilters.push(`"${motivesLabels[typedMotive]}" `)
            }
          })
        }

        ctx.fillText(`Entreprise : ${raisonSociale}`, 10, 70)
        elementId === "ContractsPieChart"
          ? ctx?.fillText(
              `Répartition des jours travaillés par nature de contrat entre ${startDate} et ${endDate}`,
              10,
              110
            )
          : ctx.fillText(`Periode : ${startDate} au ${endDate}`, 10, 110)

        if (Postes.length > 0) {
          ctx.fillText("Postes:", 10, 190)
          const chunkSize = 5
          const result = []
          const lineNumber = Math.ceil(Postes.length / chunkSize)

          for (let i = 0; i < PostesFiltres.length; i += chunkSize) {
            const chunk = PostesFiltres.slice(i, i + chunkSize)
            result.push(chunk)
          }

          for (let i = 0; i < lineNumber; i += 1) {
            ctx.fillText(`${result[i]}`, 10, 230 + i * 40)
          }
        } else {
          ctx.fillText("Tous les postes", 10, 190)
        }

        queryMotives.length > 0
          ? ctx.fillText(`Motifs de recours : ${MotivesFilters}`, 10, 150)
          : ctx.fillText("Tous les motifs", 10, 150)
      } else {
        console.error("Unable to get 2D context from canvas.")
      }

      let graphType: string

      if (elementId == "ContractsPieChart") {
        graphType = "Natures_de_contrat_les_plus_utilisées"
      } else {
        graphType = "Evolution_des_effectifs"
      }

      newCanvas.toBlob(function (blob) {
        if (blob !== null) {
          FileSaver.saveAs(
            blob,
            `${graphType}_${raisonSociale}_${startDate}_au_${endDate}.png`
          )
        }
      })
    })
  }
}

export default captureChart
