type AlertProps = {
  className?: string
  id?: string
  description?: string
}

const Alert = ({ className, description, ...rest }: AlertProps) => (
  <div {...rest}>{"Mocked component"}</div>
)

export { Alert }
