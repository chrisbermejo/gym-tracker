import { useEffect, useState } from 'react'
import { kgToLbs, cmToFeetInches } from './utils/units'
import Onboarding from './components/Onboarding'
import WorkoutTypes from './components/WorkoutTypes'
import TodaysWorkout from './components/TodaysWorkout'
import WorkoutHistory from './components/WorkoutHistory'

import Button from './components/ui/Button'

interface User {
    id: number
    email: string
    name: string
    weight: number | null
    height: number | null
    onboarding_completed: boolean
}

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm')
    const [view, setView] = useState<'today' | 'types' | 'history'>('today')

    const loadCurrentUser = () => {
        fetch('/api/auth/me')
            .then((res) => (res.ok ? res.json() : null))
            .then(setCurrentUser)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadCurrentUser()
    }, [])

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setCurrentUser(null)
    }

    if (loading) return <p>Loading...</p>

    if (!currentUser) {
        return (
            <div>
                <h1 className="text-4xl font-bold text-blue-600">GymSense</h1>
                <a href="/api/auth/google/login">Sign in with Google</a>
            </div>
        )
    }

    if (!currentUser.onboarding_completed) {
        return <Onboarding onDone={loadCurrentUser} />
    }

    const weightDisplay =
        currentUser.weight === null ? '—' : weightUnit === 'kg' ? `${currentUser.weight.toFixed(1)} kg` : `${kgToLbs(currentUser.weight).toFixed(1)} lbs`

    const heightDisplay =
        currentUser.height === null ? '—' : heightUnit === 'cm' ? `${currentUser.height.toFixed(1)} cm` : (() => {
            const { feet, inches } = cmToFeetInches(currentUser.height)
            return `${feet}'${inches.toFixed(1)}"`
        })()

    return (
        <div className='flex flex-col items-center'>
            <div className='mb-5 text-center'>
                <h1 className="text-4xl font-bold text-primary ">GymSense</h1>
                <p>Signed in as {currentUser.name} ({currentUser.email})</p>
                <div className="flex flex-col items-center">
                    <p className="flex gap-2">
                        Weight: {weightDisplay}
                        <button type="button" onClick={() => setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')} className="text-sm underline">
                            switch to {weightUnit === 'kg' ? 'lbs' : 'kg'}
                        </button>
                    </p>
                    <p className="flex gap-2">
                        Height: {heightDisplay}
                        <button type="button" onClick={() => setHeightUnit(heightUnit === 'cm' ? 'ft' : 'cm')} className="text-sm underline">
                            switch to {heightUnit === 'cm' ? 'ft/in' : 'cm'}
                        </button>
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
                </div>
            </div>

            {view === 'today' && <TodaysWorkout />}
            {view === 'types' && <WorkoutTypes />}
            {view === 'history' && <WorkoutHistory />}

            <Button variant="danger" className="mt-4" onClick={logout}>
                Log out
            </Button>
        </div>
    )
}

export default App