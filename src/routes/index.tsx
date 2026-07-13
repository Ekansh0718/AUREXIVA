import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Home } from '@/pages/Home'
import { Products } from '@/pages/Products'
import { ProductDetail } from '@/pages/ProductDetail'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { Cart } from '@/pages/Cart'
import { Profile } from '@/pages/Profile'
import { Orders } from '@/pages/Orders'
import { Checkout } from '@/pages/Checkout'
import { MockPaymentGateway } from '@/pages/payment/MockPaymentGateway'
import { PaymentCallback } from '@/pages/payment/PaymentCallback'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { PrivacyPolicy } from '@/pages/policies/PrivacyPolicy'
import { TermsOfService } from '@/pages/policies/TermsOfService'
import { NotFound } from '@/pages/NotFound'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

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
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
      { path: 'cart', element: <Cart /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/callback',
        element: (
          <ProtectedRoute>
            <PaymentCallback />
          </ProtectedRoute>
        ),
      },
      {
        path: 'order-confirmation/:orderId',
        element: (
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        ),
      },
      { path: 'policies/privacy', element: <PrivacyPolicy /> },
      { path: 'policies/terms', element: <TermsOfService /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    // Deliberately outside AppLayout — this simulates leaving the site for
    // the bank's own hosted payment page, so it has no AUREXIVA nav/footer.
    path: '/payment/gateway/:orderId',
    element: (
      <ProtectedRoute>
        <MockPaymentGateway />
      </ProtectedRoute>
    ),
  },
])
