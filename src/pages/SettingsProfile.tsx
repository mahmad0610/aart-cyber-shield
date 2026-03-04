import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Info } from "lucide-react";

const SettingsProfile = () => {
  const [displayName, setDisplayName] = useState("Jane Developer");
  const email = "jane@github-oauth.dev";

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your display name has been saved.",
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Profile</h1>
      <p className="text-muted-foreground text-sm mb-8">Manage your account information.</p>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Details
          </CardTitle>
          <CardDescription>Update your display name. Email is managed via GitHub OAuth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input
              id="email"
              value={email}
              readOnly
              disabled
              className="max-w-md opacity-60"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Info className="h-3 w-3" />
              Email is sourced from GitHub OAuth and cannot be changed here.
            </p>
          </div>

          <Button onClick={handleSave} className="mt-2">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsProfile;
