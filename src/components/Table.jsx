import React from 'react';
import '../styles/Table.css'; // Import the CSS for the table

/**
 * A generic Table component for displaying tabular data.
 * It's designed to be flexible, allowing custom rendering for cells.
 *
 * @param {object} props - The component props.
 * @param {Array<Object>} props.data - An array of objects, where each object represents a row of data.
 * @param {Array<Object>} props.columns - An array of column definitions. Each object in this array should have:
 * @property {string} key - The key of the data property to display in this column.
 * @property {string} label - The human-readable header text for this column.
 * @property {function(Object): React.ReactNode} [renderCell] - Optional. A function that receives the entire row data object
 * and returns a React node (e.g., an <img> tag, a formatted date, a colored span) to render in the cell.
 * If not provided, the default value accessor or string conversion is used.
 * @property {function(Object): any} [accessor] - Optional. A function that receives the entire row data object
 * and returns the raw value for this cell. Useful for nested data or complex calculations.
 * If `renderCell` is provided, `accessor` is ignored.
 */
function Table({ data, columns }) {

  /**
   * Helper function to get the display value for a cell.
   * Handles arrays, dates, and provides a fallback for empty/null values.
   * @param {any} value - The raw value from the data object.
   * @param {string} fallback - The string to display if the value is empty or null.
   * @returns {string} The formatted string value.
   */
  const getDisplayValue = (value, fallback = 'N/A') => {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    if (Array.isArray(value)) {
      return value.join(', ') || fallback;
    }
    // Attempt to format as a date if it looks like a date string
    if (typeof value === 'string' && (value.includes('-') || value.includes('/')) && !isNaN(new Date(value).getTime())) {
      try {
        return new Date(value).toLocaleDateString() || fallback;
      } catch (e) {
        // Fallback to string if date parsing fails unexpectedly
        return String(value);
      }
    }
    return String(value);
  };

    // const renderSubjects = (subjectIdsArray) => {
    //     if (!subjectIdsArray || subjectIdsArray.length === 0) {
    //         return 'No subjects assigned';
    //     }
    //     return subjectIdsArray.map(subjectID => { // Corrected parameter name to subjectID
    //         const subject = allSubjects.find(s => s._id === subjectID);
    //         // Return the subject code if found, otherwise the ID itself or a fallback
    //         return subject ? getValue(subject.code, subjectID) : subjectID; // Use subjectID here
    //     }).join(', ');
    // };

  if (!data || data.length === 0) {
    return <p className="no-data-message">No data to display.</p>;
  }

  // Responsive table container
  return (
    <div className="custom-table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={item.s_id || item.c_id || item.classId || rowIndex}> {/* Use unique ID if available, otherwise row index */}
              {columns.map((column, colIndex) => {
                // Add a special class for the Subjects column
                const tdClass = column.key === 'subjects' ? 'subjects-cell' : '';
                return (
                  <td key={`${column.key}-${rowIndex}`} className={tdClass}>
                    {column.renderCell ? (
                      // If a custom render function is provided, use it
                      column.renderCell(item)
                    ) : (
                      // Otherwise, get the value using accessor or direct key access
                      getDisplayValue(column.accessor ? column.accessor(item) : item[column.key])
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
