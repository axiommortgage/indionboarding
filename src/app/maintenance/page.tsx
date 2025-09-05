import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Construction } from "lucide-react";

export default function MaintenancePage() {
  const maintenanceEndTime = process.env.MAINTENANCE_END_TIME || "soon";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Construction className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            System Maintenance
          </CardTitle>
          <CardDescription className="text-lg">
            We're performing scheduled maintenance to improve your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-600">
            IndiCentral is temporarily unavailable while we perform system
            updates.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 font-medium">
              Expected completion: {maintenanceEndTime}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            We apologize for any inconvenience. Please check back shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
