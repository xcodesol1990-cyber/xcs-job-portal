import { ContractStatus, MilestoneStatus } from "@prisma/client";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";

const VALID_CONTRACT_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  PENDING_FUNDING: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED", "CANCELLED", "DISPUTED"],
  COMPLETED: [],
  CANCELLED: [],
  DISPUTED: ["ACTIVE", "COMPLETED", "CANCELLED"],
};

const VALID_MILESTONE_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  PENDING: ["FUNDED", "REFUNDED"],
  FUNDED: ["SUBMITTED", "REFUNDED", "DISPUTED"],
  SUBMITTED: ["APPROVED", "REVISION_REQUESTED", "DISPUTED"],
  REVISION_REQUESTED: ["SUBMITTED", "DISPUTED"],
  APPROVED: ["RELEASED"],
  RELEASED: [],
  REFUNDED: [],
  DISPUTED: ["APPROVED", "REFUNDED", "RELEASED"],
};

export function assertContractTransition(current: ContractStatus, target: ContractStatus): void {
  const allowed = VALID_CONTRACT_TRANSITIONS[current] ?? [];
  if (!allowed.includes(target)) {
    throw new AppError(
      "INVALID_STATE_TRANSITION",
      `Cannot transition contract from ${current} to ${target}.`,
      HTTP_STATUS.CONFLICT,
    );
  }
}

export function assertMilestoneTransition(current: MilestoneStatus, target: MilestoneStatus): void {
  const allowed = VALID_MILESTONE_TRANSITIONS[current] ?? [];
  if (!allowed.includes(target)) {
    throw new AppError(
      "INVALID_STATE_TRANSITION",
      `Cannot transition milestone from ${current} to ${target}.`,
      HTTP_STATUS.CONFLICT,
    );
  }
}

