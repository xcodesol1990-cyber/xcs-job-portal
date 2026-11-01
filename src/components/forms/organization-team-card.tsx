"use client";

import { useState } from "react";
import { UserPlus, CheckCircle2, Loader2, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { inviteTeamMemberAction } from "@/server/actions/organization.actions";

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: "OWNER" | "MANAGER" | "AUDITOR";
  status: "ACTIVE" | "INVITED";
  joinedAt: Date;
}

interface OrganizationTeamCardProps {
  organizationName: string;
  seatsUsed?: number;
  seatsLimit: number;
  taxId: string;
  initialMembers: TeamMember[];
}

export function OrganizationTeamCard({
  organizationName,
  seatsLimit,
  taxId,
  initialMembers,
}: OrganizationTeamCardProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MANAGER" | "AUDITOR">("MANAGER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await inviteTeamMemberAction(inviteEmail, inviteRole);
      if (res.success && res.result) {
        const newMember: TeamMember = {
          id: `mem-${Date.now()}`,
          email: res.result.invitedEmail,
          role: inviteRole,
          status: "INVITED",
          joinedAt: new Date(),
        };
        setMembers((prev) => [...prev, newMember]);
        setShowInviteModal(false);
        setInviteEmail("");
        setStatusMessage(`Invitation dispatched to ${res.result.invitedEmail}!`);
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "purple";
      case "MANAGER":
        return "info";
      case "AUDITOR":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-500" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {organizationName} &middot; Enterprise Workspace
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            EIN / Corporate Tax ID: <span className="font-mono font-medium">{taxId}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite Colleague</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Seats Usage Bar */}
      <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">Team Seats Assigned</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {members.length} of {seatsLimit} seats used
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
            style={{ width: `${(members.length / seatsLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Authorized Organization Members
        </h4>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3.5 px-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold text-xs uppercase">
                  {(m.name ?? m.email).slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {m.name ?? m.email.split("@")[0]}
                  </p>
                  <p className="text-[11px] text-zinc-500">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {m.status === "INVITED" && <Badge variant="warning">Pending Invite</Badge>}
                <Badge variant={getRoleBadgeVariant(m.role)}>{m.role}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleInviteSubmit}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Invite Team Member
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Grant hiring or audit privileges to colleagues within {organizationName}.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Work Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@yourcompany.com"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Workspace Role & Permissions
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "MANAGER" | "AUDITOR")}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="MANAGER">
                  Hiring Manager (Post jobs, fund escrow, approve deliverables)
                </option>
                <option value="AUDITOR">
                  Finance Auditor (Read-only access to ledger & invoices)
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !inviteEmail.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Send Invitation"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
