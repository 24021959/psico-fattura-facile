import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

export function TopBar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { profile: userProfile } = useProfile();
  
  // Funzione per determinare il genere dal nome
  const getGenderFromName = (nome: string): 'M' | 'F' => {
    const femaleNames = [
      'alessandra', 'anna', 'barbara', 'carla', 'chiara', 'cristina', 'elena', 'francesca', 
      'giulia', 'laura', 'maria', 'monica', 'paola', 'roberta', 'sara', 'silvia', 'valentina',
      'federica', 'giovanna', 'lucia', 'emanuela', 'lorena', 'daniela', 'claudia', 'veronica',
      'sabrina', 'antonella', 'patrizia', 'manuela', 'elisa', 'raffaella', 'teresa', 'grazia',
      'caterina', 'elisabetta', 'rosa', 'angela', 'franca', 'rita', 'donatella', 'simona'
    ];
    return femaleNames.includes(nome.toLowerCase()) ? 'F' : 'M';
  };

  // Genera messaggio di benvenuto personalizzato
  const getWelcomeMessage = () => {
    if (!userProfile?.nome) return "Benvenuto nel tuo gestionale sanitario";
    
    const gender = getGenderFromName(userProfile.nome);
    const title = gender === 'F' ? 'Dott.ssa' : 'Dott.';
    const welcome = gender === 'F' ? 'Benvenuta' : 'Benvenuto';
    
    return `${welcome} ${title} ${userProfile.nome}`;
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  return (
    <header className="h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="p-2 hover:bg-secondary rounded-lg transition-colors" />
        </div>

        {/* Center section - can be used for search or current page title */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground hidden md:block">
            {getWelcomeMessage()}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profilo" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.nome?.charAt(0) || 'U'}{profile?.cognome?.charAt(0) || 'N'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.nome} {profile?.cognome}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/impostazioni')}>
                <User className="mr-2 h-4 w-4" />
                Profilo e Impostazioni
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Esci dall'account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}