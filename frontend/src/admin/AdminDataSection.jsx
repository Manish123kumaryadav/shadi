import React, { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Download, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { adminService } from '../services/api';

function displayValue(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const dataTableStyles = {
  table: { style: { minWidth: 0 } },
  headRow: {
    style: {
      minHeight: '42px',
      backgroundColor: '#f8fafc',
      borderBottomColor: '#dfe7ef',
    },
  },
  headCells: {
    style: {
      color: '#435466',
      fontSize: '0.78rem',
      fontWeight: 900,
      textTransform: 'uppercase',
      whiteSpace: 'normal',
    },
  },
  rows: { style: { minHeight: '48px' } },
  cells: {
    style: {
      color: '#203040',
      fontSize: '0.86rem',
      lineHeight: 1.35,
      whiteSpace: 'normal',
      wordBreak: 'break-word',
    },
  },
};

const AdminDataSection = ({ section, data, isLoading, error, onRefresh, onDeleted }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const filteredRows = useMemo(() => {
    if (!searchText.trim()) return data.rows;
    const query = searchText.toLowerCase();

    return data.rows.filter((row) =>
      Object.values(row).some((value) => displayValue(value).toLowerCase().includes(query))
    );
  }, [data.rows, searchText]);

  const handleDownload = () => {
    const token = localStorage.getItem('token');
    fetch(adminService.downloadTableUrl(data.table || section), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `${data.table || section}-report.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      });
  };

  const handleDelete = async (row) => {
    if (!row.id || data.protected) return;
    const confirmed = window.confirm(`Delete row #${row.id} from ${data.label}?`);
    if (!confirmed) return;

    await adminService.deleteRow(data.table, row.id);
    setSelectedRow(null);
    onDeleted();
  };

  const columns = [
    ...data.columns.map((column) => ({
      name: column,
      selector: (row) => displayValue(row[column]),
      sortable: true,
      wrap: true,
      grow: ['bio', 'body', 'url', 'email'].includes(column) ? 2 : 1,
      minWidth: ['id', 'roleId', 'userId', 'senderId'].includes(column) ? '82px' : '145px',
      maxWidth: ['bio', 'body', 'url'].includes(column) ? '360px' : undefined,
    })),
    {
      name: 'Action',
      width: '96px',
      cell: (row) => (
        <button
          className="table-danger-btn"
          onClick={() => handleDelete(row)}
          disabled={data.protected || !row.id}
          title={data.protected ? 'This table is protected' : 'Delete row'}
        >
          <Trash2 size={16} />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <section className="admin-section-layout card card-shadow">
      <div className="admin-table-section">
        <div className="admin-table-toolbar">
          <div>
            <p className="admin-kicker">Database section</p>
            <h2>{data.label || section}</h2>
            <p>{data.description}</p>
          </div>
          <div className="admin-table-actions">
            <div className="admin-search">
              <Search size={17} />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search rows"
              />
            </div>
            <button onClick={onRefresh}>
              <RefreshCw size={18} />
              Load
            </button>
            <button onClick={handleDownload}>
              <Download size={18} />
              CSV
            </button>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-table-wrap">
          {isLoading ? (
            <div className="admin-loading">Loading table...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredRows}
              customStyles={dataTableStyles}
              dense
              highlightOnHover
              pointerOnHover
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              responsive
              noDataComponent="No rows found"
              onRowClicked={(row) => setSelectedRow(row)}
            />
          )}
        </div>
      </div>

      {selectedRow && (
        <aside className="admin-row-detail">
          <button className="detail-close" onClick={() => setSelectedRow(null)} title="Close details">
            <X size={18} />
          </button>
          <p className="admin-kicker">Selected row</p>
          <h3>{data.label} #{selectedRow.id || 'row'}</h3>
          <div className="detail-fields">
            {Object.entries(selectedRow).map(([key, value]) => (
              <div key={key}>
                <span>{key}</span>
                <strong>{displayValue(value)}</strong>
              </div>
            ))}
          </div>
        </aside>
      )}
    </section>
  );
};

export default AdminDataSection;
