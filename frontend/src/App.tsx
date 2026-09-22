import { useEffect, useState } from 'react'

interface User {
    id: number
    email: string
    name: string
}

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => (res.ok ? res.json() : null))
            .then(setCurrentUser)
            .finally(() => setLoading(false))
    }, [])

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setCurrentUser(null)
    }

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <h1 className="text-4xl font-bold text-blue-600">GymSense</h1>
            {currentUser ? (
                <>
                    <p>Signed in as {currentUser.name} ({currentUser.email})</p>
                    <button onClick={logout}>Log out</button>
                </>
            ) : (
                <a href="/api/auth/google/login">Sign in with Google</a>
            )}
        </div>
    )
}

export default App