import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listManagedUsers,
  setUserAdminRole,
  setUserMasterRole,
  createManagedUser,
  deleteManagedUser,
  updateUserEmail,
  changeOwnPassword,
} from "@/lib/users.functions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Crown, Plus, KeyRound, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/crm/users")({
  head: () => ({ meta: [{ title: "Users — Legends CRM" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: UsersPage,
});

type Row = { id: string; email: string; created_at: string; roles: ("admin" | "user" | "master")[] };

const PASSWORD_RULES = "At least 8 characters with uppercase, lowercase, a number, and one of: * - # @";

function UsersPage() {
  const list = useServerFn(listManagedUsers);
  const setAdmin = useServerFn(setUserAdminRole);
  const setMaster = useServerFn(setUserMasterRole);
  const createUser = useServerFn(createManagedUser);
  const removeUser = useServerFn(deleteManagedUser);
  const setEmail = useServerFn(updateUserEmail);
  const changePw = useServerFn(changeOwnPassword);

  const [rows, setRows] = useState<Row[]>([]);
  const [callerId, setCallerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [emailEdit, setEmailEdit] = useState<Row | null>(null);
  const [confirmDel, setConfirmDel] = useState<Row | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await list();
      setRows(res.users as Row[]);
      setCallerId(res.callerId);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { reload(); }, []);

  const me = useMemo(() => rows.find((r) => r.id === callerId), [rows, callerId]);
  const isMaster = !!me?.roles.includes("master");

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  const toggleAdmin = async (r: Row) => {
    setBusy(r.id);
    try {
      const isAdmin = r.roles.includes("admin") || r.roles.includes("master");
      await setAdmin({ data: { userId: r.id, makeAdmin: !isAdmin } });
      await reload();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const toggleMaster = async (r: Row) => {
    setBusy(r.id);
    try {
      await setMaster({ data: { userId: r.id, makeMaster: !r.roles.includes("master") } });
      await reload();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage system users{isMaster ? " (you are the Master / Superuser)" : ""}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPwOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" /> Change password
          </Button>
          {isMaster && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add user
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-slate-500">Loading…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-slate-500">No users</TableCell></TableRow>
            ) : rows.map((r) => {
              const targetIsMaster = r.roles.includes("master");
              const targetIsAdmin = r.roles.includes("admin") || targetIsMaster;
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{r.id.slice(0, 8)}…</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{r.email || "—"}</span>
                      {isMaster && (
                        <button title="Edit email" className="text-slate-400 hover:text-slate-700" onClick={() => setEmailEdit(r)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{fmt(r.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {targetIsMaster && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800"><Crown className="h-3 w-3" /> master</span>}
                      {r.roles.includes("admin") && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">admin</span>}
                      {!targetIsAdmin && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">user</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={targetIsAdmin ? "outline" : "default"}
                        disabled={busy === r.id || (targetIsMaster && !isMaster)}
                        onClick={() => toggleAdmin(r)}
                      >
                        {targetIsAdmin ? "Disable" : "Enable"}
                      </Button>
                      {isMaster && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === r.id}
                          onClick={() => toggleMaster(r)}
                          title={targetIsMaster ? "Remove master" : "Make master"}
                        >
                          <Crown className="mr-1 h-3.5 w-3.5" />
                          {targetIsMaster ? "Unmaster" : "Master"}
                        </Button>
                      )}
                      {isMaster && !targetIsMaster && (
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDel(r)} disabled={busy === r.id}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} onSubmit={async (d) => { await changePw({ data: d }); toast.success("Password changed"); }} />
      {isMaster && <AddUserDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={async (d) => { await createUser({ data: d }); toast.success("User created"); await reload(); }} />}
      {emailEdit && (
        <EditEmailDialog
          row={emailEdit}
          onClose={() => setEmailEdit(null)}
          onSubmit={async (email) => { await setEmail({ data: { userId: emailEdit.id, email } }); toast.success("Email updated"); setEmailEdit(null); await reload(); }}
        />
      )}
      {confirmDel && (
        <Dialog open onOpenChange={(o) => !o && setConfirmDel(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove access</DialogTitle>
              <DialogDescription>Revoke admin access for {confirmDel.email}? The account remains but loses CRM access.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Button>
              <Button onClick={async () => { try { await removeUser({ data: { userId: confirmDel.id } }); toast.success("Access revoked"); setConfirmDel(null); await reload(); } catch (e: any) { toast.error(e.message); } }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ChangePasswordDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (d: { currentPassword: string; newPassword: string; repeatPassword: string }) => Promise<void> }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const reset = () => { setCurrent(""); setNext(""); setRepeat(""); };
  const submit = async () => {
    setBusy(true);
    try { await onSubmit({ currentPassword: current, newPassword: next, repeatPassword: repeat }); reset(); onOpenChange(false); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>{PASSWORD_RULES}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Current password" type="password" value={current} onChange={setCurrent} />
          <Field label="New password" type="password" value={next} onChange={setNext} />
          <Field label="Repeat password" type="password" value={repeat} onChange={setRepeat} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddUserDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (d: { email: string; password: string; makeAdmin: boolean }) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(true);
  const [busy, setBusy] = useState(false);
  const reset = () => { setEmail(""); setPassword(""); setMakeAdmin(true); };
  const submit = async () => {
    setBusy(true);
    try { await onSubmit({ email, password, makeAdmin }); reset(); onOpenChange(false); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>{PASSWORD_RULES}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Temporary password" type="password" value={password} onChange={setPassword} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={makeAdmin} onChange={(e) => setMakeAdmin(e.target.checked)} />
            Grant admin access (CRM)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditEmailDialog({ row, onClose, onSubmit }: { row: Row; onClose: () => void; onSubmit: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState(row.email);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit email</DialogTitle>
          <DialogDescription>Change the email for this user.</DialogDescription>
        </DialogHeader>
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={async () => { setBusy(true); try { await onSubmit(email); } catch (e: any) { toast.error(e.message); } finally { setBusy(false); } }} disabled={busy}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1.5 text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
    </div>
  );
}
