import api from "./api";

export interface FeatureFlag {
  id: string;
  name: string;
  is_enabled: boolean;
  environment: "DEVELOPMENT" | "PRODUCTION";
  rules: {
    whitelist?: Array<{ userId: string; group?: string[] }>;
    blacklist?: Array<{ userId: string; group?: string[] }>;
    groups?: string[];
    rollout?: number;
  };
  rollout: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface FeatureFlagDetail extends FeatureFlag {
  whitelist: Array<{ userId: string; username: string; email: string }>;
  blacklist: Array<{ userId: string; username: string; email: string }>;
  groups: Array<{ id: string; name: string }>;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  totalUsers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  id: string;
  topic: string;
  content: string;
  platform: "LinkedIn" | "X" | "Instagram" | "Threads" | "Facebook" | "Blog";
  status: "DRAFT" | "POSTED" | "DELETED";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface RouteFlag {
  id: string;
  method: string;
  path: string;
  flagName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  flagId: string;
  action: string;
  performedBy: string;
  performedByUsername: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  createdAt: string;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  userStatus: string;
  groups: Array<{ name: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: number;
}

export interface FlagEvaluationResult {
  success: boolean;
  message: string;
  enabled: boolean;
}

const featureFlagService = {
  getAll: async (): Promise<PaginatedResponse<FeatureFlag>> => {
    const response = await api.get("/feature-flags");
    return response.data;
  },

  getNames: async (all: boolean = false): Promise<PaginatedResponse<{ id: string; name: string }>> => {
    const response = await api.get("/feature-flags/", { params: { all: all.toString() } });
    return response.data;
  },

  getDetails: async (flagId: string): Promise<ApiResponse<FeatureFlagDetail>> => {
    const response = await api.get(`/feature-flags/${flagId}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    is_enabled: boolean;
    environment: "DEVELOPMENT" | "PRODUCTION";
    rules?: {
      whitelist?: Array<{ userId: string; group?: string[] }>;
      blacklist?: Array<{ userId: string; group?: string[] }>;
      groups?: string[];
      rollout?: number;
    };
    rollout?: number;
  }): Promise<ApiResponse<FeatureFlag>> => {
    const response = await api.post("/feature-flags", data);
    return response.data;
  },

  toggle: async (flagId: string, isEnabled: boolean): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/feature-flags/${flagId}/toggle`, null, {
      params: { isEnabled },
    });
    return response.data;
  },

  delete: async (flagId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/feature-flags/${flagId}`);
    return response.data;
  },

  updateRules: async (
    flagId: string,
    rules: {
      whitelist?: Array<{ userId: string; group?: string[] }>;
      blacklist?: Array<{ userId: string; group?: string[] }>;
      groups?: string[];
      rollout?: number;
    }
  ): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/feature-flags/${flagId}/rules`, rules);
    return response.data;
  },

  addWhitelist: async (flagId: string, userId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/feature-flags/${flagId}/whitelist/${userId}`);
    return response.data;
  },

  addBlacklist: async (flagId: string, userId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/feature-flags/${flagId}/blacklist/${userId}`);
    return response.data;
  },

  addGroup: async (flagId: string, groupId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/feature-flags/${flagId}/groups/${groupId}`);
    return response.data;
  },

  evaluate: async (flagId: string, userId: string): Promise<FlagEvaluationResult> => {
    const response = await api.get(`/feature-flags/${flagId}/evaluate/${userId}`);
    return response.data;
  },

  getAudit: async (flagId: string): Promise<ApiResponse<AuditLog[]>> => {
    const response = await api.get(`/feature-flags/${flagId}/audit`);
    return response.data;
  },
};

const groupService = {
  getAll: async (params?: {
    search?: string;
    name?: string;
    totalUser?: number;
  }): Promise<PaginatedResponse<Group>> => {
    const response = await api.get("/groups", { params });
    return response.data;
  },

  create: async (name: string): Promise<ApiResponse<Group>> => {
    const response = await api.post("/groups", { name });
    return response.data;
  },

  updateName: async (groupId: string, name: string): Promise<ApiResponse<Group>> => {
    const response = await api.patch(`/groups/${groupId}`, { name });
    return response.data;
  },

  addUser: async (groupId: string, email: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/groups/${groupId}/users`, null, { params: { email } });
    return response.data;
  },

  removeUser: async (groupId: string, email: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/groups/${groupId}/users`, { params: { email } });
    return response.data;
  },

  delete: async (groupId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  },
};

const contentService = {
  getAll: async (params?: {
    content?: string;
    platform?: string;
    status?: string;
    isDeleted?: boolean;
    page: number,
    limit: number
  }): Promise<PaginatedResponse<Content>> => {
    const response = await api.get("/content", {
      params,
    });
    return response.data;
  },

  create: async (data: {
    topic: string;
    content: string;
    platform: "LinkedIn" | "X" | "Instagram" | "Threads" | "Facebook" | "Blog";
    status: "DRAFT" | "POSTED" | "DELETED";
  }): Promise<ApiResponse<Content>> => {
    const response = await api.post("/content/submit", data);
    return response.data;
  },

  update: async (contentId: string, data: {
    topic: string;
    content: string;
    platform: "LinkedIn" | "X" | "Instagram" | "Threads" | "Facebook" | "Blog";
    status: "DRAFT" | "POSTED" | "DELETED";
  }): Promise<ApiResponse<Content>>  => {
    const response = await api.put(`/content/edit/${contentId}`, data);
    return response.data
  },

  delete: async (contentId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/content/${contentId}`);
    return response.data;
  },
};

const contentAuditService = {
  getAudit: async (contentId: string) => {
    const response = await api.get(`/content/audit/${contentId}`);
    return response.data
  }
}

const routeFlagService = {
  getAll: async (): Promise<PaginatedResponse<RouteFlag>> => {
    const response = await api.get("/route-flags");
    return response.data;
  },

  create: async (data: { method: string; path: string; flagName: string }): Promise<ApiResponse<RouteFlag>> => {
    const response = await api.post("/route-flags", data);
    return response.data;
  },

  update: async (data: { method: string; path: string; flagName: string }): Promise<ApiResponse<RouteFlag>> => {
    const response = await api.patch("/route-flags", data);
    return response.data;
  },

  delete: async (method: string, path: string): Promise<ApiResponse<void>> => {
    const response = await api.delete("/route-flags", { params: { method, path } });
    return response.data;
  },
};

const userService = {
  getMe: async (): Promise<ApiResponse<UserData>> => {
    const response = await api.get("/user/me");
    return response.data;
  },
};

export { featureFlagService, groupService, contentService, contentAuditService, routeFlagService, userService };