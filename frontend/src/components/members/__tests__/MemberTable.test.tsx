import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MemberTable from "@/components/members/MemberTable";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/hooks/useMembers", () => ({
  useMembers: jest.fn(),
}));

const { useMembers } = require("@/hooks/useMembers");

const mockMembers = [
  {
    id: "m-1",
    gymId: "g-1",
    firstName: "Kamal",
    lastName: "Perera",
    fullName: "Kamal Perera",
    email: "kamal@test.lk",
    phone: "0771234567",
    status: "ACTIVE" as const,
    joinDate: "2024-01-01",
    expiryDate: "2026-01-01",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "m-2",
    gymId: "g-1",
    firstName: "Nimesha",
    lastName: "Silva",
    fullName: "Nimesha Silva",
    email: "nimesha@test.lk",
    status: "EXPIRED" as const,
    joinDate: "2023-06-01",
    expiryDate: "2024-06-01",
    createdAt: "2023-06-01T00:00:00Z",
  },
];

const mockPage = {
  content: mockMembers,
  totalPages: 1,
  totalElements: 2,
  number: 0,
};

describe("MemberTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render member rows with correct data", () => {
    useMembers.mockReturnValue({ data: mockPage, isLoading: false, error: null, refetch: jest.fn() });

    render(<MemberTable />);

    expect(screen.getByText("Kamal Perera")).toBeInTheDocument();
    expect(screen.getByText("Nimesha Silva")).toBeInTheDocument();
    expect(screen.getByText("kamal@test.lk")).toBeInTheDocument();
  });

  it("should show loading skeleton rows when isLoading is true", () => {
    useMembers.mockReturnValue({ data: null, isLoading: true, error: null, refetch: jest.fn() });

    const { container } = render(<MemberTable />);

    const skeletonRows = container.querySelectorAll(".animate-pulse");
    expect(skeletonRows.length).toBeGreaterThan(0);
  });

  it("should show error message when error occurs", () => {
    useMembers.mockReturnValue({ data: null, isLoading: false, error: "Failed to load members", refetch: jest.fn() });

    render(<MemberTable />);

    expect(screen.getByText(/Failed to load members/i)).toBeInTheDocument();
  });

  it("should show empty state when no members returned", () => {
    useMembers.mockReturnValue({
      data: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<MemberTable />);

    expect(screen.getByText(/no members/i)).toBeInTheDocument();
  });

  it("should display ACTIVE status badge for active members", () => {
    useMembers.mockReturnValue({ data: mockPage, isLoading: false, error: null, refetch: jest.fn() });

    render(<MemberTable />);

    const activeBadges = screen.getAllByText("Active");
    expect(activeBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("should display EXPIRED badge for expired members", () => {
    useMembers.mockReturnValue({ data: mockPage, isLoading: false, error: null, refetch: jest.fn() });

    render(<MemberTable />);

    const expiredBadges = screen.getAllByText(/Expired/i);
    expect(expiredBadges.length).toBeGreaterThanOrEqual(1);
  });
});
