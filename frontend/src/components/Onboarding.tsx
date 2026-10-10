import { useState, type SyntheticEvent } from 'react'
import { lbsToKg, feetInchesToCm } from '../utils/units'

import Button from './ui/Button'
import Input from './ui/Input'

type UnitSystem = 'metric' | 'imperial'

function Onboarding({ onDone }: { onDone: () => void }) {
    const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
    const [weight, setWeight] = useState('')
    const [heightCm, setHeightCm] = useState('')
    const [heightFt, setHeightFt] = useState('')
    const [heightIn, setHeightIn] = useState('')
    const [error, setError] = useState('')

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        const weightKg = unitSystem === 'metric' ? Number(weight) : lbsToKg(Number(weight))
        const heightCmValue =
            unitSystem === 'metric' ? Number(heightCm) : feetInchesToCm(Number(heightFt) || 0, Number(heightIn) || 0)

        const res = await fetch('/api/users/me/onboarding', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: weightKg, height: heightCmValue, unit_system: unitSystem }),
        })

        if (!res.ok) {
            setError('Please enter valid numbers.')
            return
        }

        onDone()
    }

    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-col gap-3 max-w-xs w-full">
                <h1 className="text-4xl font-bold text-primary text-center">Welcome!</h1>

                <div className="flex flex-col gap-1">
                    <span>Units</span>
                    <div className="flex gap-1 w-full">
                        <Button className='flex-1' variant={unitSystem === 'metric' ? 'primary' : 'secondary'} onClick={() => setUnitSystem('metric')}>
                            Metric (kg, cm)
                        </Button>
                        <Button className='flex-1' variant={unitSystem === 'imperial' ? 'primary' : 'secondary'} onClick={() => setUnitSystem('imperial')}>
                            Imperial (lbs, ft/in)
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span>Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</span>
                        <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" required />
                    </div>

                    <div className="flex flex-col gap-1">
                        <span>Height</span>
                        {unitSystem === 'metric' ? (
                            <Input value={heightCm} onChange={(e) => setHeightCm(e.target.value)} type="number" step="0.1" required />
                        ) : (
                            <div className="flex gap-2">
                                <Input className="w-full" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} type="number" placeholder="ft" required />
                                <Input className="w-full" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} type="number" step="0.1" placeholder="in" required />
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-600">{error}</p>}
                    <Button type="submit" variant="primary">
                        Continue
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default Onboarding