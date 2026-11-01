import type { Metadata } from "next";
import { auth } from "@/server/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ContractService } from "@/server/services/contract.service";
import { PrintButton } from "@/components/ui/print-button";
import { ShieldCheck, ArrowLeft, CheckCircle2, Lock, Building, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Official Milestone Invoice & Settlement Receipt · WorkWasl",
  description: "Official cryptographic settlement invoice and milestone escrow receipt.",
};

interface ContractInvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContractInvoicePage({ params }: ContractInvoicePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/contracts/${id}/invoice`);
  }

  const contract = await ContractService.getContract(id, session.user.id);
  if (!contract) {
    notFound();
  }

  const invoiceNumber = `INV-${contract.id.slice(0, 8).toUpperCase()}`;
  const isClient = session.user.id === contract.clientId;
  const currency = contract.currency || "USD";

  const totalMilestonesCents = contract.milestones.reduce(
    (acc, m) => acc + Number(m.amountCents),
    0,
  );
  const clientFeeCents = Number(contract.clientFeeCents ?? 100n);
  const freelancerFeeCents = Number(contract.freelancerFeeCents ?? 100n);

  const clientTotalCents = totalMilestonesCents + clientFeeCents;
  const freelancerNetCents = totalMilestonesCents - freelancerFeeCents;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation & Print Controls (Hidden on Print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={`/contracts/${contract.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Contract Workspace</span>
          </Link>

          <PrintButton />
        </div>

        {/* Invoice Paper Document */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 print:border-none print:shadow-none print:p-6 print:rounded-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-zinc-200 pb-8 dark:border-zinc-800 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    Work<span className="text-indigo-600">Wasl</span>
                  </span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    Cryptographic Escrow Protocol
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 max-w-sm">
                Official double-entry settlement receipt and milestone release ledger.
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>SETTLED & AUDITED</span>
              </span>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                {invoiceNumber}
              </h2>
              <p className="text-xs text-zinc-500">
                Date: {new Date(contract.createdAt).toLocaleDateString()}
              </p>
              <p className="text-[11px] font-mono text-zinc-400">
                Policy: {contract.feePolicyVersion}
              </p>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-zinc-200 dark:border-zinc-800 text-xs">
            {/* Client (Billed To) */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400">
                <Building className="h-3.5 w-3.5 text-indigo-500" />
                <span>Billed To (Employer)</span>
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {contract.client.clientProfile?.companyName ?? contract.client.name}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 font-mono">{contract.client.email}</p>
              <p className="text-zinc-500">
                Account ID: <span className="font-mono">{contract.clientId.slice(0, 12)}...</span>
              </p>
            </div>

            {/* Contractor (Payee) */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400">
                <User className="h-3.5 w-3.5 text-purple-500" />
                <span>Service Provider (Contractor)</span>
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {contract.freelancer.name}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 font-mono">
                {contract.freelancer.email}
              </p>
              <p className="text-zinc-500">
                Account ID:{" "}
                <span className="font-mono">{contract.freelancerId.slice(0, 12)}...</span>
              </p>
            </div>
          </div>

          {/* Project Overview */}
          <div className="py-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Engagement Subject
            </h3>
            <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {contract.job?.title ?? "Milestone Escrow Contract"}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Standard Milestone Escrow Agreement · Status: {contract.status}
            </p>
          </div>

          {/* Milestones Line Items Table */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3.5 pl-4">Milestone Item</th>
                  <th className="p-3.5">Escrow State</th>
                  <th className="p-3.5 text-right pr-4">Amount ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {contract.milestones.map((m, idx) => (
                  <tr key={m.id}>
                    <td className="p-3.5 pl-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <span className="font-mono text-zinc-400 mr-2">#{idx + 1}</span>
                      {m.title}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${(Number(m.amountCents) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full sm:w-80 space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Milestone Scope Subtotal:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  ${(totalMilestonesCents / 100).toFixed(2)}
                </span>
              </div>

              {isClient ? (
                <>
                  <div className="flex justify-between text-zinc-500">
                    <span>WorkWasl Platform Flat Fee:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      +${(clientFeeCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-3 text-sm font-black text-zinc-900 dark:text-zinc-50">
                    <span>Total Client Payment:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      ${(clientTotalCents / 100).toFixed(2)} {currency}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-zinc-500">
                    <span>WorkWasl Platform Flat Fee:</span>
                    <span className="font-mono font-semibold text-zinc-500">
                      -${(freelancerFeeCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-3 text-sm font-black text-zinc-900 dark:text-zinc-50">
                    <span>Total Contractor Net:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      ${(freelancerNetCents / 100).toFixed(2)} {currency}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Audit Verification Footer */}
          <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-zinc-400 gap-3">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Immutable append-only ledger snapshot · ID: {contract.id}</span>
            </div>
            <div>WorkWasl Technologies Inc. · All Rights Reserved</div>
          </div>
        </div>
      </div>
    </div>
  );
}
