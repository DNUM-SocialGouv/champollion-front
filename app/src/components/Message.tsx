import Notice from "@codegouvfr/react-dsfr/Notice"
import React from "react"

interface MessageComponentProps {
  title: () => React.ReactNode
}

const MessageComponent: React.FC<MessageComponentProps> = ({ title }) => {
  const titleContent = title()
  if (titleContent === null || titleContent === undefined) return null
  if (import.meta.env.APP_URL === "visudsn.dev.intranet.travail.gouv.fr") {
    return <Notice classes={{ title: "font-normal" }} title={titleContent} isClosable />
  }
  return null
}
export default MessageComponent
