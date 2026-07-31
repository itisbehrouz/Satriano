"use client";

import { useState, Fragment } from "react";

export interface B2bApplicationItem {
  id: string;
  companyName: string;
  website?: string | null;
  industry?: string | null;
  annualVolume?: string | null;
  fullName: string;
  jobTitle?: string | null;
  corpEmail: string;
  phone?: string | null;
  needs?: any;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  emailVerifiedAt?: string | Date | null;
  createdAt: string | Date;
  reviewedAt?: string | Date | null;
  reviewedBy?: string | null;
}

interface AdminApplicationsTableProps {
  applications: B2bApplicationItem[];
  onStatusChange?: () => void;
}

export function ApplicationStatusBadge({ status }: { status: B2bApplicationItem["status"] }) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#E1F5EE] text-[#0F6E56] text-xs font-semibold px-2.5 py-1 rounded border border-[#A6E5CE]">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>APPROVED</span>
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#FCEBEB] text-[#A32D2D] text-xs font-semibold px-2.5 py-1 rounded border border-[#F8B4B4]">
          <span className="material-symbols-outlined text-sm">cancel</span>
          <span>REJECTED</span>
        </span>
      );
    case "UNDER_REVIEW":
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#E6F1FB] text-[#185FA5] text-xs font-semibold px-2.5 py-1 rounded border border-[#B3D6F6]">
          <span className="material-symbols-outlined text-sm">hourglass_top</span>
          <span>UNDER REVIEW</span>
        </span>
      );
    case "SUBMITTED":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#FAEEDA] text-[#854F0B] text-xs font-semibold px-2.5 py-1 rounded border border-[#F5D8A0]">
          <span className="material-symbols-outlined text-sm">new_releases</span>
          <span>SUBMITTED</span>
        </span>
      );
  }
}

