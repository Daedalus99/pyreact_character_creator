// BasePage is a reusable wrapper for pages that share the same header/layout patterns.
export default function BasePage({ title, description, actions, children }) {
    return (
        <div className="page-shell">
            <header className="page-header">
                <div>
                    <h1>{title}</h1>
                    {description && <p className="page-description">{description}</p>}
                </div>
                <div className="page-actions">{actions}</div>
            </header>
            <section className="page-content">{children}</section>
        </div>
    );
}
