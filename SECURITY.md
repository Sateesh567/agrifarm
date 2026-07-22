# AgriFarm Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

The AgriFarm engineering team takes project security extremely seriously. If you discover a security vulnerability, please notify us immediately.

### How to Report:
- **Email**: Send security disclosures to `security@agrifarm.com` or create a confidential report.
- **Response SLA**: We acknowledge all reports within 24 hours and aim to release patches within 7 business days for high or critical severity vulnerabilities.

### Security Best Practices Implemented:
1. **Zero Secret Policy**: No API keys, database passwords, or JWT secrets are hardcoded or tracked in Git.
2. **Authentication & JWT**: Token hashing, blacklist revoking, and short-lived access tokens.
3. **Prepared Statements**: SQL parameters sanitization to protect against SQL Injection.
4. **Automated Scanning**: CodeQL, Trivy secret scanning, and Dependabot dependency audits.