export function AdminApplicationsTable({
  applications,
  onStatusChange,
}: AdminApplicationsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStatusUpdate(id: string, newStatus: B2bApplicationItem["status"]) {
    setUpdatingId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reviewedBy: "admin" }),
      });

      if (res.ok) {
        if (onStatusChange) onStatusChange();
      } else {
        const json = await res.json();
        setActionError(json.error || "Failed to update application status.");
      }
    } catch {
      setActionError("Network error while updating status.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (applications.length === 0) {
    return (
      <div className="p-12 text-center border border-[#D1D5DB] bg-white rounded-lg text-[#5B6B85]">
        No B2B partner applications found for the selected criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {actionError && (
        <div className="p-4 bg-[#FCEBEB] border border-[#F8B4B4] rounded text-xs text-[#A32D2D] font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{actionError}</span>
        </div>
      )}

      <div className="overflow-x-auto border border-[#D1D5DB] rounded-lg bg-white shadow-sm">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs uppercase font-semibold text-[#5B6B85]">
              <th className="p-4 w-[15%]">App Ref / Date</th>
              <th className="p-4 w-[25%]">Company &amp; Industry</th>
              <th className="p-4 w-[20%]">Contact Officer</th>
              <th className="p-4 w-[15%]">Email Verification</th>
              <th className="p-4 w-[12%]">Status</th>
              <th className="p-4 w-[13%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#1A2233]">
            {applications.map((app) => {
              const isExpanded = expandedId === app.id;
              const isUpdating = updatingId === app.id;
              const isEmailVerified = app.emailVerifiedAt !== null && app.emailVerifiedAt !== undefined;
              const dateStr = new Date(app.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <Fragment key={app.id}>
                  <tr className="hover:bg-[#F5F7FA]/60 transition-colors">
                    <td className="p-4 font-mono text-xs align-top">
                      <div className="font-bold text-[#1A2233]">
                        #{app.id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-[#5B6B85] text-[11px] mt-0.5">{dateStr}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-semibold text-[#1A2233]">{app.companyName}</div>
                      {app.website ? (
                        <a
                          href={app.website.startsWith("http") ? app.website : `https://${app.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2E5AAC] hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>{app.website}</span>
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        </a>
                      ) : (
                        <div className="text-xs text-[#5B6B85] italic">No website provided</div>
                      )}
                      {app.industry && (
                        <div className="text-[11px] text-[#5B6B85] mt-0.5">
                          Industry: {app.industry}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-semibold text-[#1A2233]">{app.fullName}</div>
                      <div className="text-xs text-[#2E5AAC]">{app.corpEmail}</div>
                      {app.jobTitle && (
                        <div className="text-[11px] text-[#5B6B85]">{app.jobTitle}</div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 bg-[#E1F5EE] text-[#0F6E56] text-xs font-semibold px-2.5 py-1 rounded border border-[#A6E5CE]">
                          <span className="material-symbols-outlined text-sm">mark_email_read</span>
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#FAEEDA] text-[#854F0B] text-xs font-semibold px-2.5 py-1 rounded border border-[#F5D8A0]" title="Applicant must verify corporate email address before admin review">
                          <span className="material-symbols-outlined text-sm">pending_actions</span>
                          <span>Unverified</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="p-4 text-right align-top">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {/* Expand/Collapse Full Specs Button */}
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : app.id)}
                          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#2E5AAC] bg-white border border-[#D1D5DB] hover:bg-[#E6F1FB] hover:border-[#2E5AAC] rounded transition-colors inline-flex items-center gap-1.5"
                          aria-expanded={isExpanded}
                        >
                          <span className="material-symbols-outlined text-base">
                            {isExpanded ? "unfold_less" : "unfold_more"}
                          </span>
                          <span>{isExpanded ? "Hide Details" : "View Full Specs"}</span>
                        </button>

                        {/* Approve Button */}
                        {app.status !== "APPROVED" && (
                          <button
                            type="button"
                            disabled={isUpdating || !isEmailVerified}
                            onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                            title={!isEmailVerified ? "Cannot approve: email not verified by applicant" : "Approve application"}
                            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-white bg-[#0F6E56] hover:bg-[#0B5341] disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Reject Button */}
                        {app.status !== "REJECTED" && (
                          <button
                            type="button"
                            disabled={isUpdating || !isEmailVerified}
                            onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                            title={!isEmailVerified ? "Cannot reject: email not verified by applicant" : "Reject application"}
                            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#A32D2D] bg-white border border-[#F8B4B4] hover:bg-[#FCEBEB] disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors inline-flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base">cancel</span>
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Full Application Spec Row */}
                  {isExpanded && (
                    <tr className="bg-[#F5F7FA]">
                      <td colSpan={6} className="p-6 border-b border-[#D1D5DB]">
                        <div className="bg-white border border-[#D1D5DB] rounded-lg p-5 space-y-4 shadow-sm">
                          <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
                            <h4 className="text-sm font-bold text-[#1A2233] uppercase tracking-wider flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-[#2E5AAC]">
                                badge
                              </span>
                              <span>Complete B2B Application Specification — {app.companyName}</span>
                            </h4>
                            <span className="text-xs text-[#5B6B85]">
                              Submitted on {new Date(app.createdAt).toLocaleString("en-US")}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                            {/* Column 1: Company Info */}
                            <div className="space-y-2 border-r border-[#E5E7EB] pr-4">
                              <h5 className="font-bold text-[#2E5AAC] uppercase tracking-wider text-[11px]">
                                1. Company Identification
                              </h5>
                              <div>
                                <span className="text-[#5B6B85] block">Company Name:</span>
                                <span className="font-semibold text-[#1A2233]">{app.companyName}</span>
                              </div>
                              <div>
                                <span className="text-[#5B6B85] block">Website:</span>
                                <span className="font-semibold text-[#1A2233]">{app.website || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-[#5B6B85] block">Industry Sector:</span>
                                <span className="font-semibold text-[#1A2233]">{app.industry || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-[#5B6B85] block">Target Annual Volume:</span>
                                <span className="font-semibold text-[#2E5AAC]">{app.annualVolume || "N/A"}</span>
                              </div>
                            </div>

                            {/* Column 2: Contact Info */}
                            <div className="space-y-2 border-r border-[#E5E7EB] pr-4">
                              <h5 className="font-bold text-[#2E5AAC] uppercase tracking-wider text-[11px]">
                                2. Authorized Representative
                              </h5>
                              <div>
                                <span className="text-[#5B6B85] block">Full Name:</span>
                                <span className="font-semibold text-[#1A2233]">{app.fullName}</span>
                              </div>
                              <div>
                                <span className="text-[#5B6B85] block">Job Title:</span>
                                <span className="font-semibold text-[#1A2233]">{app.jobTitle || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-[#5B6B85] block">Corporate Email:</span>
                                <span className="font-semibold text-[#2E5AAC]">{app.corpEmail}</span>
                              </div>
                              <div>
                                <span className="text-[#5B6B85] block">Direct Phone:</span>
                                <span className="font-semibold text-[#1A2233]">{app.phone || "N/A"}</span>
                              </div>
                            </div>

                            {/* Column 3: Custom Requirements & Audit */}
                            <div className="space-y-2">
                              <h5 className="font-bold text-[#2E5AAC] uppercase tracking-wider text-[11px]">
                                3. Manufacturing Needs &amp; Audit Log
                              </h5>
                              <div>
                                <span className="text-[#5B6B85] block">Custom Needs Payload:</span>
                                <pre className="bg-[#F5F7FA] p-2 rounded border border-[#E5E7EB] text-[11px] font-mono text-[#1A2233] overflow-x-auto max-h-24 mt-1">
                                  {app.needs ? JSON.stringify(app.needs, null, 2) : "No custom specs provided."}
                                </pre>
                              </div>
                              {app.reviewedAt && (
                                <div className="pt-2 border-t border-[#E5E7EB] mt-2">
                                  <span className="text-[#5B6B85] block">Review Officer:</span>
                                  <span className="font-semibold text-[#0F6E56]">
                                    {app.reviewedBy || "admin"} on {new Date(app.reviewedAt).toLocaleString("en-US")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Row inside Drawer */}
                          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                            {app.status !== "UNDER_REVIEW" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(app.id, "UNDER_REVIEW")}
                                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#185FA5] bg-white border border-[#B3D6F6] hover:bg-[#E6F1FB] rounded transition-colors inline-flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-base">hourglass_top</span>
                                <span>Mark Under Review</span>
                              </button>
                            )}
                            {app.status !== "APPROVED" && (
                              <button
                                type="button"
                                disabled={isUpdating || !isEmailVerified}
                                onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-[#0F6E56] hover:bg-[#0B5341] disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                <span className="material-symbols-outlined text-base">check_circle</span>
                                <span>Approve Application</span>
                              </button>
                            )}
                            {app.status !== "REJECTED" && (
                              <button
                                type="button"
                                disabled={isUpdating || !isEmailVerified}
                                onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#A32D2D] bg-white border border-[#F8B4B4] hover:bg-[#FCEBEB] disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors inline-flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-base">cancel</span>
                                <span>Reject Application</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
