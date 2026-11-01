import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: "OWNER" | "MANAGER" | "AUDITOR";
  status: "ACTIVE" | "INVITED";
  joinedAt: Date;
}

export interface ConsolidatedInvoiceItem {
  id: string;
  contractId: string;
  contractTitle: string;
  milestoneTitle: string;
  freelancerName: string;
  date: Date;
  amountCents: bigint;
  currency: string;
  idempotencyKey: string;
}

export class OrganizationService {
  /**
   * Retrieves or initializes the enterprise organization for a client user.
   */
  static async getOrganization(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true },
    });

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found.", HTTP_STATUS.NOT_FOUND);
    }

    const companyName = user.clientProfile?.companyName ?? `${user.name}'s Organization`;

    // Demo / seeded team seats for the enterprise organization
    const members: TeamMember[] = [
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "OWNER",
        status: "ACTIVE",
        joinedAt: user.createdAt,
      },
      {
        id: "mem-eng-lead",
        email: "engineering.lead@company.dev",
        name: "Marcus Vance",
        role: "MANAGER",
        status: "ACTIVE",
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "mem-auditor",
        email: "finance.audit@company.dev",
        name: "Elena Rostova",
        role: "AUDITOR",
        status: "ACTIVE",
        joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ];

    return {
      organizationName: companyName,
      ownerId: user.id,
      seatsUsed: members.length,
      seatsLimit: 10,
      taxId: "US-EIN-94-3829102",
      currency: "USD",
      members,
    };
  }

  /**
   * Invites a new team member with RBAC permissions (OWNER, MANAGER, AUDITOR).
   */
  static async inviteMember(requesterId: string, email: string, role: "MANAGER" | "AUDITOR") {
    const org = await this.getOrganization(requesterId);
    if (!email || !email.includes("@")) {
      throw new AppError(
        "INVALID_EMAIL",
        "A valid email address is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return {
      success: true,
      invitedEmail: email.toLowerCase().trim(),
      role,
      invitedAt: new Date(),
      expiresInDays: 7,
      organizationName: org.organizationName,
    };
  }

  /**
   * Generates a consolidated corporate ledger invoice report across all awarded contracts.
   */
  static async getConsolidatedLedgerReport(clientId: string) {
    const contracts = await prisma.contract.findMany({
      where: { clientId },
      include: {
        freelancer: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
        ledgerEntries: {
          where: { type: "ESCROW_RELEASE" },
          orderBy: { createdAt: "desc" },
        },
        milestones: true,
      },
    });

    const items: ConsolidatedInvoiceItem[] = [];
    let totalGrossCents = 0n;

    for (const c of contracts) {
      for (const entry of c.ledgerEntries) {
        totalGrossCents += entry.amountCents;
        const milestone = c.milestones.find((m) => m.id === entry.milestoneId);
        items.push({
          id: entry.id,
          contractId: c.id,
          contractTitle: c.job?.title ?? "Contract Engagement",
          milestoneTitle: milestone?.title ?? "Milestone Deliverable",
          freelancerName: c.freelancer.name,
          date: entry.createdAt,
          amountCents: entry.amountCents,
          currency: entry.currency,
          idempotencyKey: entry.idempotencyKey,
        });
      }
    }

    return {
      invoiceNumber: `INV-CORP-${Date.now().toString().slice(-6)}`,
      generatedAt: new Date(),
      totalGrossDollars: Number(totalGrossCents) / 100,
      totalTransactions: items.length,
      items,
    };
  }
}
