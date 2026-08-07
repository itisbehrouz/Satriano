import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NotFound from "@/app/not-found";
import ErrorBoundary from "@/app/error";
import Forbidden from "@/app/forbidden";
import AdminErrorBoundary from "@/app/admin/error";
import PortalErrorBoundary from "@/app/portal/error";

describe("Satriano Atelier Error Components Suite", () => {
  it("renders NotFound 404 page with navigation links", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(screen.getByText("Return to Homepage")).toBeInTheDocument();
    expect(screen.getByText("Browse Catalog")).toBeInTheDocument();
  });

  it("renders ErrorBoundary global 500 page and handles reset trigger", () => {
    const resetMock = vi.fn();
    const testError = new Error("Test runtime error");
    (testError as any).digest = "DIGEST-12345";

    render(<ErrorBoundary error={testError} reset={resetMock} />);
    expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
    expect(screen.getByText("DIGEST-12345")).toBeInTheDocument();

    const tryAgainBtn = screen.getByText("Try Again");
    fireEvent.click(tryAgainBtn);
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it("renders Forbidden 403 Access Denied page", () => {
    render(<Forbidden />);
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.getByText("Log In to Console")).toBeInTheDocument();
  });

  it("renders AdminErrorBoundary and triggers reset callback", () => {
    const resetMock = vi.fn();
    const testError = new Error("Admin metrics error");

    render(<AdminErrorBoundary error={testError} reset={resetMock} />);
    expect(screen.getByText("Portal Console Exception")).toBeInTheDocument();

    const retryBtn = screen.getByText("Retry Operation");
    fireEvent.click(retryBtn);
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it("renders PortalErrorBoundary and triggers reload callback", () => {
    const resetMock = vi.fn();
    const testError = new Error("Portal order loading error");

    render(<PortalErrorBoundary error={testError} reset={resetMock} />);
    expect(screen.getByText("Portal Session Error")).toBeInTheDocument();

    const reloadBtn = screen.getByText("Reload Portal");
    fireEvent.click(reloadBtn);
    expect(resetMock).toHaveBeenCalledTimes(1);
  });
});
