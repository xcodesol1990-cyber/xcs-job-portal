# Security Policy

WorkNest prioritizes security and confidentiality for every marketplace participant, transaction, and financial movement.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Architecture & Best Practices

1. **Authentication & Password Protection:**
   - Password hashes are computed using `@node-rs/argon2` with modern cryptographic salt and high memory-cost parameters.
   - Brute-force lockout protections and sliding-window rate limiters mitigate credential-stuffing attacks.
   - Session tokens and reset tokens are hashed before storage to prevent plaintext leaks from database backups.

2. **Encryption at Rest:**
   - Sensitive columns (such as TOTP 2FA recovery secrets and payment provider details) are encrypted using AES-256-GCM authenticated encryption with unique initialization vectors (IVs).

3. **Financial Integrity & Double-Entry Ledger:**
   - All balance mutations, escrow releases, and refunds enforce idempotent write locks.
   - Money values are exclusively handled as integer cents (`BigInt`) to prevent float-rounding discrepancies.
   - Webhooks are verified using raw cryptographic signatures prior to payload parsing.

4. **Input Sanitization & Output Encoding:**
   - Rich text and user-submitted job descriptions are sanitized through DOMPurify and strict HTML element whitelisting.

## Reporting a Vulnerability

If you discover a security vulnerability within WorkNest, please do NOT file a public issue. Instead, report it directly to the security team:

- **Email:** `security@worknest.dev`
- **Response Time:** We aim to acknowledge receipt of vulnerabilities within 24 hours and provide patches within 72 hours for high-severity issues.

