// BaseForm provides a common wrapper for settings and wizard forms.
// It supports a title, description, and action buttons shared by all forms.
export default function BaseForm({ title, description, actions, children }) {
    return (
        <form className="base-form">
            <div className="form-header">
                <div>
                    <h2>{title}</h2>
                    {description && <p>{description}</p>}
                </div>
                <div className="form-actions">{actions}</div>
            </div>
            <div className="form-body">{children}</div>
        </form>
    );
}
