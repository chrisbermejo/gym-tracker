export function kgToLbs(kg: number): number {
    return kg * 2.20462
}

export function lbsToKg(lbs: number): number {
    return lbs / 2.20462
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = totalInches - feet * 12
    return { feet, inches }
}

export function feetInchesToCm(feet: number, inches: number): number {
    return (feet * 12 + inches) * 2.54
}