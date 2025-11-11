import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import type { WhitelistCheckResult } from "@shared/schema";
import { LoadingSpinner } from "./loading-spinner";

interface WhitelistStatusCardProps {
  result?: WhitelistCheckResult;
  isLoading: boolean;
  error?: Error | null;
}

export function WhitelistStatusCard({ result, isLoading, error }: WhitelistStatusCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full" data-testid="card-whitelist-status">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Whitelist Status</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <LoadingSpinner text="Checking whitelist status..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive" data-testid="card-whitelist-status">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Whitelist Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10">
            <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-destructive mb-1">Error Checking Status</h4>
              <p className="text-sm text-muted-foreground">
                {error.message || "Unable to verify your whitelist status. Please try again later."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="w-full" data-testid="card-whitelist-status">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Whitelist Status</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No status information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = () => {
    if (result.isWhitelisted && result.status === 'approved') {
      return {
        icon: CheckCircle2,
        iconColor: "text-success",
        bgColor: "bg-success/10",
        title: "Whitelisted",
        badge: "Approved",
        badgeVariant: "default" as const,
        message: "You are on the Montunos whitelist! Your account has been verified and approved.",
        testId: "status-approved"
      };
    }
    
    if (result.status === 'pending') {
      return {
        icon: Clock,
        iconColor: "text-warning",
        bgColor: "bg-warning/10",
        title: "Pending Review",
        badge: "Pending",
        badgeVariant: "secondary" as const,
        message: "Your whitelist application is currently under review. Please check back later.",
        testId: "status-pending"
      };
    }

    if (result.status === 'rejected') {
      return {
        icon: XCircle,
        iconColor: "text-destructive",
        bgColor: "bg-destructive/10",
        title: "Not Approved",
        badge: "Rejected",
        badgeVariant: "destructive" as const,
        message: "Your whitelist application was not approved. Please contact support for more information.",
        testId: "status-rejected"
      };
    }

    return {
      icon: AlertCircle,
      iconColor: "text-muted-foreground",
      bgColor: "bg-muted/50",
      title: "Not Whitelisted",
      badge: "Not Found",
      badgeVariant: "outline" as const,
      message: "Your Discord account was not found in the whitelist. Please submit the application form if you haven't already.",
      testId: "status-not-found"
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="w-full" data-testid="card-whitelist-status">
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Whitelist Status</CardTitle>
        <Badge variant={statusConfig.badgeVariant} data-testid={statusConfig.testId}>
          {statusConfig.badge}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-start gap-3 p-4 rounded-lg ${statusConfig.bgColor}`}>
          <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold ${statusConfig.iconColor} mb-1`}>
              {statusConfig.title}
            </h4>
            <p className="text-sm text-foreground/80">
              {statusConfig.message}
            </p>
          </div>
        </div>

        {result.matchedBy && result.entry && (
          <div className="pt-2 border-t space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Match Details
            </h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Matched by:</span>
                <p className="font-medium capitalize">{result.matchedBy}</p>
              </div>
              {result.entry.discordUsername && (
                <div>
                  <span className="text-muted-foreground">Discord Name:</span>
                  <p className="font-medium">{result.entry.discordUsername}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
