/**
 * Main application entry point
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StorageAdapter } from './storage/StorageAdapter';
import { seedDatabase } from './api/seed';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { DocumentsPage } from './pages/Documents';
import { CreateDocumentPage } from './pages/CreateDocument';
import { ViewDocumentPage } from './pages/ViewDocument';
import { DraftsPage } from './pages/Drafts';
import { TemplatesPage } from './pages/Templates';
import { TemplateEditorPage } from './pages/TemplateEditor';
import { SettingsPage } from './pages/Settings';
import { HelpPage } from './pages/Help';
import './index.css';

const App: React.FC = () => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize storage
        await StorageAdapter.init();
        // Seed with test data
        await seedDatabase();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/create" element={<CreateDocumentPage />} />
          <Route path="/documents/:id" element={<ViewDocumentPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/create" element={<TemplateEditorPage />} />
          <Route path="/templates/:id/edit" element={<TemplateEditorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
