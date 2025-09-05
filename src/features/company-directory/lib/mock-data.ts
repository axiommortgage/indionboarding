export interface MockDirectoryParams {
  start: number;
  limit: number;
  province?: string;
  search?: string;
  isStaffMember?: boolean;
}

export interface MockDirectoryResult {
  users: any[];
  count: number;
}

export function getMockDirectoryData(params: MockDirectoryParams): MockDirectoryResult {
  // Return empty data for now
  return {
    users: [],
    count: 0,
  };
}
