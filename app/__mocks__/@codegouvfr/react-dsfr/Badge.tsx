import { AlertProps } from "@codegouvfr/react-dsfr/Alert"
import { CSSProperties, ReactNode } from "react"

export type BadgeProps = {
  id?: string
  className?: string
  style?: CSSProperties
  severity?: AlertProps.Severity | "new"
  noIcon?: boolean
  as?: "p" | "span"
  children: NonNullable<ReactNode>
}

const Badge = ({ className, style, severity }: BadgeProps) => <div>{"Mocked Badge"}</div>

export { Badge }
