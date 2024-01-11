import React from "react"

type NoticeProps = {
  className?: string
  id?: string
  description?: string
  isClosable?: false
  title: NonNullable<React.ReactNode>
}

const Notice = ({ className, title, isClosable, description, ...rest }: NoticeProps) => (
  <div {...rest} data-testid="custom-notice-element">
    {title}
  </div>
)

export { Notice }
