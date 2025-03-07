"server-only";

import { handleApiRequest } from "./api-handler";

export const forgetPassApi = async (data) => {
  return handleApiRequest("POST", "/api/auth/forgot-password", {
    body: data,
  });
};

export const resetPassApi = async (data) => {
  return handleApiRequest("POST", "/api/auth/reset-password", {
    body: data,
  });
};

export const getUser = async (token) => {
  const endpoint = "/api/auth/getUser";

  return handleApiRequest("POST", endpoint, {
    token,
  });
};

export async function createUser(name, email, password) {
  const endpoint = "/api/auth/register";
  return handleApiRequest("POST", endpoint, { body: { name, email, password } });
}

export const getProfile = async (token) => {
  const response = await handleApiRequest("GET", "/api/auth/user", { token });
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
};

export const updateUser = async (token, data) => {
  return handleApiRequest("PUT", "/api/auth/update", {
    token,
    body: data,
  });
};


