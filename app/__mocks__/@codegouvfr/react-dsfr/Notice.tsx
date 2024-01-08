import React from "react"

type NoticeProps = {
  className?: string
  id?: string
  description?: string
  title: NonNullable<React.ReactNode>
}

const Notice = ({ className, title, description, ...rest }: NoticeProps) => (
  <div {...rest} data-testid="custom-notice-element">
    {title}
  </div>
)

export { Notice }
