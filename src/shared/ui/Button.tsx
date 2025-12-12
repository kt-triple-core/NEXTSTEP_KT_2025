interface ButtonProps {
  variant?: 'accent' | 'primary' | 'secondary' | 'gradient'
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

const Button = ({
  variant = 'secondary',
  className,
  children,
  ...props
}: ButtonProps) => {
  const base =
    'flex items-center justify-center rounded-md text-14 shrink-0 hover:cursor-pointer'
  const variants = {
    accent: 'bg-accent text-white',
    primary: 'bg-primary text-foreground',
    secondary: 'bg-secondary text-foreground',
    gradient: 'point-gradient text-white',
  }

  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

export default Button
