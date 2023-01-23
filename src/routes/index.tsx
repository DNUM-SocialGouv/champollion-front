import { useState } from "react"
import { Button } from "@codegouvfr/react-dsfr/Button"

export default function Index() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex w-full flex-col items-center">
      <h1 className={"fr-m-10v"}>Champollion - Précarité</h1>
      <Button onClick={() => setCount((count) => count + 1)}>Compteur {count}</Button>
    </div>
  )
}
