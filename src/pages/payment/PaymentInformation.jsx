// src/pages/payment/PaymentInformation.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Dashboard.css';

function PaymentInformation() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    description: '',
    status: 'paid'
  });
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [editPaymentId, setEditPaymentId] = useState(null);

  // Custom hook for responsive design
  const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  
    useEffect(() => {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return windowSize;
  };
  
  // Get current window size
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  // First fetch all classes
  const fetchClasses = async () => {
    setError('');
    setClassesLoading(true);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/getall`,
        { withCredentials: true }
      );
      
      if (response.data.status === "success" && Array.isArray(response.data.subjects)) {
        setClasses(response.data.subjects);
      } else {
        console.error("Invalid classes response format:", response.data);
        setError('Failed to fetch classes. Please try again later.');
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError('Unable to fetch classes. Please check your connection.');
    } finally {
      setClassesLoading(false);
    }
  };

  // Then fetch all students
  const fetchStudents = async () => {
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/getallstudents`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setStudents(response.data.data);
        setFilteredStudents(response.data.data); // Initially show all students
        
        // Initialize mock payment data for demo
        const mockPayments = {};
        response.data.data.forEach(student => {
          mockPayments[student.s_id] = generateMockPayments(student);
        });
        setPayments(mockPayments);
      } else {
        throw new Error('Failed to fetch students');
      }
    } catch (err) {
      setError('Unable to fetch students. Please try again later.');
      console.error('Fetch Students Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock payment data for demonstration
  const generateMockPayments = (student) => {
    const currentYear = new Date().getFullYear();
    const paymentTypes = ['Tuition Fee', 'Library Fee', 'Laboratory Fee', 'Sports Fee'];
    
    return paymentTypes.map((type, index) => ({
      id: `${student.s_id}-${index}`,
      studentId: student.s_id,
      type: type,
      amount: 1000 + Math.floor(Math.random() * 5000),
      paymentDate: index % 2 === 0 ? `${currentYear}-01-15` : null,
      dueDate: `${currentYear}-${(index + 1).toString().padStart(2, '0')}-15`,
      status: index % 2 === 0 ? 'paid' : 'pending',
      paymentMethod: index % 2 === 0 ? 'online' : null,
      description: `${type} for ${student.name} - ${currentYear}`
    }));
  };

  // Filter students by class
  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setSelectedStudent(''); // Reset selected student when class changes
    
    if (!classId) {
      // If no class is selected, show all students
      setFilteredStudents(students);
    } else {
      // Filter students to show only those in the selected class
      const classStudents = students.filter(student => 
        student.class && student.class.toString() === classId.toString()
      );
      setFilteredStudents(classStudents);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const addPayment = () => {
    if (!selectedStudent) {
      alert('Please select a student first');
      return;
    }

    if (!paymentData.amount || isNaN(paymentData.amount) || parseFloat(paymentData.amount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const newPayment = {
      id: `${selectedStudent}-${Date.now()}`,
      studentId: selectedStudent,
      type: paymentData.description || 'Tuition Fee',
      amount: parseFloat(paymentData.amount),
      paymentDate: paymentData.status === 'paid' ? paymentData.paymentDate : null,
      dueDate: paymentData.paymentDate,
      status: paymentData.status,
      paymentMethod: paymentData.status === 'paid' ? paymentData.paymentMethod : null,
      description: paymentData.description
    };

    setPayments(prev => ({
      ...prev,
      [selectedStudent]: [newPayment, ...(prev[selectedStudent] || [])]
    }));

    // Reset form
    setPaymentData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      description: '',
      status: 'paid'
    });

    // Here you would typically make an API call to save the payment
    console.log('Payment added:', newPayment);
    alert('Payment added successfully!');
  };

  const updatePayment = () => {
    if (!selectedStudent || !editPaymentId) {
      alert('Invalid operation');
      return;
    }

    const updatedPayments = payments[selectedStudent].map(payment => 
      payment.id === editPaymentId ? {
        ...payment,
        amount: parseFloat(paymentData.amount),
        paymentDate: paymentData.status === 'paid' ? paymentData.paymentDate : null,
        paymentMethod: paymentData.status === 'paid' ? paymentData.paymentMethod : null,
        status: paymentData.status,
        description: paymentData.description
      } : payment
    );

    setPayments(prev => ({
      ...prev,
      [selectedStudent]: updatedPayments
    }));

    // Reset form
    setFormMode('add');
    setEditPaymentId(null);
    setPaymentData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      description: '',
      status: 'paid'
    });

    // Here you would typically make an API call to update the payment
    console.log('Payment updated:', updatedPayments.find(p => p.id === editPaymentId));
    alert('Payment updated successfully!');
  };

  const editPayment = (payment) => {
    setSelectedStudent(payment.studentId);
    setEditPaymentId(payment.id);
    setFormMode('edit');
    setPaymentData({
      amount: payment.amount.toString(),
      paymentDate: payment.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: payment.paymentMethod || 'cash',
      description: payment.description || '',
      status: payment.status
    });
  };

  const deletePayment = (studentId, paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      setPayments(prev => ({
        ...prev,
        [studentId]: prev[studentId].filter(p => p.id !== paymentId)
      }));
      
      // Here you would typically make an API call to delete the payment
      console.log('Payment deleted:', paymentId);
      alert('Payment deleted successfully!');
    }
  };

  const findStudentName = (studentId) => {
    const student = students.find(s => s.s_id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  // Function to render a single payment record
  const renderPaymentRecord = (payment) => {
    return (
      <div 
        key={payment.id} 
        style={{ 
          marginBottom: '15px', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
          background: payment.status === 'paid' ? 'rgba(0, 128, 0, 0.05)' : 
                    payment.status === 'overdue' ? 'rgba(255, 0, 0, 0.05)' : 
                    'rgba(255, 165, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Edit button in front of payment */}
        <button
          onClick={() => editPayment(payment)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span role="img" aria-label="edit">✏️</span> Edit
        </button>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '10px', 
          paddingRight: isMobile ? '0' : '70px',
          flexWrap: 'wrap'
        }}>
          <strong>{payment.type}</strong>
          <span style={{ 
            padding: '3px 8px', 
            borderRadius: '4px', 
            fontSize: '0.8em',
            backgroundColor: payment.status === 'paid' ? 'var(--success)' : 
                          payment.status === 'overdue' ? 'var(--danger)' : 
                          'var(--warning)',
            color: 'white',
            marginTop: isMobile ? '5px' : '0'
          }}>
            {payment.status.toUpperCase()}
          </span>
        </div>
        
        <div style={{ marginBottom: '5px' }}>
          <strong>Amount:</strong> ₹{payment.amount.toFixed(2)}
        </div>
        
        {payment.paymentDate && (
          <div style={{ marginBottom: '5px' }}>
            <strong>Payment Date:</strong> {new Date(payment.paymentDate).toLocaleDateString()}
          </div>
        )}
        
        <div style={{ marginBottom: '5px' }}>
          <strong>Due Date:</strong> {new Date(payment.dueDate).toLocaleDateString()}
        </div>
        
        {payment.paymentMethod && (
          <div style={{ marginBottom: '5px' }}>
            <strong>Payment Method:</strong> {payment.paymentMethod}
          </div>
        )}
        
        {payment.description && (
          <div style={{ marginBottom: '5px' }}>
            <strong>Description:</strong> {payment.description}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '10px', 
          marginTop: '10px',
          flexWrap: 'wrap' 
        }}>
          <button 
            onClick={() => deletePayment(payment.studentId, payment.id)}
            style={{ 
              padding: '5px 10px', 
              background: 'var(--danger)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span role="img" aria-label="delete">🗑️</span> Delete
          </button>
        </div>
      </div>
    );
  };

  // Function to render the payment form
  const renderPaymentForm = () => {
    return (
      <div className="payment-form" style={{ 
        padding: '20px', 
        borderRadius: '8px', 
        background: 'var(--surface)', 
        boxShadow: '0 2px 4px var(--border-color)', 
        order: isMobile ? '1' : 'unset'
      }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>
          {formMode === 'add' ? 'Add New Payment' : 'Update Payment'}
        </h2>

        {/* Class selection dropdown */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="class-select" style={{ display: 'block', marginBottom: '5px' }}>Select Class:</label>
          <select
            id="class-select"
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)',
              marginBottom: '10px'
            }}
            disabled={formMode === 'edit' || classesLoading}
          >
            <option value="">-- All Classes --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.code})
              </option>
            ))}
          </select>
          {classesLoading && <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading classes...</div>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="student-select" style={{ display: 'block', marginBottom: '5px' }}>Select Student:</label>
          <select
            id="student-select"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)',
              marginBottom: '10px'
            }}
            disabled={formMode === 'edit' || loading}
          >
            <option value="">-- Select a Student --</option>
            {filteredStudents.map((student) => (
              <option key={student.s_id} value={student.s_id}>
                {student.name} - Class: {student.class} (ID: {student.s_id})
              </option>
            ))}
          </select>
          {loading && <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading students...</div>}
          {!loading && filteredStudents.length === 0 && selectedClass && (
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No students found in this class</div>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="payment-amount" style={{ display: 'block', marginBottom: '5px' }}>Amount:</label>
          <input
            id="payment-amount"
            type="number"
            name="amount"
            value={paymentData.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)',
              marginBottom: '10px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="payment-date" style={{ display: 'block', marginBottom: '5px' }}>Payment/Due Date:</label>
          <input
            id="payment-date"
            type="date"
            name="paymentDate"
            value={paymentData.paymentDate}
            onChange={handleInputChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)',
              marginBottom: '10px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="payment-status" style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
          <select
            id="payment-status"
            name="status"
            value={paymentData.status}
            onChange={handleInputChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)',
              marginBottom: '10px'
            }}
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        
        {paymentData.status === 'paid' && (
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="payment-method" style={{ display: 'block', marginBottom: '5px' }}>Payment Method:</label>
            <select
              id="payment-method"
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handleInputChange}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid var(--border-color)',
                marginBottom: '10px'
              }}
            >
              <option value="cash">Cash</option>
              <option value="online">Online Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card Payment</option>
            </select>
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="payment-description" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
          <textarea
            id="payment-description"
            name="description"
            value={paymentData.description}
            onChange={handleInputChange}
            placeholder="Enter payment description (e.g., Tuition Fee, Library Fee)"
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)',
              marginBottom: '10px',
              minHeight: '80px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={formMode === 'add' ? addPayment : updatePayment}
            style={{ 
              padding: '10px 20px', 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {formMode === 'add' ? 'Add Payment' : 'Update Payment'}
          </button>
          
          {formMode === 'edit' && (
            <button 
              onClick={() => {
                setFormMode('add');
                setEditPaymentId(null);
                setPaymentData({
                  amount: '',
                  paymentDate: new Date().toISOString().split('T')[0],
                  paymentMethod: 'cash',
                  description: '',
                  status: 'paid'
                });
              }}
              style={{ 
                padding: '10px 20px', 
                background: 'var(--secondary)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>
    );
  };

  // Function to render the payment records
  const renderPaymentRecords = () => {
    return (
      <div className="payment-records" style={{ 
        padding: '20px', 
        borderRadius: '8px', 
        background: 'var(--surface)', 
        boxShadow: '0 2px 4px var(--border-color)',
        overflowY: 'auto',
        maxHeight: isMobile ? '500px' : '600px',
        order: isMobile ? '2' : 'unset'
      }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Payment Records</h2>
        
        {selectedStudent ? (
          <>
            <h3>
              Student: {findStudentName(selectedStudent)} (ID: {selectedStudent})
            </h3>
            
            {payments[selectedStudent] && payments[selectedStudent].length > 0 ? (
              payments[selectedStudent].map(payment => renderPaymentRecord(payment))
            ) : (
              <p>No payment records found for this student.</p>
            )}
          </>
        ) : (
          <p>Please select a student to view payment records.</p>
        )}
      </div>
    );
  };

  // Function to render the summary section
  const renderSummarySection = () => {
    return (
      <div className="payment-summary" style={{ 
        marginTop: '20px',
        padding: '20px', 
        borderRadius: '8px', 
        background: 'var(--surface)', 
        boxShadow: '0 2px 4px var(--border-color)' 
      }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Payment Summary</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '100%' : '200px'}, 1fr))`, 
          gap: '15px' 
        }}>
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px', 
            background: 'rgba(99, 102, 241, 0.1)', 
            border: '1px solid var(--primary)' 
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Total Students</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{students.length}</p>
          </div>
          
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px', 
            background: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid var(--success)' 
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Total Payments</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              ₹{Object.values(payments).reduce((total, studentPayments) => {
                return total + studentPayments
                  .filter(payment => payment.status === 'paid')
                  .reduce((sum, payment) => sum + payment.amount, 0);
              }, 0).toFixed(2)}
            </p>
          </div>
          
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid var(--warning)' 
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Pending Payments</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              ₹{Object.values(payments).reduce((total, studentPayments) => {
                return total + studentPayments
                  .filter(payment => payment.status === 'pending')
                  .reduce((sum, payment) => sum + payment.amount, 0);
              }, 0).toFixed(2)}
            </p>
          </div>
          
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid var(--danger)' 
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Overdue Payments</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              ₹{Object.values(payments).reduce((total, studentPayments) => {
                return total + studentPayments
                  .filter(payment => payment.status === 'overdue')
                  .reduce((sum, payment) => sum + payment.amount, 0);
              }, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar pageTitle={"Payment Information"} />
        
        <div className="content-wrapper" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Use CSS grid with responsive layout */}
          <div className="payment-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
            gap: '20px'
          }}>
            {renderPaymentForm()}
            {renderPaymentRecords()}
          </div>
          
          {renderSummarySection()}
        </div>
      </main>
    </div>
  );
}

export default PaymentInformation;
