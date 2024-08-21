import React from 'react'
import StudentsApplications from '../../app/components/student/StudentsApplications';
import AdminLayout from './adminLayout';

export default function admissions_list() {
  return (
    <AdminLayout>
        <StudentsApplications />
    </AdminLayout>
  )
}
