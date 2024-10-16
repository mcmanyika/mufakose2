import React, { useState, useEffect } from 'react';
import { database } from '../../../../utils/firebaseConfig'; // Adjust the import based on your project structure
import { ref, onValue, update } from 'firebase/database';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const Accounts = () => {
  const { data: session } = useSession();
  const loggedInUserEmail = session?.user?.email || ""; // Get the logged-in user's email

  const [admissions, setAdmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Number of admissions per page
  const [selectedAdmission, setSelectedAdmission] = useState(null); // For modal data
  const [modalOpen, setModalOpen] = useState(false); // For modal visibility
  const [formData, setFormData] = useState({}); // For the form data
  const [searchQuery, setSearchQuery] = useState(''); // For search query

  useEffect(() => {
    const admissionsRef = ref(database, 'userTypes');
    onValue(admissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const admissionsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAdmissions(admissionsArray);
      } else {
        setAdmissions([]);
      }
    });
  }, []);

  // Filter admissions based on search query
  const filteredAdmissions = admissions.filter((admission) =>
    Object.values(admission).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const indexOfLastAdmission = currentPage * itemsPerPage;
  const indexOfFirstAdmission = indexOfLastAdmission - itemsPerPage;
  const currentAdmissions = filteredAdmissions.slice(indexOfFirstAdmission, indexOfLastAdmission);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = (admission) => {
    setSelectedAdmission(admission);
    setFormData(admission); // Set form data to the selected admission
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAdmission(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const updatedData = {
      ...formData,
      editorEmail: loggedInUserEmail, // Add the logged-in user's email
      editedAt: new Date().toISOString(), // Add the current timestamp
    };

    if (formData.status === 'Accepted' && !formData.studentNumber) {
      // Generate a Student Number if the status is 'Accepted' and no Student Number exists
      updatedData.studentNumber = `STID-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const admissionsRef = ref(database, `userTypes/${selectedAdmission.id}`);
    update(admissionsRef, updatedData)
      .then(() => {
        closeModal(); // Close the modal after successful update
      })
      .catch((error) => {
        console.error("Error updating admission: ", error);
      });
  };

  const handleClickOutside = (event) => {
    const modal = document.getElementById('modal-content');
    if (modal && !modal.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (modalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalOpen]);

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center w-full">
        <div className="text-2xl font-semibold mb-4">Accounts List</div>
        <div className="three-dots flex flex-col justify-between h-4 space-y-1">
          <Link href="/admin/admission">
            <div className="w-1 h-1 bg-black rounded-full"></div>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search admissions..."
          className="border rounded w-full px-3 py-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentAdmissions.map((admission) => (
          <div
            key={admission.id}
            className="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 cursor-pointer"
            onClick={() => openModal(admission)}
          >
            <p className="text-lg font-bold mb-2 capitalize">{admission.firstName} {admission.lastName}</p>
            <p className="text-sm mb-1"><span className="font-semibold">Email:</span> {admission.email}</p>
            { admission.class && (<p className="text-sm mb-1"><span className="font-semibold">Class:</span> {admission.class}</p>) }
            <p className="text-sm mb-1"><span className="font-semibold">Phone:</span> {admission.phone}</p>
            <p className="text-sm mb-1"><span className="font-semibold">Status:</span> {admission.status}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm">
          Showing {indexOfFirstAdmission + 1} to{" "}
          {Math.min(indexOfLastAdmission, filteredAdmissions.length)} of{" "}
          {filteredAdmissions.length} admissions
        </p>
        <div>
          {Array.from({ length: Math.ceil(filteredAdmissions.length / itemsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-3 py-1 mx-1 text-sm rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedAdmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div id="modal-content" className="bg-white p-8 rounded-md w-full max-w-4xl mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit Admission</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Account ID</label>
                  <input
                    type="text"
                    name="admissionId"
                    value={formData.userID}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-2">Class</label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="border rounded w-full px-3 py-2"
                  >
                    <option value="">Select Status</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={closeModal} className="mr-4 px-4 py-2 bg-gray-300 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
