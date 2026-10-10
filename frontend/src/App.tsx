import { useEffect, useState } from 'react'
import { kgToLbs, cmToFeetInches } from './utils/units'
import { applyAccentColor, getStoredAccentColor } from './utils/themes'
import Onboarding from './components/Onboarding'
import WorkoutTypes from './components/WorkoutTypes'
import TodaysWorkout from './components/TodaysWorkout'
import WorkoutHistory from './components/WorkoutHistory'
import Settings from './components/Settings'

import Button from './components/ui/Button'

interface User {
    id: number
    email: string
    name: string
    weight: number | null
    height: number | null
    onboarding_completed: boolean
    unit_system: 'metric' | 'imperial'
}

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'today' | 'types' | 'history' | 'settings'>('today')

    const loadCurrentUser = () => {
        fetch('/api/auth/me')
            .then((res) => (res.ok ? res.json() : null))
            .then(setCurrentUser)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadCurrentUser()
    }, [])

    useEffect(() => {
        const apply = () => applyAccentColor(getStoredAccentColor())
        apply()
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        media.addEventListener('change', apply)
        return () => media.removeEventListener('change', apply)
    }, [])

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setCurrentUser(null)
    }

    if (loading) return <p>Loading...</p>

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 min-h-screen text-center">
                <h1 className="text-4xl font-bold text-primary">GymSense</h1>
                <p className="text-ink-muted">Track your workouts, your way.</p>
                <a
                    href="/api/auth/google/login"
                    className="inline-block rounded-lg bg-primary px-4 py-2 text-base font-medium text-white hover:bg-primary-hover transition-colors"
                >
                    Sign in with Google
                </a>
            </div>
        )
    }

    if (!currentUser.onboarding_completed) {
        return <Onboarding onDone={loadCurrentUser} />
    }

    const weightDisplay =
        currentUser.weight === null
            ? '—'
            : currentUser.unit_system === 'metric'
                ? `${currentUser.weight.toFixed(1)} kg`
                : `${kgToLbs(currentUser.weight).toFixed(1)} lbs`

    const heightDisplay =
        currentUser.height === null
            ? '—'
            : currentUser.unit_system === 'metric'
                ? `${currentUser.height.toFixed(1)} cm`
                : (() => {
                    const { feet, inches } = cmToFeetInches(currentUser.height)
                    return `${feet}'${inches.toFixed(1)}"`
                })()

    return (
        <div className='flex flex-col items-center'>
            <div className='mb-5 text-center'>
                <h1 className="text-4xl font-bold text-primary m-4">GymSense</h1>
                <p>Signed in as {currentUser.name} ({currentUser.email})</p>
                <div className="flex flex-col items-center">
                    <p className="flex gap-2">
                        Weight: {weightDisplay}
                    </p>
                    <p className="flex gap-2">
                        Height: {heightDisplay}
                    </p>
                </div>

                <div className="flex gap-3 text-sm justify-center mt-2">
                    <Button variant={view === 'today' ? 'primary' : 'secondary'} onClick={() => setView('today')}>
                        Today
                    </Button>
                    <Button variant={view === 'types' ? 'primary' : 'secondary'} onClick={() => setView('types')}>
                        Manage Types
                    </Button>
                    <Button variant={view === 'history' ? 'primary' : 'secondary'} onClick={() => setView('history')}>
                        History
                    </Button>
                    <Button variant={view === 'settings' ? 'primary' : 'secondary'} onClick={() => setView('settings')}>
                        Settings
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">
                {view === 'today' && <TodaysWorkout />}
                {view === 'types' && <WorkoutTypes />}
                {view === 'history' && <WorkoutHistory />}
                {view === 'settings' && (
                    <Settings unitSystem={currentUser.unit_system} onUnitSystemChanged={loadCurrentUser} />
                )}
            </div>

            <Button variant="danger" className="mt-4" onClick={logout}>
                Log out
            </Button>
        </div>
    )
}

export default App