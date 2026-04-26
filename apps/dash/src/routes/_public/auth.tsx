import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@flaggy/ui/components/button";
import { Card, CardPanel } from "@flaggy/ui/components/card";
import { Google } from "../../components/icons/google";
import { loginAction } from "../../api/auth";

export const Route = createFileRoute("/_public/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleLogin = () => {
    void loginAction();
  };

  return (
    <div className="min-h-svh flex items-center justify-center">
      <Card>
        <CardPanel>
          <Button onClick={() => handleLogin()}>
            <Google />
            Sign in with Google
          </Button>
        </CardPanel>
      </Card>
    </div>
  );
}
