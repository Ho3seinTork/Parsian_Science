import logo from '@/assets/logo.png'

type FlaskLogoProps = {
  className?: string
}

// Keep the existing brand slot and consumer sizing; the supplied artwork is used unchanged.
const FlaskLogo = ({ className }: FlaskLogoProps): React.JSX.Element => (
  <img src={logo} alt="" aria-hidden="true" draggable={false} className={className} />
)

export { FlaskLogo }
