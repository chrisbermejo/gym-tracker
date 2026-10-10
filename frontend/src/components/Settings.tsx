import { useState } from 'react'
import { ACCENT_COLORS, applyAccentColor, getStoredAccentColor, storeAccentColor, type AccentColorName } from '../utils/themes'

import Button from './ui/Button'

function Settings({
    unitSystem,
    onUnitSystemChanged,
}: {
    unitSystem: 'metric' | 'imperial'
    onUnitSystemChanged: () => void
}) {
    const [accentColor, setAccentColor] = useState<AccentColorName>(getStoredAccentColor())

    const changeUnitSystem = async (value: 'metric' | 'imperial') => {
        if (value === unitSystem) return
        await fetch('/api/users/me/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit_system: value }),
        })
        onUnitSystemChanged()
    }

    const changeAccentColor = (name: AccentColorName) => {
        setAccentColor(name)
        storeAccentColor(name)
        applyAccentColor(name)
    }

    return (
        <div className="flex flex-col gap-6 w-full text-center items-center justify-center">
            <h2 className="text-2xl font-bold">Settings</h2>

            <div className="flex flex-col gap-2">
                <span className="font-medium">Units</span>
                <div className="flex gap-2">
                    <Button variant={unitSystem === 'metric' ? 'primary' : 'secondary'} onClick={() => changeUnitSystem('metric')}>
                        Metric (kg, cm)
                    </Button>
                    <Button variant={unitSystem === 'imperial' ? 'primary' : 'secondary'} onClick={() => changeUnitSystem('imperial')}>
                        Imperial (lbs, ft/in)
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <span className="font-medium">Accent color</span>
                <div className="flex gap-2">
                    {(Object.keys(ACCENT_COLORS) as AccentColorName[]).map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => changeAccentColor(name)}
                            aria-label={name}
                            className={`w-8 h-8 rounded-full border-2 ${accentColor === name ? 'border-ink' : 'border-line'}`}
                            style={{ backgroundColor: ACCENT_COLORS[name].light.primary }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Settings