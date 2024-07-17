// components/student/ClassRoutine.js
import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../../utils/firebaseConfig';
import { useGlobalState } from '../../store'; // Import useGlobalState

const ClassRoutine = () => {
  const [routine, setRoutine] = useState([]);
  const [studentClass] = useGlobalState('studentClass'); // Access studentClass from global state

  useEffect(() => {
    const routineRef = ref(database, 'classRoutine');
    onValue(routineRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filteredRoutine = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .filter(entry => entry.studentclass === studentClass) // Filter routine by studentClass
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date in descending order
        setRoutine(filteredRoutine);
      }
    });
  }, [studentClass]); // Re-run effect when studentClass changes

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="w-full text-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Class Routine</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-2 border-b">Day</th>
              <th className="p-2 border-b">Time</th>
              <th className="p-2 border-b">Subject</th>
              <th className="p-2 border-b">Teacher</th>
              <th className="p-2 border-b">Date</th>
              <th className="p-2 border-b">Room</th>
            </tr>
          </thead>
          <tbody>
            {routine.map((entry) => (
              <tr key={entry.id}>
                <td className="p-2 border-b">{getDayOfWeek(entry.date)}</td>
                <td className="p-2 border-b">{entry.time}</td>
                <td className="p-2 border-b">{entry.subject}</td>
                <td className="p-2 border-b">{entry.teacher}</td>
                <td className="p-2 border-b">{entry.date}</td>
                <td className="p-2 border-b">{entry.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassRoutine;
