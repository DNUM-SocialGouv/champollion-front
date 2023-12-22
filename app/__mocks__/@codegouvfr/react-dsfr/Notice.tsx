type NoticeProps = {
  className?: string
  id?: string
  description?: string
}

const Notice = ({ className, description, ...rest }: NoticeProps) => (
  <div {...rest}>{"Mocked component"}</div>
)

export { Notice }
