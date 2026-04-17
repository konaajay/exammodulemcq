
import './CommandHeader.css'

const routeMeta = {
    '/exams': { title: 'Exams', actions: ['Create Exam', 'Question Bank'] },
    '/library': { title: 'Library Dashboard', actions: ['View Reports'] },
    '/library/books': { title: 'Books Catalog', actions: ['Add Book', 'Import CSV'] },
    '/library/members': { title: 'Library Members', actions: ['Register Member'] },
    '/library/issues': { title: 'Circulation', actions: ['Issue Book', 'Return Book'] },
    '/users': { title: 'Users', actions: ['Invite User'] }
}

const CommandHeader = ({ toggleSidebar, pathname }) => {
    // Find the longest matching key for specificity
    const meta = Object.entries(routeMeta)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([key]) => pathname.startsWith(key))?.[1]


    return (
        <>
            {/* TOP BAR */}
            <header className="cmd-header">
                <button className="icon-btn" onClick={toggleSidebar}>
                    <i className="bi bi-list"></i>
                </button>

                <div className="cmd-trigger">
                    <span className="kbd">⌘K</span>
                    <span className="placeholder">Search or run a command…</span>
                </div>

                <div className="cmd-actions">
                    <button className="icon-btn">
                        <i className="bi bi-bell"></i>
                    </button>
                    <button className="avatar">AD</button>
                </div>
            </header>

            {/* CONTEXT STRIP */}
            {meta && (
                <div className="context-strip">
                    <strong>{meta.title}</strong>
                    <div className="context-actions">
                        {meta.actions.map(a => (
                            <button key={a} className="context-btn">
                                {a}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default CommandHeader
