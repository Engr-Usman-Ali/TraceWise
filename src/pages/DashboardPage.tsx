import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from '../components/layout/DashboardLayout';

import OverviewTab from '../components/dashboard/OverviewTab';
import DocumentsTab from '../components/dashboard/DocumentsTab';
import DepartmentsTab from '../components/dashboard/DepartmentsTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import ImpactReportsTab from '../components/dashboard/ImpactReportsTab';
import DependencyExplorerTab from '../components/dashboard/DependencyExplorerTab';

const DashboardPage: React.FC = () => {
  const accessToken = localStorage.getItem('access_token') ?? '';

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<OverviewTab />} />

        <Route
          path="documents"
          element={<DocumentsTab />}
        />

        <Route
          path="departments"
          element={<DepartmentsTab />}
        />

        <Route
          path="impact-reports"
          element={
            <ImpactReportsTab
              accessToken={accessToken}
              onOpenReport={(reportId) => {
                console.log('Open impact report:', reportId);
              }}
            />
          }
        />
        <Route
          path="dependency-explorer"
          element={
            <DependencyExplorerTab
              accessToken={accessToken}
            />
          }
        />

        <Route
          path="profile"
          element={<ProfileTab />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;