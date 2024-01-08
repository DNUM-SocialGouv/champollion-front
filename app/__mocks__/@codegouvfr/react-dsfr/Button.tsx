import React from "react"

type ButtonProps = {
  iconId?: string
  iconPosition?: string
  nativeButtonProps?: string
  linkProps?: any

  [key: string]: any
}

const Button = ({
  iconId,
  iconPosition,
  nativeButtonProps,
  linkProps,
  children,
  ...rest
}: ButtonProps) => (
  <button data-testid="mocked-Button" {...rest}>
    {children}
  </button>
)

export { Button }
