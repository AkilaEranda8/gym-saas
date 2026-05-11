jest.mock("@/lib/axios", () => {
  const mockApi = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return { default: mockApi };
});

jest.mock("@/lib/auth", () => ({
  getAccessToken: jest.fn().mockResolvedValue("mock-token"),
}));

export {};
