import html2canvas from "html2canvas"
import FileSaver from "file-saver"
import { AppError } from "../../helpers/errors"
import { EtablissementPoste } from "../../api/types"
import { getLibellePosteById } from "../../helpers/postes"
import { getFullJobTitle } from "../../helpers/filters"
import { formatDate } from "../../helpers/date"

enum MotivesCode {
  Replacement = 1,
  TemporaryIncrease,
  SeasonalUse,
  Other,
}

const motivesLabels: Record<MotivesCode, string> = {
  [MotivesCode.Replacement]: "Remplacement d'un salarié",
  [MotivesCode.TemporaryIncrease]: "Accroissement temporaire d'activité",
  [MotivesCode.SeasonalUse]: "Usage / saisonnier",
  [MotivesCode.Other]: "Autre",
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  const splitText = text.split(" ")
  let line = ""
  splitText.forEach((word) => {
    const testLine = line + word + " "
    const metrics = context.measureText(testLine)
    if (metrics.width > maxWidth && line !== "") {
      context.fillText(line, x, y)
      line = word + " "
      y += 20
    } else {
      line = testLine
    }
  })
  context.fillText(line, x, y)
  return y + 20 // Return the Y position for the next line
}

async function captureChart(
  raisonSociale: string,
  postes: number[],
  startDate: string,
  endDate: string,
  elementId: string,
  listPostes: AppError | EtablissementPoste[],
  jobListWithoutMerges: EtablissementPoste[],
  queryMotives: number[],
  formattedMergesIds?: number[][]
) {
  const element = document.querySelector(`#${elementId}`) as HTMLElement
  if (!element) return

  try {
    const originalCanvas = await html2canvas(element, { logging: true })
    const newCanvas = document.createElement("canvas")
    const context = newCanvas.getContext("2d")
    if (!context) throw new Error("Failed to get canvas context")

    newCanvas.width = originalCanvas.width + 400
    newCanvas.height = originalCanvas.height + 600

    const postesLabels = preparePostesLabels(
      postes,
      listPostes,
      jobListWithoutMerges,
      formattedMergesIds
    )
    const motivesLabels = prepareMotivesLabels(queryMotives)

    drawCanvasContent(
      context,
      originalCanvas,
      raisonSociale,
      startDate,
      endDate,
      postesLabels,
      motivesLabels
    )

    const graphType =
      elementId === "ContractsPieChart"
        ? "Natures_de_contrat_les_plus_utilisées"
        : "Evolution_des_effectifs"
    saveCanvasAsImage(newCanvas, graphType, raisonSociale, startDate, endDate)
  } catch (error) {
    console.error(error)
  }
}

const preparePostesLabels = (
  postes: number[],
  listPostes: AppError | EtablissementPoste[],
  jobListWithoutMerges: EtablissementPoste[],
  formattedMergesIds?: number[][]
): string[] => {
  return postes
    .map((post) =>
      formattedMergesIds?.flat()?.includes(post)
        ? getFullJobTitle(post, jobListWithoutMerges, formattedMergesIds)
        : getLibellePosteById(post, listPostes)
    )
    .filter((label): label is string => label !== undefined)
}

const prepareMotivesLabels = (queryMotives: number[]): string[] => {
  return queryMotives
    .filter((motive) => Object.values(MotivesCode).includes(motive as MotivesCode))
    .map((motive) => `${motivesLabels[motive as MotivesCode]}`)
}

const drawCanvasContent = (
  ctx: CanvasRenderingContext2D,
  originalCanvas: HTMLCanvasElement,
  raisonSociale: string,
  startDate: string,
  endDate: string,
  postesLabels: string[],
  motivesLabels: string[]
) => {
  const maxWidth = originalCanvas.width + 400 - 10
  ctx.drawImage(originalCanvas, 5, 340)
  ctx.fillStyle = "black"
  ctx.font = "32px Arial"
  ctx.textBaseline = "bottom"

  let yPos = drawText(
    ctx,
    `Recours abusif - ${raisonSociale} entre le ${formatDate(
      startDate
    )} et le ${formatDate(endDate)}`,
    10,
    30,
    maxWidth
  )

  ctx.font = "28px Arial"

  yPos += 10

  yPos = drawSection(ctx, "Postes:", postesLabels, yPos, maxWidth)

  drawSection(ctx, "Motifs de recours:", motivesLabels, yPos, maxWidth)
}
const drawSection = (
  ctx: CanvasRenderingContext2D,
  header: string,
  items: string[],
  startY: number,
  maxWidth: number
): number => {
  let yPos = startY + 20 // Commence un peu plus bas que la position de départ
  ctx.fillText(header, 10, startY) // Dessine l'en-tête
  yPos += 10
  if (items.length === 0) {
    yPos = drawText(ctx, "Tous", 10, yPos, maxWidth) + 10
  } else {
    items.forEach((item) => {
      yPos = drawText(ctx, "- " + item, 10, yPos, maxWidth) + 10 // Espace supplémentaire entre les éléments
    })
  }

  return yPos // Retourne la position Y mise à jour pour une utilisation ultérieure
}

const saveCanvasAsImage = (
  canvas: HTMLCanvasElement,
  graphType: string,
  raisonSociale: string,
  startDate: string,
  endDate: string
) => {
  canvas.toBlob((blob) => {
    if (blob) {
      FileSaver.saveAs(
        blob,
        `${graphType}_${raisonSociale}_${startDate}_au_${endDate}.png`
      )
    }
  })
}

export default captureChart
