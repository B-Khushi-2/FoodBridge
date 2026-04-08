import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ListingsProvider } from './context/ListingsContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ListingsProvider>
    </AuthProvider>
  );
}