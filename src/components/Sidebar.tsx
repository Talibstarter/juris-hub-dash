import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  FileCheck, 
  MessageSquare, 
  FileText, 
  Scale,
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
  { name: 'Document Checklist', href: '/checklist', icon: FileCheck },
  { name: "Clients' Questions", href: '/questions', icon: MessageSquare },
  { name: 'Submitted Documents', href: '/documents', icon: FileText },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-gradient-primary shadow-elegant flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-primary-light/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <Scale className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">LegalDash</h1>
            <p className="text-sm text-primary-foreground/70">Case Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-primary-foreground/80 hover:bg-primary-light/20 hover:text-primary-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-light/20">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-primary-foreground/80 hover:bg-primary-light/20 hover:text-primary-foreground"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;