import { describe, expect, it } from "vitest";
import {
  assertContractTransition,
  assertMilestoneTransition,
} from "@/server/policies/state-machines";

describe("state machine policies", () => {
  describe("contract state machine", () => {
    it("allows valid transitions from PENDING_FUNDING to ACTIVE", () => {
      expect(() => assertContractTransition("PENDING_FUNDING", "ACTIVE")).not.toThrow();
    });

    it("allows valid transitions from ACTIVE to COMPLETED", () => {
      expect(() => assertContractTransition("ACTIVE", "COMPLETED")).not.toThrow();
    });

    it("forbids invalid transitions", () => {
      expect(() => assertContractTransition("COMPLETED", "ACTIVE")).toThrow(
        /Cannot transition contract from COMPLETED to ACTIVE/,
      );
      expect(() => assertContractTransition("CANCELLED", "ACTIVE")).toThrow();
    });
  });

  describe("milestone state machine", () => {
    it("allows standard lifecycle: PENDING -> FUNDED -> SUBMITTED -> APPROVED -> RELEASED", () => {
      expect(() => assertMilestoneTransition("PENDING", "FUNDED")).not.toThrow();
      expect(() => assertMilestoneTransition("FUNDED", "SUBMITTED")).not.toThrow();
      expect(() => assertMilestoneTransition("SUBMITTED", "APPROVED")).not.toThrow();
      expect(() => assertMilestoneTransition("APPROVED", "RELEASED")).not.toThrow();
    });

    it("allows revision cycle: SUBMITTED -> REVISION_REQUESTED -> SUBMITTED", () => {
      expect(() => assertMilestoneTransition("SUBMITTED", "REVISION_REQUESTED")).not.toThrow();
      expect(() => assertMilestoneTransition("REVISION_REQUESTED", "SUBMITTED")).not.toThrow();
    });

    it("rejects invalid milestone transitions", () => {
      expect(() => assertMilestoneTransition("PENDING", "RELEASED")).toThrow(
        /Cannot transition milestone from PENDING to RELEASED/,
      );
      expect(() => assertMilestoneTransition("RELEASED", "PENDING")).toThrow();
    });
  });
});
