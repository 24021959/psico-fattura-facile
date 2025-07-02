import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Search, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Pazienti() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestione Pazienti</h1>
            <p className="text-muted-foreground">
              Gestisci l'anagrafica dei tuoi pazienti
            </p>
          </div>
          <Button className="medical-gradient text-primary-foreground hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Paziente
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca pazienti per nome, cognome o codice fiscale..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                Filtri
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="grid gap-4">
          {/* Patient Card */}
          <Card className="shadow-medical hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Maria Bianchi</h3>
                    <p className="text-sm text-muted-foreground">CF: BNCMRA85T65H501Z</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        maria.bianchi@email.it
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        +39 338 123 4567
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Modifica
                  </Button>
                  <Button variant="outline" size="sm">
                    Fatture
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                    Nuova Fattura
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medical hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Giuseppe Verdi</h3>
                    <p className="text-sm text-muted-foreground">CF: VRDGPP75L12F205K</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        giuseppe.verdi@email.it
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        +39 347 987 6543
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Modifica
                  </Button>
                  <Button variant="outline" size="sm">
                    Fatture
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                    Nuova Fattura
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medical hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Anna Rossi</h3>
                    <p className="text-sm text-muted-foreground">CF: RSSANN90P45B963L</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        anna.rossi@email.it
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        +39 320 555 7890
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Modifica
                  </Button>
                  <Button variant="outline" size="sm">
                    Fatture
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                    Nuova Fattura
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}