import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface UserProfileCardProps {
  user: UserType;
  onLogout: () => void;
}

export function UserProfileCard({ user, onLogout }: UserProfileCardProps) {
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=128`
    : undefined;

  const displayName = user.discriminator && user.discriminator !== "0"
    ? `${user.username}#${user.discriminator}`
    : user.username;

  return (
    <Card className="w-full" data-testid="card-user-profile">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Your Profile</CardTitle>
        <Badge variant="secondary" className="text-xs" data-testid="badge-auth-status">
          <User className="w-3 h-3 mr-1" />
          Authenticated
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20" data-testid="img-avatar">
            <AvatarImage src={avatarUrl} alt={user.username} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold truncate font-display" data-testid="text-username">
              {displayName}
            </h3>
            {user.email && (
              <p className="text-sm text-muted-foreground truncate" data-testid="text-email">
                {user.email}
              </p>
            )}
            <p className="text-xs text-muted-foreground font-mono mt-1" data-testid="text-discord-id">
              ID: {user.discordId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Logged in via Discord</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-2"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
