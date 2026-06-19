import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Parcelamentos from './pages/Parcelamentos'
import Parcelas from './pages/Parcelas'
import Cobrancas from './pages/Cobrancas'
import Financeiro from './pages/Financeiro'
import Configuracoes from './pages/Configuracoes'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="parcelamentos" element={<Parcelamentos />} />
            <Route path="parcelas" element={<Parcelas />} />
            <Route path="cobrancas" element={<Cobrancas />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
