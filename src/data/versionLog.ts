export interface VersionEntry {
  version: string;
  date: string;
  changes: string[];
}

export const versionLog: VersionEntry[] = [
  {
    version: "1.2.0",
    date: "2024-08-04",
    changes: [
      "Added section-based question paper creation",
      "Replaced blueprint selection with custom section management",
      "Enhanced PDF preview with real-time updates",
      "Improved question type configuration per section"
    ]
  },
  {
    version: "1.1.0",
    date: "2024-08-03",
    changes: [
      "Added OCR test paper creation",
      "Implemented visual worksheet editor",
      "Enhanced content tagging system",
      "Added bulk import/export functionality"
    ]
  },
  {
    version: "1.0.0",
    date: "2024-08-01",
    changes: [
      "Initial release of the Content Management System",
      "Core question paper creation functionality",
      "User management and permissions",
      "Basic assessment tools"
    ]
  }
];

export const getCurrentVersion = () => versionLog[0]?.version || "1.0.0";