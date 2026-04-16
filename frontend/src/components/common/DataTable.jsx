import EmptyState from './EmptyState';

export default function DataTable({ columns, rows, emptyTitle, emptyText, renderRow }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyTitle} text={emptyText} />
              </td>
            </tr>
          ) : (
            rows.map((row) => renderRow(row))
          )}
        </tbody>
      </table>
    </div>
  );
}
