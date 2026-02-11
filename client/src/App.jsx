import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/login';
import Nav from './components/Navbar';
import Appointments from './components/Appointments';
import Analytics from './components/Analytics';
import ResetPassword from './components/ResetPassword';
import SalonAdmin from './components/SalonAdmin';
import PlanitySalonPage from './components/PlanitySalonPage';
import PlanityBookingPage from './components/PlanityBookingPage';
import { AuthProvider } from './AuthContext';
import SearchPage from './components/SearchPage';
import SearchResults from './components/SearchResults';
import Footer from './components/Footer';
import Profile from './components/Profile';
import ProfessionalAccess from './components/ProfessionalAccess';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import ProfessionalLanding from './components/ProfessionalLanding';
import ProLandingPage from './components/ProLandingPage';
import PlanityProLogin from './components/PlanityProLogin';
import PlanityProRegister from './components/PlanityProRegister';
import ProSalonSetup from './components/ProSalonSetup';
import ProForgotPassword from './components/ProForgotPassword';
import AccountPage from './components/AccountPage';
import ProfileSettings from './components/ProfileSettings';
import ResetPasswordForm from './components/ResetPasswordForm';
import MesProches from './components/MesProches';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import InvitationAccept from './components/InvitationAccept';
import ErrorBoundary from './components/ErrorBoundary';
import PlanityCareersPage from './components/PlanityCareersPage';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
        <Routes>
          {/* Page d'accueil : Nouvelle page d'accueil */}
          <Route path="/" element={
            <Home />
          } />

          {/* Page de connexion */}
          <Route path="/login" element={
            <>
              <Nav />
              <Login />
              <Footer />
            </>
          } />

          {/* Page d'inscription */}
          <Route path="/register" element={
            <>
              <Nav />
              <Login isRegister={true} />
              <Footer />
            </>
          } />

          {/* Page des rendez-vous */}
          <Route path="/appointments" element={
            <>
              <Nav />
              <Appointments />
              <Footer />
            </>
          } />

          {/* Page de profil */}
          <Route path="/profile" element={
            <>
              <Nav />
              <Profile />
              <Footer />
            </>
          } />

          {/* Page compte client */}
          <Route path="/account" element={
            <>
              <AccountPage />
            </>
          } />

          {/* Page paramètres profil client */}
          <Route path="/account/settings" element={
            <>
              <ProfileSettings />
            </>
          } />

          {/* Page réinitialisation mot de passe */}
          <Route path="/account/reset-password" element={
            <>
              <ResetPasswordForm />
            </>
          } />

          {/* Page mes proches */}
          <Route path="/account/proches" element={
            <>
              <MesProches />
            </>
          } />

          {/* Page d'analyses */}
          <Route path="/analytics" element={
            <>
              <Nav />
              <Analytics />
              <Footer />
            </>
          } />

          {/* Page de réinitialisation */}
          <Route path="/reset-password" element={
            <>
              <Nav />
              <ResetPassword />
              <Footer />
            </>
          } />

          {/* Page admin salon */}
          <Route path="/admin" element={
            <>
              <Nav />
              <SalonAdmin />
              <Footer />
            </>
          } />

          {/* Page de recherche */}
          <Route path="/search" element={
            <>
              <SearchPage />
            </>
          } />



          {/* Page détails salon */}
          <Route path="/salon/:id" element={
            <>
              <PlanitySalonPage />
            </>
          } />

          {/* Page réservation */}
          <Route path="/booking/:salonId/:serviceId" element={
            <>
              <PlanityBookingPage />
            </>
          } />

          {/* Page pro landing / onboarding */}
          <Route path="/pro-landing" element={
            <>
              <ProLandingPage />
            </>
          } />

          {/* Page demande de demo soumise */}
          <Route path="/professional/demo-submitted" element={
            <>
              <ProfessionalAccess />
            </>
          } />

          {/* Page pro login */}
          <Route path="/pro-login" element={
            <>
              <PlanityProLogin />
            </>
          } />

          {/* Page pro register */}
          <Route path="/pro-register" element={
            <>
              <PlanityProRegister />
            </>
          } />

          {/* Page setup salon pro */}
          <Route path="/pro-salon-setup" element={
            <>
              <ProSalonSetup />
            </>
          } />

          {/* Page pro forgot password */}
          <Route path="/pro-forgot-password" element={
            <>
              <ProForgotPassword />
            </>
          } />

          {/* Page choix professionnel */}
          <Route path="/professional" element={
            <>
              <ProfessionalLanding />
            </>
          } />

          {/* Tableau de bord professionnel */}
          <Route path="/professional/dashboard" element={
            <>
              <Nav />
              <ProfessionalDashboard />
              <Footer />
            </>
          } />

          {/* Page admin login */}
          <Route path="/admin/login" element={
            <AdminLogin />
          } />

          {/* Page admin dashboard */}
          <Route path="/admin/dashboard" element={
            <AdminDashboard />
          } />

          {/* Page acceptation invitation */}
          <Route path="/invitation/:token" element={
            <InvitationAccept />
          } />

          {/* Page careers / recrutement */}
          <Route path="/careers" element={
            <PlanityCareersPage />
          } />
        </Routes>
      </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
