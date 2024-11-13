import React from 'react'
import PropTypes from 'prop-types'
import { StyledButton } from './styles'

const Button = ({ children, onClick, variant = 'primary', ...props }) => {
  return (
    <StyledButton onClick={onClick} variant={variant} {...props}>
      {children}
    </StyledButton>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
}

export default Button 