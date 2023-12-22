import { InputHTMLAttributes } from "react"

type InputProps = {
  className?: string
  id?: string
  label?: string
  nativeInputProps: {
    label: string
    nativeInputProps?: InputHTMLAttributes<HTMLInputElement>
    // Include other props as needed
  }
}

const Input = ({ className, label, nativeInputProps, ...rest }: InputProps) => (
  <div {...rest}>{"Mocked component"}</div>
)

export { Input }
