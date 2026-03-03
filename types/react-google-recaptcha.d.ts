declare module "react-google-recaptcha" {
  import * as React from "react"

  export interface ReCAPTCHAProps {
    sitekey: string
    theme?: "light" | "dark"
    size?: "compact" | "normal" | "invisible"
    tabindex?: number
    onChange?: (value: string | null) => void
    onExpired?: () => void
    onErrored?: () => void
    hl?: string
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
    reset(): void
    execute(): void
    executeAsync(): Promise<string | null>
  }
}

