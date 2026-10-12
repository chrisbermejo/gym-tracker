type View = 'today' | 'types' | 'history' | 'settings'

const TABS: { key: View; label: string; icon: string }[] = [
    { key: 'today', label: 'Today', icon: '🏋️' },
    { key: 'types', label: 'Types', icon: '📋' },
    { key: 'history', label: 'History', icon: '📊' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
]

function BottomNav({ view, onChange }: { view: View; onChange: (view: View) => void }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-line bg-surface">
            <div className="max-w-sm mx-auto flex">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs ${view === tab.key ? 'text-primary font-medium' : 'text-ink-muted'
                            }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    )
}

export default BottomNav