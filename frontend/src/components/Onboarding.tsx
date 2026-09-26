import { useState, type SyntheticEvent } from 'react'
import { kgToLbs, lbsToKg, cmToFeetInches, feetInchesToCm } from '../utils/units'

type WeightUnit = 'kg' | 'lbs'
type HeightUnit = 'cm' | 'ft'

function Onboarding({ onDone }: { onDone: () => void }) {
    const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
    const [weight, setWeight] = useState('')

    const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm')
    const [heightCm, setHeightCm] = useState('')
    const [heightFt, setHeightFt] = useState('')
    const [heightIn, setHeightIn] = useState('')

    const [error, setError] = useState('')

    const switchWeightUnit = (unit: WeightUnit) => {
        if (unit === weightUnit) return
        const value = Number(weight)
        if (weight !== '' && !Number.isNaN(value)) {
            setWeight((unit === 'lbs' ? kgToLbs(value) : lbsToKg(value)).toFixed(1))
        }
        setWeightUnit(unit)
    }

    const switchHeightUnit = (unit: HeightUnit) => {
        if (unit === heightUnit) return
        if (unit === 'ft') {
            const cm = Number(heightCm)
            if (heightCm !== '' && !Number.isNaN(cm)) {
                const { feet, inches } = cmToFeetInches(cm)
                setHeightFt(String(feet))
                setHeightIn(inches.toFixed(1))
            }
        } else {
            if (heightFt !== '' || heightIn !== '') {
                setHeightCm(feetInchesToCm(Number(heightFt) || 0, Number(heightIn) || 0).toFixed(1))
            }
        }
        setHeightUnit(unit)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        const weightKg = weightUnit === 'kg' ? Number(weight) : lbsToKg(Number(weight))
        const heightCmValue = heightUnit === 'cm' ? Number(heightCm) : feetInchesToCm(Number(heightFt) || 0, Number(heightIn) || 0)

        const res = await fetch('/api/users/me/onboarding', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: weightKg, height: heightCmValue }),
        })

        if (!res.ok) {
            setError('Please enter valid numbers.')
            return
        }

        onDone()
    }

    return (
        <div className='flex items-center justify-center'>
            <div className="flex flex-col gap-3 max-w-xs w-full">
                <h1 className="text-4xl font-bold text-blue-600">Welcome!</h1>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span>Weight</span>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => switchWeightUnit('kg')} className={weightUnit === 'kg' ? 'font-bold underline' : ''}>kg</button>
                                <button type="button" onClick={() => switchWeightUnit('lbs')} className={weightUnit === 'lbs' ? 'font-bold underline' : ''}>lbs</button>
                            </div>
                        </div>
                        <input
                            className="border rounded px-2 py-1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            type="number"
                            step="0.1"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span>Height</span>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => switchHeightUnit('cm')} className={heightUnit === 'cm' ? 'font-bold underline' : ''}>cm</button>
                                <button type="button" onClick={() => switchHeightUnit('ft')} className={heightUnit === 'ft' ? 'font-bold underline' : ''}>ft/in</button>
                            </div>
                        </div>
                        {heightUnit === 'cm' ? (
                            <input
                                className="border rounded px-2 py-1"
                                value={heightCm}
                                onChange={(e) => setHeightCm(e.target.value)}
                                type="number"
                                step="0.1"
                                required
                            />
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    className="border rounded px-2 py-1 w-full"
                                    value={heightFt}
                                    onChange={(e) => setHeightFt(e.target.value)}
                                    type="number"
                                    placeholder="ft"
                                    required
                                />
                                <input
                                    className="border rounded px-2 py-1 w-full"
                                    value={heightIn}
                                    onChange={(e) => setHeightIn(e.target.value)}
                                    type="number"
                                    step="0.1"
                                    placeholder="in"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-600">{error}</p>}
                    <button className="bg-blue-600 text-white rounded px-3 py-1" type="submit">
                        Continue
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Onboarding