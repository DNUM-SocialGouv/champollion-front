// __mocks__/@codegouvfr/react-dsfr/Button.tsx

import React from "react"

// Assuming ButtonProps is the type for your Button component's props.
// Adjust this type according to your actual props.
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
  ...rest
}: ButtonProps) => (
  <button data-testid="mocked-Button" {...rest}>
    Mocked Button
  </button>
)

export { Button }
