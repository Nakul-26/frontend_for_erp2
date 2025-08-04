import React, { useState, useEffect, useRef } from 'react';
//import jsPDF from 'jspdf';
//import autoTable from 'jspdf-autotable';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

//const jsPDF = (await import('jspdf')).default;
//const autoTable = (await import('jspdf-autotable')).default;


function AdminTimetablePdfGenerator() {
  const [timetables, setTimetables] = useState([]);
  const [editableTimetables, setEditableTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [pdfUrl, setPdfUrl] = useState(null);
//   const pdfPreviewRef = useRef();

  const [tableConfig, setTableConfig] = useState({ columns: 6, rows: 3 });

  const sampleTimetables = [
    {
      className: 'Class 10A',
      entries: [
        { day: 'Monday', periods: ['Math', 'English', 'Science', 'History', 'PE', 'Art'] },
        { day: 'Tuesday', periods: ['English', 'Math', 'Science', 'Geography', 'PE', 'Music'] },
        { day: 'Wednesday', periods: ['Science', 'Math', 'English', 'History', 'PE', 'Art'] },
      ],
    },
    {
      className: 'Class 9B',
      entries: [
        { day: 'Monday', periods: ['Biology', 'Math', 'English', 'History', 'PE', 'Art'] },
        { day: 'Tuesday', periods: ['English', 'Math', 'Chemistry', 'Geography', 'PE', 'Music'] },
        { day: 'Wednesday', periods: ['Physics', 'Math', 'English', 'History', 'PE', 'Art'] },
      ],
    },
  ];

  useEffect(() => {
    fetchTimetables();
  }, []);

  useEffect(() => {
    setEditableTimetables(JSON.parse(JSON.stringify(timetables)));
  }, [timetables]);

  const fetchTimetables = async () => {
    setLoading(true);
    setError('');
    try {
      // Adjust API endpoint as needed
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/admin/timetables`, { withCredentials: true });
      if (response.data.success && response.data.data.length > 0) {
        setTimetables(response.data.data);
      } else {
        setTimetables(sampleTimetables);
        setError('No timetables found from backend. Showing sample data.');
      }
    } catch (err) {
      setTimetables(sampleTimetables);
      setError('Error fetching timetables. Showing sample data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (tIndex, eIndex, pIndex, value) => {
    setEditableTimetables(prev => {
      const updated = [...prev];
      updated[tIndex].entries[eIndex].periods[pIndex] = value;
      return updated;
    });
  };

  const generatePdf = async (timetable, idx) => {
//     const jsPDF = (await import('jspdf')).default;
//     const autoTable = (await import('jspdf-autotable')).default;

//     const doc = new jsPDF();
//     autoTable(doc, {
//       head: [['Day', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6']],
//       body: editableTimetables[idx].entries.map(row => [row.day, ...row.periods]),
//     });
//     doc.text(`Timetable for ${timetable.className || timetable.class || 'Class'}`, 10, 10);
//     doc.save(`Timetable_${timetable.className || timetable.class || 'Class'}.pdf`);
  };

  const handleAddColumn = () => {
    setTableConfig(cfg => ({ ...cfg, columns: cfg.columns + 1 }));
    setEditableTimetables(prev => prev.map(t => ({
      ...t,
      entries: t.entries.map(e => ({ ...e, periods: [...e.periods, ''] }))
    })));
  };
  const handleRemoveColumn = () => {
    if (tableConfig.columns > 1) {
      setTableConfig(cfg => ({ ...cfg, columns: cfg.columns - 1 }));
      setEditableTimetables(prev => prev.map(t => ({
        ...t,
        entries: t.entries.map(e => ({ ...e, periods: e.periods.slice(0, -1) }))
      })));
    }
  };
  const handleAddRow = (tIndex) => {
    setEditableTimetables(prev => {
      const updated = [...prev];
      updated[tIndex].entries.push({ day: `Day ${updated[tIndex].entries.length + 1}`, periods: Array(tableConfig.columns).fill('') });
      return updated;
    });
  };
  const handleRemoveRow = (tIndex) => {
    setEditableTimetables(prev => {
      const updated = [...prev];
      if (updated[tIndex].entries.length > 1) updated[tIndex].entries.pop();
      return updated;
    });
  };

  const generatePdfBlob = (timetable, idx) => {
//     const doc = new jsPDF();
//     autoTable(doc, {
//       head: [[
//         'Day',
//         ...Array.from({ length: tableConfig.columns }, (_, i) => `Period ${i + 1}`)
//       ]],
//       body: editableTimetables[idx].entries.map(row => [row.day, ...row.periods]),
//     });
//     doc.text(`Timetable for ${timetable.className || timetable.class || 'Class'}`, 10, 10);
//     return doc.output('blob');
  };

  const handlePreviewPdf = (timetable, idx) => {
//     const blob = generatePdfBlob(timetable, idx);
//     const url = URL.createObjectURL(blob);
//     setPdfUrl(url);
//     setTimeout(() => {
//       if (pdfPreviewRef.current) pdfPreviewRef.current.contentWindow?.focus();
//     }, 100);
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Timetable PDF Generator"} setIsSidebarOpen={setIsSidebarOpen} />
        {/* <header className="dashboard-header">
          <h1>Timetable PDF Generator</h1>
          <p className="dashboard-subtitle">Download class timetables as PDF files.</p>
        </header> */}
        {/* <div style={{ padding: '30px' }}>
          {loading && <p>Loading timetables...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {timetables.length === 0 && !loading && <p>No timetables found.</p>}
          {editableTimetables.map((timetable, idx) => (
            <div key={idx} style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
              <h3>{timetable.className || timetable.class || 'Class'}</h3>
              <div style={{ margin: '10px 0' }}>
                <button onClick={handleAddColumn}>Add Period</button>
                <button onClick={handleRemoveColumn} disabled={tableConfig.columns <= 1}>Remove Period</button>
                <button onClick={() => handleAddRow(idx)}>Add Day</button>
                <button onClick={() => handleRemoveRow(idx)} disabled={timetable.entries.length <= 1}>Remove Day</button>
              </div>
              <button onClick={() => handlePreviewPdf(timetable, idx)} style={{ marginBottom: '10px', marginRight: '10px' }}>Preview PDF</button>
              <button onClick={() => generatePdf(timetable, idx)} style={{ marginBottom: '10px' }}>Download PDF</button>
              {timetable.entries && timetable.entries.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Day</th>
                      {Array.from({ length: tableConfig.columns }, (_, i) => (
                        <th key={i}>Period {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.entries.map((row, eIndex) => (
                      <tr key={eIndex}>
                        <td>{row.day}</td>
                        {row.periods.map((p, pIndex) => (
                          <td key={pIndex}>
                            <input
                              type="text"
                              value={p}
                              onChange={e => handleCellChange(idx, eIndex, pIndex, e.target.value)}
                              style={{ width: '90%' }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No timetable data.</p>}
            </div>
          ))}
          {pdfUrl && (
            <div style={{ margin: '30px 0' }}>
              <h4>PDF Preview:</h4>
              <iframe ref={pdfPreviewRef} src={pdfUrl} width="100%" height="500px" title="PDF Preview" />
            </div>
          )}
        </div> */}
      </main>
    </div>
  );
}

export default AdminTimetablePdfGenerator;
