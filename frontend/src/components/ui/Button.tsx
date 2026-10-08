import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'border border-line text-ink hover:bg-surface-muted',
    danger: 'text-red-600 hover:underline',
    ghost: 'text-ink underline hover:text-primary',
}

function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
    return (
        <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]} ${className}`}
            {...props}
        />
    )
}

export default Button