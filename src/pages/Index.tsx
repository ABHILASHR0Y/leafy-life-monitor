
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t">
        <p>Leafy Life Monitor &copy; {new Date().getFullYear()} - Plant Monitoring System</p>
      </footer>
    </div>
  );
};

export default Index;
