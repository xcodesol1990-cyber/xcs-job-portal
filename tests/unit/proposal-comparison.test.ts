import { describe, it, expect } from "vitest";

describe("Proposal Comparison Matrix & Benchmarking", () => {
  const candidates = [
    {
      id: "prop_1",
      bidCents: 150000,
      estimatedDays: 14,
      freelancer: { name: "Alice Johnson" },
    },
    {
      id: "prop_2",
      bidCents: 90000,
      estimatedDays: 21,
      freelancer: { name: "Bob Smith" },
    },
    {
      id: "prop_3",
      bidCents: 120000,
      estimatedDays: 7,
      freelancer: { name: "Carol Davis" },
    },
  ];

  it("identifies the lowest bid value accurately", () => {
    const lowestBid = Math.min(...candidates.map((c) => c.bidCents));
    expect(lowestBid).toBe(90000); // Bob Smith: $900
    const bestValueCandidate = candidates.find((c) => c.bidCents === lowestBid);
    expect(bestValueCandidate?.freelancer.name).toBe("Bob Smith");
  });

  it("identifies the fastest turnaround delivery accurately", () => {
    const fastestDays = Math.min(...candidates.map((c) => c.estimatedDays));
    expect(fastestDays).toBe(7); // Carol Davis: 7 days
    const fastestCandidate = candidates.find((c) => c.estimatedDays === fastestDays);
    expect(fastestCandidate?.freelancer.name).toBe("Carol Davis");
  });

  it("caps selected candidate benchmark count to 3", () => {
    let selectedIds = ["prop_1", "prop_2"];
    const toggleSelect = (id: string) => {
      if (selectedIds.includes(id)) {
        selectedIds = selectedIds.filter((i) => i !== id);
      } else if (selectedIds.length >= 3) {
        selectedIds = [...selectedIds.slice(1), id];
      } else {
        selectedIds = [...selectedIds, id];
      }
    };

    toggleSelect("prop_3");
    expect(selectedIds).toHaveLength(3);
    expect(selectedIds).toEqual(["prop_1", "prop_2", "prop_3"]);

    // Adding 4th drops first
    toggleSelect("prop_4");
    expect(selectedIds).toHaveLength(3);
    expect(selectedIds).toEqual(["prop_2", "prop_3", "prop_4"]);
  });
});
