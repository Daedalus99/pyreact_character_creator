// IconButton is the reusable left-sidebar action icon.
export default function IconButton({ label, active, onClick }) {
  return (
    <button className={`icon-button ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="icon-placeholder">{label[0]}</span>
      <span className="icon-label">{label}</span>
    </button>
  );
}
