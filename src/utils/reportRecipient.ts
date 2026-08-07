// Extracted out of ReportsPage.tsx so App.tsx can import this one small
// function without dragging the entire (lazy-loaded) ReportsPage module and
// its dependencies into the main bundle.
export const REPORT_WORKFLOW = {
  tot: { sendTo: "district_coordinator", label: "District Coordinator" },
  field_officer: { sendTo: "district_coordinator", label: "District Coordinator" },
  viewer: { sendTo: "district_coordinator", label: "District Coordinator" },
  data_entry: { sendTo: "admin", label: "System Admin" },
  district_coordinator: { sendTo: "program_manager", label: "Regional Manager" },
  program_manager: { sendTo: "admin", label: "National Admin" },
  admin: { sendTo: null as any, label: "Final Recipient" },
};

export const getReportRecipient = (role: string) => {
  return (REPORT_WORKFLOW as any)[role] || { sendTo: "admin", label: "National Admin" };
};
