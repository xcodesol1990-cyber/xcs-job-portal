const BPS_DENOMINATOR = 10_000n;

function assertNonNegative(amountCents: bigint, label: string): void {
  if (amountCents < 0n) {
    throw new Error(`${label} cannot be negative`);
  }
}

export function roundHalfUpDivide(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) {
    throw new Error("denominator must be positive");
  }
  if (numerator >= 0n) {
    return (numerator + denominator / 2n) / denominator;
  }
  return -((-numerator + denominator / 2n) / denominator);
}

export function splitFee(
  amountCents: bigint,
  feeBps: number,
): { netCents: bigint; feeCents: bigint } {
  assertNonNegative(amountCents, "amountCents");
  if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 5000) {
    throw new Error("feeBps must be an integer between 0 and 5000");
  }

  const feeCents = roundHalfUpDivide(amountCents * BigInt(feeBps), BPS_DENOMINATOR);
  const netCents = amountCents - feeCents;
  return { netCents, feeCents };
}

export function formatMinorUnits(amountCents: bigint, currency: string): string {
  const code = currency.toUpperCase();
  const sign = amountCents < 0n ? "-" : "";
  const abs = amountCents < 0n ? -amountCents : amountCents;
  const whole = abs / 100n;
  const fraction = (abs % 100n).toString().padStart(2, "0");
  return `${sign}${whole.toString()}.${fraction} ${code}`;
}
