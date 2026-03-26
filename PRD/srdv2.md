<system-reminder>
Your operational mode has changed from plan to build.
You are no longer in read-only mode.
You are permitted to make file changes, run shell commands, and utilize your arsenal of tools as needed.
</system-reminder>

# SRD v2 — Security Requirements Document (reference all content from srd/srd.md)

Context: This document updates the prior Security Requirements Document (SRD) to reflect an expanded threat model, updated controls, and a broader verification strategy aligned with the evolving architecture described in PRD v2 and related plans.

1) Recap of prior SRD (context)
- Defines security controls, risk management, and verification procedures for the AART security stack.
- Covers threat modeling across the 7-layer architecture, inputs/outputs between SAST, DAST, and Active Scanning, and the LangGraph/USG abstractions.
- Establishes governance, auditability, and incident-response expectations.

2) Updated security requirements
- Security lifecycle and governance
  - Enforce Secure by Design, Secure by Default, and continuous security testing.
  - Maintain an up-to-date SBOM and dependency hygiene in all components.
- Data protection
  - Encrypt data at rest and in transit using strong algorithms; rotate keys; limit data exposure.
- Access control and identity
  - Implement role-based access with least privilege; enforce MFA for privileged actions; audit RBAC changes.
- Secrets management
  - Secrets must never be checked into source; use a secrets vault; rotate regularly; access via scoped credentials.
- Container and runtime security
  - Image scanning for vulnerabilities; runtime protection; least-privilege containers; immutable infrastructure where possible.
- Logging, monitoring, and alerting
  - Centralized, tamper-evident logs; real-time alerts; anomaly detection; audit trails for critical actions.
- Network, segmentation, and airflow
  - Network segmentation between components; least-privilege network policies; defined ingress/egress controls.
- Threat detection and response
  - Integrate SAST, DAST, and Active Scanning signals into a unified detection graph; deterministic triage and escalation.
- Compliance mapping
  - Align with OWASP ASVS, NIST SP 800-53 families, and applicable regulatory requirements; document mappings.
- Supply chain security
  - Use reproducible builds, verifiable artifacts, and provenance tracing for all deliverables.

3) Verification and testing strategy
- Tests and evidence
  - Each requirement has verifiable tests, e.g., automated checks, manual audits, and test evidence.
- Thresholds and acceptance criteria
  - Define acceptable risk levels, false positives, and remediation SLAs.
- Evidence packaging
  - Produce artifact bundles (patch artifacts or remediation prompts) with reproducible steps and verification results.

4) Threat model and controls mapping
- Architecture-derived threat surfaces mapped to controls in the SRD.
- 7-layer stack vulnerabilities tracked by corresponding controls in the registry.

5) Plan for phases (harmonized with PRD)
- Phase 0: Immediate blockers (ingestion/)
- Phase 1: DAST agent integration and verification
- Phase 2: Active scanning tooling integration and gating
- Phase 3: Comprehensive rule engine integration and triage

6) Incident response and governance
- Roles, escalation paths, and runbooks for suspected incidents.
- Post-incident review, remediation tracking, and evidence retention.

7) Open questions
- Confirm integration touchpoints with PRD v2 components; ensure consistent terminology across documents.
- Determine preferred SRD versioning and cross-references.
- Decide on the artifact format for remediation outputs (patch prompts vs patches).

8) Next actions
- Create patch-ready SRD artifacts and align PRD cross-references.
- Schedule review for SRD v2 with security governance stakeholders.
