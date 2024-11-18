import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from './ui/toaster';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}