import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Auth from "@/pages/Auth";

// ---------------------------------------------------------------------------
// Mock Supabase
// The Auth component imports the Supabase client and calls auth methods on
// submit. We mock the entire module so the component can render in jsdom
// without real network calls or missing environment variables.
// ---------------------------------------------------------------------------
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

// ---------------------------------------------------------------------------
// Helper — renders Auth inside a MemoryRouter.
// Auth uses useNavigate and useSearchParams which require a Router context.
// MemoryRouter lets us control the initial URL without a real browser.
// ---------------------------------------------------------------------------
function renderAuth(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/auth${search}`]}>
      <Auth />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe("Auth page — rendering", () => {
  it("renders without crashing", () => {
    expect(() => renderAuth()).not.toThrow();
  });

  it("displays the Effortless brand name", () => {
    renderAuth();
    expect(screen.getByText("Effortless")).toBeInTheDocument();
  });

  it("shows the 'Welcome Back' heading in sign-in mode (default)", () => {
    renderAuth();
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  });

  it("shows the 'Create Account' heading when ?mode=signup is in the URL", () => {
    renderAuth("?mode=signup");
    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Form fields
// ---------------------------------------------------------------------------
describe("Auth page — form fields", () => {
  it("renders an email input field", () => {
    renderAuth();
    expect(screen.getByPlaceholderText("name@email.com")).toBeInTheDocument();
  });

  it("renders a password input field in sign-in mode", () => {
    renderAuth();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("does NOT render the Name field in sign-in mode", () => {
    renderAuth();
    expect(screen.queryByPlaceholderText("Full Name")).not.toBeInTheDocument();
  });

  it("renders the Name field in sign-up mode", () => {
    renderAuth("?mode=signup");
    expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Sign-in button
// ---------------------------------------------------------------------------
describe("Auth page — sign-in button", () => {
  it("renders a 'Sign In' submit button", () => {
    renderAuth();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("'Sign In' button is of type submit", () => {
    renderAuth();
    const btn = screen.getByRole("button", { name: "Sign In" });
    expect(btn).toHaveAttribute("type", "submit");
  });

  it("'Sign In' button is enabled on initial render", () => {
    renderAuth();
    expect(screen.getByRole("button", { name: "Sign In" })).not.toBeDisabled();
  });

  it("renders a 'Create Account' submit button in sign-up mode", () => {
    renderAuth("?mode=signup");
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Mode switching
// ---------------------------------------------------------------------------
describe("Auth page — mode switching", () => {
  it("switches to sign-up mode when 'Create an account' is clicked", () => {
    renderAuth();
    fireEvent.click(screen.getByText("Create an account"));
    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("switches back to sign-in when 'Sign in' toggle is clicked in sign-up mode", () => {
    renderAuth("?mode=signup");
    fireEvent.click(screen.getByText("Sign in"));
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  });

  it("switches to forgot-password mode when 'Forgot password?' is clicked", () => {
    renderAuth();
    fireEvent.click(screen.getByText("Forgot password?"));
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Reset Link" })).toBeInTheDocument();
  });

  it("hides the password field in forgot-password mode", () => {
    renderAuth();
    fireEvent.click(screen.getByText("Forgot password?"));
    expect(screen.queryByPlaceholderText("Password")).not.toBeInTheDocument();
  });

  it("returns to sign-in from forgot-password via 'Sign in' link", () => {
    renderAuth();
    fireEvent.click(screen.getByText("Forgot password?"));
    // The forgot-password mode has a "Sign in" link inside a sentence
    fireEvent.click(screen.getByText("Sign in"));
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Validation — client-side errors shown before any network call
// ---------------------------------------------------------------------------
describe("Auth page — form validation", () => {
  it("shows an email error when submitting with an empty email", () => {
    renderAuth();
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("shows a password error when submitting with an empty password", () => {
    renderAuth();
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("shows a password error when password is fewer than 8 characters", () => {
    renderAuth();
    fireEvent.change(screen.getByPlaceholderText("name@email.com"), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
  });
});
