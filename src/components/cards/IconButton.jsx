// IconButton is the reusable left-sidebar action icon.
export default function IconButton({ label, iconUrl, active, onClick }) {
    return (
        <button className={`icon-button ${active ? 'active' : ''}`} onClick={onClick}>
            {iconUrl ? (
                <img className="icon" src={iconUrl} title={label} />
            ) : (
                <div>
                    <span className="icon-placeholder">{label?.[0] ?? '?'}</span>
                    <span className="icon-label">{label}</span>
                </div>
            )}
        </button>
    );
}
