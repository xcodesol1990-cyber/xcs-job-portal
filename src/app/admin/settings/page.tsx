import { adminService } from "@/server/services/admin.service";
import { AdminSettingsTabs } from "@/components/admin/admin-settings-tabs";
import { Sliders, ShieldCheck, DollarSign, Clock } from "lucide-react";

export const metadata = {
  title: "Platform Settings & Governance | WorkNest Admin",
};

export default async function AdminSettingsPage() {
  const [settings, auditLogs] = await Promise.all([
    adminService.getPlatformSettings(),
    adminService.getSettingsAuditLogs(25),
  ]);

  const platformFeeSetting = settings.find((s) => s.key === "platform_fee_bps");
  const autoApproveSetting = settings.find((s) => s.key === "auto_approve_days");
  const maintenanceSetting = settings.find((s) => s.key === "maintenance_mode");

  const feeBps = typeof platformFeeSetting?.value === "number" ? platformFeeSetting.value : 1000;
  const autoApproveDays =
    typeof autoApproveSetting?.value === "number" ? autoApproveSetting.value : 14;
  const isMaintenance = maintenanceSetting?.value === true;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Platform Settings & Governance
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage system configurations, escrow fee schedules, dispute arbitration windows, and
          marketplace policies from a centralized control panel.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Settings
            </span>
            <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {settings.length}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">Live DB configuration keys</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Escrow Fee
            </span>
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {(feeBps / 100).toFixed(1)}%
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">{feeBps} bps commission</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Auto-Release
            </span>
            <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {autoApproveDays} Days
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">Inactivity escrow trigger</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Platform Status
            </span>
            <ShieldCheck
              className={`h-4 w-4 ${isMaintenance ? "text-amber-500" : "text-emerald-500"}`}
            />
          </div>
          <p
            className={`mt-2 text-2xl font-black ${
              isMaintenance
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isMaintenance ? "Maintenance" : "Operational"}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">Live marketplace rails</p>
        </div>
      </div>

      {/* Tab-based Settings Module */}
      <AdminSettingsTabs initialSettings={settings} auditLogs={auditLogs} />
    </div>
  );
}
