import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Home } from '@/pages/Home'
import { Products } from '@/pages/Products'
import { ProductDetail } from '@/pages/ProductDetail'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Cart } from '@/pages/Cart'
import { Profile } from '@/pages/Profile'
import { Orders } from '@/pages/Orders'
import { Checkout } from '@/pages/Checkout'
import { NotFound } from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'product/:slug', element: <ProductDetail /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'cart', element: <Cart /> },
      { path: 'profile', element: <Profile /> },
      { path: 'orders', element: <Orders /> },
      { path: 'checkout', element: <Checkout /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
