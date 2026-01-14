
import { AuditLog } from '../types.ts';

class AuditService {
  private logs: AuditLog[] = [];

  // Fixed Omit to use created_at instead of timestamp
  async logEvent(event: Omit<AuditLog, 'id' | 'created_at' | 'ip' | 'userAgent'>) {
    const newLog: AuditLog = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      // Changed timestamp to created_at
      created_at: new Date().toISOString(),
      ip: '127.0.0.1', // Simulated
      userAgent: navigator.userAgent,
    };
    
    // In a real app, this calls POST /api/audit/event
    this.logs.unshift(newLog);
    console.debug('[AUDIT]', newLog);
  }

  getLogs() {
    return [...this.logs];
  }
}

export const auditService = new AuditService();
