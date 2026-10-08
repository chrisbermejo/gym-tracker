import type { InputHTMLAttributes } from 'react'

function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-primary ${className}`}
            {...props}
        />
    )
}

export default Input