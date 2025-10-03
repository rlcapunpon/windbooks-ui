import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';
import ResetPasswordToken from './pages/Auth/ResetPasswordToken';
import VerifyEmail from './pages/Auth/VerifyEmail';
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import RoleManagement from './pages/Admin/RoleManagement';
import EditRoles from './pages/Admin/EditRoles';
import SystemSettings from './pages/Admin/SystemSettings';
import UserDashboard from './pages/User/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Organizations from './pages/Organizations';
import OrganizationsDashboard from './pages/Organizations/OrganizationsDashboard';
import OrganizationsVAT from './pages/Organizations/OrganizationsVAT';
import OrganizationsPercentageTax from './pages/Organizations/OrganizationsPercentageTax';
import OrganizationsTaxExcempt from './pages/Organizations/OrganizationsTaxExcempt';
import OrganizationAssignee from './pages/Organizations/OrganizationAssignee';
import Organization from './pages/Organizations/Organization';
import MyTasks from './pages/Tasks/MyTasks';
import AssignedTasks from './pages/Tasks/AssignedTasks';
import TaskManagement from './pages/Tasks/TaskManagement';
import Unauthorized from './pages/Error/Unauthorized';
import NotFound from './pages/Error/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPasswordToken />} />
            <Route path="/verify-email/:code" element={<VerifyEmail />} />
            <Route path="/admin" element={<ProtectedRoute><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><MainLayout><UserManagement /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute><MainLayout><RoleManagement /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/edit-roles/:userId" element={<ProtectedRoute><MainLayout><EditRoles /></MainLayout></ProtectedRoute>} />
            <Route path="/user" element={<ProtectedRoute><MainLayout><UserDashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><MainLayout><SystemSettings /></MainLayout></ProtectedRoute>} />
            <Route path="/tasks/my-tasks" element={<ProtectedRoute><MainLayout><MyTasks /></MainLayout></ProtectedRoute>} />
            <Route path="/tasks/assigned" element={<ProtectedRoute><MainLayout><AssignedTasks /></MainLayout></ProtectedRoute>} />
            <Route path="/tasks/management" element={<ProtectedRoute><MainLayout><TaskManagement /></MainLayout></ProtectedRoute>} />
            <Route path="/organizations" element={<ProtectedRoute><MainLayout><Organizations /></MainLayout></ProtectedRoute>} />
            <Route path="/organizations/dashboard" element={<ProtectedRoute><MainLayout><OrganizationsDashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/organizations/vat" element={<ProtectedRoute><MainLayout><OrganizationsVAT /></MainLayout></ProtectedRoute>} />
            <Route path="/organizations/percentage-tax" element={<ProtectedRoute><MainLayout><OrganizationsPercentageTax /></MainLayout></ProtectedRoute>} />
            <Route path="/organizations/tax-excempt" element={<ProtectedRoute><MainLayout><OrganizationsTaxExcempt /></MainLayout></ProtectedRoute>} />
            <Route path="/organizations/assignee" element={<ProtectedRoute><MainLayout><OrganizationAssignee /></MainLayout></ProtectedRoute>} />
            <Route path="/organizations/:id" element={<ProtectedRoute><MainLayout><Organization /></MainLayout></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
