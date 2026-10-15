import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import OverviewTab     from '../components/dashboard/OverviewTab';
import DocumentsTab    from '../components/dashboard/DocumentsTab';
import DepartmentsTab  from '../components/dashboard/DepartmentsTab';
import ProfileTab      from '../components/dashboard/ProfileTab';

const DashboardPage: React.FC = () => (
  <DashboardLayout>
    <Routes>
      <Route index             element={<OverviewTab    />} />
      <Route path="documents"  element={<DocumentsTab   />} />
      <Route path="departments"element={<DepartmentsTab />} />
      <Route path="profile"    element={<ProfileTab     />} />
      <Route path="*"          element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </DashboardLayout>
);

export default DashboardPage;
