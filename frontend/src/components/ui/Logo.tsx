function Logo({ size = 32 }: { size?: number }) {
    return (
        <div
            className="rounded-lg bg-primary flex items-center justify-center shrink-0 mr-2"
            style={{ width: size, height: size }}
        >
            <span className="italic font-black text-white leading-none" style={{ fontSize: size * 0.6 }}>
                G
            </span>
        </div>
    )
}

export default Logo