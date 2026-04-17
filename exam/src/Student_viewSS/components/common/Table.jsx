import React from 'react';

const Table = ({ columns, data, actions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="table-responsive">
        <table className="table table-hover table-striped align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-3 px-4 fw-medium text-dark text-nowrap"
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="py-3 px-4 fw-medium text-dark text-nowrap text-end">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="border-top-0">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-5 text-center text-muted"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-3 text-nowrap"
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-nowrap text-end">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
