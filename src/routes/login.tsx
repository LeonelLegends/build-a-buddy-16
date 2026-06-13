import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { checkEmailRegistered } from "@/lib/users.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Legends Insurance Services" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const checkEmail = useServerFn(checkEmailRegistered);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const showDialog = (msg: string) => {
    setEmail("");
    setPassword("");
    setDialog(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        // Could be wrong password or unregistered. Check if email exists.
        try {
          const res = await checkEmail({ data: { email } });
          if (!res.registered) {
            showDialog("Unregistered user. Contact the System Administrator.");
            return;
          }
        } catch {
          // fall through to generic error
        }
        toast.error("Incorrect password.");
        setPassword("");
        return;
      }
      // Signed in — check admin/master role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);
      const hasAccess = (roles ?? []).some((r) => r.role === "admin" || r.role === "master");
      if (!hasAccess) {
        await supabase.auth.signOut();
        showDialog("User without authorized access.");
        return;
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-primary">Admin Access</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to manage leads.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex flex-col">
          <label className="mb-1.5 text-sm font-medium text-foreground/80">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1.5 text-sm font-medium text-foreground/80">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Sign in"}
        </button>
      </form>

      <Link to="/" className="mt-6 text-center text-xs text-muted-foreground hover:text-primary">
        ← Back to site
      </Link>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign-in error</DialogTitle>
            <DialogDescription>{dialog}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialog(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
