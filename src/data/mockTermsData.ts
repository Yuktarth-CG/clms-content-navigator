// Mock Terms and Conditions Data for Demo

export const CURRENT_TC_VERSION = "v2.0.0";
export const CURRENT_RELEASE_TAG = "v2.0.0";

export const mockPrivacyPolicy = `
# Privacy Policy

Last Updated: January 1, 2026

## 1. Introduction

Welcome to the Content and Learning Management System (CLMS). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

## 2. Information We Collect

### 2.1 Personal Information
We collect information that you provide directly to us, including:
- Name and contact information
- Educational institution details
- Login credentials
- Usage data and preferences

### 2.2 Automatically Collected Information
When you access CLMS, we automatically collect:
- Device information and browser type
- IP address and location data
- Access times and pages viewed
- Interaction patterns with content

## 3. How We Use Your Information

We use the collected information to:
- Provide and maintain the CLMS platform
- Personalize your learning experience
- Analyze usage patterns to improve our services
- Communicate important updates and changes
- Ensure platform security and prevent fraud

## 4. Data Retention

We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.

## 5. Data Security

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 6. Your Rights

You have the right to:
- Access your personal information
- Request correction of inaccurate data
- Request deletion of your data
- Object to processing of your data
- Data portability

## 7. Contact Us

For questions about this Privacy Policy, please contact your system administrator.
`;

export const mockTermsConditions = `
# Terms & Conditions

Last Updated: January 1, 2026

## 1. Acceptance of Terms

By accessing and using the Content and Learning Management System (CLMS), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the platform.

## 2. User Accounts

### 2.1 Account Creation
- You must provide accurate and complete information during registration
- You are responsible for maintaining the confidentiality of your login credentials
- You must notify us immediately of any unauthorized use of your account

### 2.2 Account Responsibilities
- You are solely responsible for all activities under your account
- Sharing login credentials is strictly prohibited
- Each user must have their own unique account

## 3. Acceptable Use

You agree NOT to:
- Use the platform for any unlawful purpose
- Attempt to gain unauthorized access to any part of the system
- Interfere with or disrupt the platform's operation
- Upload malicious content or viruses
- Copy, modify, or distribute content without authorization

## 4. Intellectual Property

### 4.1 Platform Content
All content, features, and functionality of CLMS are owned by the platform operators and are protected by intellectual property laws.

### 4.2 User Content
You retain ownership of content you create, but grant us a license to use, display, and distribute it within the platform.

## 5. Content Guidelines

All educational content must:
- Be accurate and appropriate for the intended audience
- Not infringe on third-party intellectual property rights
- Comply with applicable educational standards
- Be free from offensive or discriminatory material

## 6. Service Availability

We strive to maintain platform availability but do not guarantee uninterrupted access. Scheduled maintenance will be communicated in advance when possible.

## 7. Limitation of Liability

CLMS is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.

## 8. Modifications to Terms

We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.

## 9. Governing Law

These terms are governed by the applicable laws of your jurisdiction.

## 10. Contact

For questions about these Terms & Conditions, please contact your system administrator.
`;

export interface ConsentLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  policy_version: string;
  release_tag: string;
  accepted_at: string;
}

export interface VersionHistoryEntry {
  version_id: string;
  content_diff: string;
  updated_by: string;
  updated_by_name: string;
  created_at: string;
  is_current: boolean;
}

export interface ReleaseEntry {
  version: string;
  release_type: 'Minor' | 'Major';
  release_date: string;
  notes: string;
  tc_updated: boolean;
}

export const mockConsentLogs: ConsentLogEntry[] = [
  { id: "1", user_id: "usr-001", user_name: "Yuktarth Nagar", policy_version: "v2.0.0", release_tag: "v2.0.0", accepted_at: "2026-01-07 09:15:23.456" },
  { id: "2", user_id: "usr-002", user_name: "Priya Sharma", policy_version: "v2.0.0", release_tag: "v2.0.0", accepted_at: "2026-01-07 08:45:12.789" },
  { id: "3", user_id: "usr-003", user_name: "Rahul Verma", policy_version: "v2.0.0", release_tag: "v2.0.0", accepted_at: "2026-01-06 14:32:45.123" },
  { id: "4", user_id: "usr-004", user_name: "Anita Desai", policy_version: "v1.5.0", release_tag: "v1.5.0", accepted_at: "2025-10-20 11:22:33.789" },
  { id: "5", user_id: "usr-005", user_name: "Vikram Singh", policy_version: "v2.0.0", release_tag: "v2.0.0", accepted_at: "2026-01-05 16:45:00.234" },
  { id: "6", user_id: "usr-006", user_name: "Meera Patel", policy_version: "v1.5.0", release_tag: "v1.5.0", accepted_at: "2025-10-18 09:10:55.567" },
  { id: "7", user_id: "usr-007", user_name: "Arjun Reddy", policy_version: "v2.0.0", release_tag: "v2.0.0", accepted_at: "2026-01-07 07:30:15.890" },
  { id: "8", user_id: "usr-008", user_name: "Kavitha Iyer", policy_version: "v1.0.0", release_tag: "v1.0.0", accepted_at: "2025-08-01 10:00:00.000" },
];

export const mockVersionHistory: VersionHistoryEntry[] = [
  { 
    version_id: "v2.0.0", 
    content_diff: "Added data retention policy section, updated cookie usage disclosure, enhanced user rights section", 
    updated_by: "admin-001", 
    updated_by_name: "System Administrator",
    created_at: "2026-01-01 00:00:00",
    is_current: true
  },
  { 
    version_id: "v1.5.0", 
    content_diff: "Minor clarifications on user rights, added contact information section", 
    updated_by: "admin-001", 
    updated_by_name: "System Administrator",
    created_at: "2025-10-15 00:00:00",
    is_current: false
  },
  { 
    version_id: "v1.0.0", 
    content_diff: "Initial Terms & Conditions and Privacy Policy", 
    updated_by: "admin-001", 
    updated_by_name: "System Administrator",
    created_at: "2025-08-01 00:00:00",
    is_current: false
  },
];

export const mockReleaseHistory: ReleaseEntry[] = [
  { 
    version: "v2.0.0", 
    release_type: "Major", 
    release_date: "2026-01-01", 
    notes: "Major platform overhaul with new assessment features. Updated Terms & Conditions.",
    tc_updated: true
  },
  { 
    version: "v1.5.1", 
    release_type: "Minor", 
    release_date: "2025-11-10", 
    notes: "Bug fixes for PDF export and UI improvements.",
    tc_updated: false
  },
  { 
    version: "v1.5.0", 
    release_type: "Major", 
    release_date: "2025-10-15", 
    notes: "Added OCR capabilities and bulk import features. T&C updated.",
    tc_updated: true
  },
  { 
    version: "v1.0.0", 
    release_type: "Major", 
    release_date: "2025-08-01", 
    notes: "Initial release of CLMS platform.",
    tc_updated: true
  },
];
