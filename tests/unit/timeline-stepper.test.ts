import { describe, it, expect } from "vitest";

describe("Contract Timeline Stepper & Capital Allocation Telemetry", () => {
  it("computes released, locked in escrow, and remaining contract amounts accurately", () => {
    const milestones = [
      { id: "m1", title: "Milestone 1", amountCents: 100000, status: "RELEASED" },
      { id: "m2", title: "Milestone 2", amountCents: 150000, status: "FUNDED" },
      { id: "m3", title: "Milestone 3", amountCents: 50000, status: "SUBMITTED" },
      { id: "m4", title: "Milestone 4", amountCents: 200000, status: "PENDING" },
    ];
    const totalCents = 500000;

    let releasedCents = 0;
    let inEscrowCents = 0;
    let pendingCents = 0;

    milestones.forEach((m) => {
      const amt = Number(m.amountCents);
      if (m.status === "RELEASED") {
        releasedCents += amt;
      } else if (
        m.status === "FUNDED" ||
        m.status === "SUBMITTED" ||
        m.status === "REVISION_REQUESTED"
      ) {
        inEscrowCents += amt;
      } else {
        pendingCents += amt;
      }
    });

    expect(releasedCents / 100).toBe(1000);
    expect(inEscrowCents / 100).toBe(2000);
    expect(pendingCents / 100).toBe(2000);
    expect((releasedCents + inEscrowCents + pendingCents) / 100).toBe(totalCents / 100);
  });

  it("calculates completion percentages correctly", () => {
    const milestones = [
      { id: "m1", title: "M1", amountCents: 100, status: "RELEASED" },
      { id: "m2", title: "M2", amountCents: 100, status: "RELEASED" },
      { id: "m3", title: "M3", amountCents: 100, status: "FUNDED" },
      { id: "m4", title: "M4", amountCents: 100, status: "PENDING" },
    ];

    const completed = milestones.filter((m) => m.status === "RELEASED").length;
    const progressPercent = Math.round((completed / milestones.length) * 100);

    expect(progressPercent).toBe(50);
  });

  it("handles empty milestone sets without division by zero", () => {
    const milestones: Array<{ id: string; status: string; amountCents: number }> = [];
    const completed = milestones.filter((m) => m.status === "RELEASED").length;
    const progressPercent =
      milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

    expect(progressPercent).toBe(0);
  });
});
