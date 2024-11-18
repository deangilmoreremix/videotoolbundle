import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Tools from '../pages/Tools';
import Home from '../pages/Home';
import Pricing from '../pages/Pricing';
import VideoMergePage from '../pages/tools/VideoMerge';

// Import other tool components...

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tools', element: <Tools /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'tools/video-merge', element: <VideoMergePage /> },
      // ... other routes
    ]
  }
]);