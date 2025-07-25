// src/components/TeacherCard.jsx
import React from 'react';
import Card from './Card'; // Import the generic Card component

/**
 * @typedef {Object} TeacherData
 * @property {string} id - Teacher ID.
 * @property {string} email - Teacher's email.
 * @property {number} age - Teacher's age.
 * @property {string} address - Teacher's address.
 * @property {string} phone - Teacher's phone number.
 * @property {string} photo - URL to teacher's photo.
 * @property {string} dateOfJoining - Date the teacher joined.
 * @property {string[]} subjects - Array of subjects the teacher teaches.
 * @property {string[]} classes - Array of classes the teacher teaches.
 * @property {string} status - Teacher's employment status (e.g., 'active', 'inactive').
 */

/**
 * Defines the fields to be displayed on a teacher card.
 * Each object specifies a key (matching the data property), a human-readable label,
 * and an optional accessor function for complex data.
 *
 * The 'photo' field now includes a 'render' function to display it as an image.
 */
const teacherFields = [
  { key: 'id', label: 'Teacher ID' },
  { key: 'email', label: 'Email' },
  { key: 'age', label: 'Age' },
  { key: 'address', label: 'Address' },
  { key: 'phone', label: 'Phone' },
  {
    key: 'photo',
    label: 'Photo',
    // Use a render function to display the photo as an <img> tag
    render: (data) => (
      <div style={{ marginTop: '10px' }}>
        <img
          src={data.photo}
          alt="Teacher"
          style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '0%', objectFit: 'cover' }}
        />
      </div>
    ),
  },
  { key: 'dateofjoining', label: 'Date of Joining' },
  { key: 'subjects', label: 'Subjects', accessor: (data) => data.subjects },
  { key: 'classes', label: 'Classes', accessor: (data) => data.classes },
  { key: 'status', label: 'Status' },
];

/**
 * TeacherCard component.
 * A specialized card component for displaying teacher information.
 * It wraps the generic Card component, pre-configuring it for teacher data.
 *
 * @param {object} props - The component props.
 * @param {TeacherData} props.data - The teacher data object to display.
 * @param {function(string): void} props.onDelete - Callback function to handle teacher deletion.
 * @param {string} [props.key] - Optional key prop for list rendering.
 */
function TeacherCard({ data, onDelete, key }) { // Re-ordered props and removed 'type', 'fields' as they are now set internally
  return (
    <Card
      key={key} // Pass key if provided from parent for list rendering
      data={data}
      type="teacher" // Explicitly set type to 'teacher'
      fields={teacherFields} // Pass the pre-defined teacher-specific fields
      onDelete={onDelete}
    />
  );
}

export default TeacherCard;