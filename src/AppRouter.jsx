import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './admin/pages/LoginPage';
import Dashboard from './admin/pages/Dashboard';
import Products from './admin/pages/Products';
import AdminRoute from './admin/AdminRoute';
import Home from './components/Home';
import Menu from './components/Menu';
import ProductsDetails from './components/ProductsDetails';
import PrivacyPolicy from './components/PrivacyPolicy';
import ShoppinCart from './components/ShoppinCart';
import Checkout from './components/Checkout';
import CookieConsent from './components/CookieConsent';
import Header from './components/Header';
import Footer from './components/Footer';
import { Suspense } from 'react';

const Loading = () => <div>Carregando...</div>;

export default function AppRouter() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={
        <Suspense fallback={<Loading />}>
          <Layout><Home /></Layout>
        </Suspense>
      } />

      <Route path="/cardapio" element={
        <Suspense fallback={<Loading />}>
          <Layout><Menu /></Layout>
        </Suspense>
      } />

      <Route path="/produto/:id" element={
        <Suspense fallback={<Loading />}>
          <Layout><ProductsDetails /></Layout>
        </Suspense>
      } />

      <Route path="/politica-de-privacidade" element={
        <Suspense fallback={<Loading />}>
          <Layout><PrivacyPolicy /></Layout>
        </Suspense>
      } />

      <Route path="/carrinho" element={
        <Suspense fallback={<Loading />}>
          <Layout><ShoppinCart /></Layout>
        </Suspense>
      } />

      <Route path="/finalizar-pedido" element={
        <Suspense fallback={<Loading />}>
          <Layout><Checkout /></Layout>
        </Suspense>
      } />

      {/* Rota de Login do Admin */}
      <Route path="/admin/login" element={
        <Suspense fallback={<Loading />}>
          <LoginPage />
        </Suspense>
      } />

      {/* Rotas Protegidas do Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="/admin/dashboard" element={
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="/admin/products" element={
          <Suspense fallback={<Loading />}>
            <Products />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
}

// Layout sem Header/Footer
function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}