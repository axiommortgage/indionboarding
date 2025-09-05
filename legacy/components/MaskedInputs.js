import MaskedInput from 'react-text-mask'

export const PhoneInput = ({ ...inputProps }) => {
  return (
    <MaskedInput mask={[/[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]} {...inputProps} />
  )
}

export const SinInput = ({ ...inputProps }) => {
  return <MaskedInput mask={[/[1-9]/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/]} {...inputProps} />
}
