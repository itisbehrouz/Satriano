import "@testing-library/jest-dom/vitest";

// Dynamically populate test environment variables for vitest test execution
if (!process.env.ADMIN_ACCESS_KEY) {
  process.env.ADMIN_ACCESS_KEY = "test_env_admin_access_key_99887766554433221100";
}
if (!process.env.ADMIN_JWT_SECRET) {
  process.env.ADMIN_JWT_SECRET = "test_env_admin_jwt_secret_11223344556677889900";
}
