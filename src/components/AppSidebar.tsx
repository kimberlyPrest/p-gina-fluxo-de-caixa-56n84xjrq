import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, Settings, LogOut, Users, Truck } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-lg leading-none">
              F
            </span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Fluxo.</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/top-clientes'}>
                <Link to="/top-clientes">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Top Clientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/top-fornecedores'}>
                <Link to="/top-fornecedores">
                  <Truck className="h-4 w-4" />
                  <span className="font-medium">Top Fornecedores</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/relatorios'}>
                <Link to="/relatorios">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Relatórios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/configuracoes'}>
                <Link to="/">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-muted-foreground hover:text-destructive">
              <button onClick={() => console.log('Logout')}>
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sair da conta</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
