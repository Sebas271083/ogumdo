import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Historia from './pages/Historia'
import Profesor from './pages/Profesor'
import GaleriaPage from './pages/GaleriaPage'
import Contacto from './pages/Contacto'
import Calendario from './pages/Calendario'
import Descargas from './pages/Descargas'
import Login from './pages/Login'
import PanelAlumno from './pages/PanelAlumno'
import Admin from './pages/admin/Admin'
import NoEncontrada from './pages/NoEncontrada'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="historia" element={<Historia />} />
        <Route path="profesor" element={<Profesor />} />
        <Route path="galeria" element={<GaleriaPage />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="descargas" element={<Descargas />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="login" element={<Login />} />
        <Route
          path="alumno"
          element={
            <RutaProtegida rol="alumno">
              <PanelAlumno />
            </RutaProtegida>
          }
        />
        <Route
          path="admin"
          element={
            <RutaProtegida rol="admin">
              <Admin />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
