import { axiosInstance } from '../axios';

// Types for Audit Log (API format)
export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values: any;
  new_values: any;
  changed_by: string;
  created_at: string;
}

export interface AuditLogResponse {
  page: number;
  limit: number;
  count: number;
  results: AuditLogEntry[];
}

// Audit Log API functions
export const auditLogApi = {
  // Get all audit log entries
  getAll: async (params?: { table?: string }): Promise<AuditLogResponse> => {
    const response = await axiosInstance.get('/audit-log', { params });
    return response.data as AuditLogResponse;
  },

  // Get single audit log entry
  getById: async (logId: string): Promise<AuditLogEntry> => {
    const response = await axiosInstance.get(`/audit-log/${logId}`);
    return response.data as any;
  },

  // Get audit log entries by table
  getByTable: async (tableName: string): Promise<AuditLogResponse> => {
    return await auditLogApi.getAll({ table: tableName });
  },

  // Get audit log entries by record ID
  getByRecordId: async (recordId: string): Promise<AuditLogEntry[]> => {
    const response = await auditLogApi.getAll();
    return response.results.filter(entry => entry.record_id === recordId);
  },

  // Get audit log entries by user
  getByUser: async (userId: string): Promise<AuditLogEntry[]> => {
    const response = await auditLogApi.getAll();
    return response.results.filter(entry => entry.changed_by === userId);
  },
};

// Utility functions for audit log operations
export const auditLogUtils = {
  // Get audit log entries for current user (based on user role and permissions)
  getUserAuditLog: async (userId: string, userRole?: string, params?: { table?: string }) => {
    try {
      const response = await auditLogApi.getAll(params);

      // If user is admin, return all audit log entries
      if (userRole === 'admin') {
        return response;
      }

      // For other users, filter by their own actions
      return {
        ...response,
        results: response.results.filter(entry => entry.changed_by === userId)
      };
    } catch (error) {
      console.error('Error fetching user audit log:', error);
      throw error;
    }
  },

  // Format audit log entry for display
  formatForDisplay: (entry: AuditLogEntry) => {
    // Map action types to user-friendly labels
    const actionLabels: { [key: string]: string } = {
      'INSERT': 'Created',
      'UPDATE': 'Updated',
      'DELETE': 'Deleted'
    };

    return {
      id: entry.id,
      tableName: entry.table_name,
      recordId: entry.record_id,
      action: actionLabels[entry.action] || entry.action,
      changedBy: entry.changed_by,
      createdAt: new Date(entry.created_at).toLocaleString(),
      oldValues: entry.old_values,
      newValues: entry.new_values,
    };
  },

  // Get audit log summary statistics
  getAuditLogStats: async (entries: AuditLogEntry[]) => {
    const total = entries.length;
    const inserts = entries.filter(e => e.action === 'INSERT').length;
    const updates = entries.filter(e => e.action === 'UPDATE').length;
    const deletes = entries.filter(e => e.action === 'DELETE').length;

    const tables = [...new Set(entries.map(e => e.table_name))];
    const users = [...new Set(entries.map(e => e.changed_by))];

    return {
      total,
      inserts,
      updates,
      deletes,
      uniqueTables: tables.length,
      uniqueUsers: users.length,
      tables,
      users,
    };
  },
};

export default {
  auditLogApi,
  auditLogUtils,
};
