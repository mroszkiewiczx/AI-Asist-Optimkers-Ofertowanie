
import { User } from '../types.ts';
import { auditService } from './auditService.ts';

// Seeded Users per Specification
const SEED_USERS: Record<string, { user: User; pass: string }> = {
  'm.roszkiewicz': {
    user: {
      id: 'u1',
      login: 'm.roszkiewicz',
      firstName: 'Mateusz',
      lastName: 'Roszkiewicz',
      email: 'mateusz.roszkiewicz@optimakers.pl',
      phone: '+48 535 455 855',
      position: 'New Business Manager',
      // Added missing role and createdAt properties
      role: 'ADMIN',
      status: 'active',
      mustChangePassword: true,
      permissions: ['ROI_ACCESS', 'CONFIG_ACCESS', 'SYNC_ACCESS', 'SYSTEM_LOGS_VIEW', 'USER_MANAGEMENT'],
      createdAt: '2023-01-01T00:00:00Z'
    },
    pass: 'password123'
  },
  'k.checinski': {
    user: {
      id: 'u2',
      login: 'k.checinski',
      firstName: 'Karol',
      lastName: 'Chęciński',
      email: 'karol.checinski@optimakers.pl',
      phone: '+48 517 827 436',
      position: 'Prezes Zarządu',
      // Added missing role and createdAt properties
      role: 'SALES_MANAGER',
      status: 'active',
      mustChangePassword: false,
      permissions: ['ROI_ACCESS', 'CONFIG_ACCESS', 'SYNC_ACCESS'],
      createdAt: '2023-01-02T00:00:00Z'
    },
    pass: 'Kchecinski21#@'
  },
  'l.ostrowski': {
    user: {
      id: 'u3',
      login: 'l.ostrowski',
      firstName: 'Łukasz',
      lastName: 'Ostrowski',
      email: 'lukasz.ostrowski@optimakers.pl',
      position: 'Dyrektor Działu Utrzymania i Wdrożeń',
      // Added missing role and createdAt properties
      role: 'SALES_MANAGER',
      status: 'active',
      mustChangePassword: false,
      permissions: ['ROI_ACCESS', 'CONFIG_ACCESS', 'SYNC_ACCESS'],
      createdAt: '2023-01-03T00:00:00Z'
    },
    pass: 'Lostrowski21#@'
  }
};

export const authService = {
  async login(login: string, pass: string): Promise<{ user: User, token: string }> {
    // Artificial delay to prevent timing attacks
    await new Promise(r => setTimeout(r, 800));

    const record = SEED_USERS[login];
    
    if (!record || record.pass !== pass) {
      // Fixed properties in logEvent
      await auditService.logEvent({
        level: 'ERROR',
        channel: 'AUDIT',
        login,
        message: 'AUTH_LOGIN_FAILED',
        meta: { reason: 'invalid_credentials' }
      });
      throw new Error("Nieprawidłowy login lub hasło");
    }

    // Fixed isActive to status check
    if (record.user.status !== 'active') {
      // Fixed properties in logEvent
      await auditService.logEvent({
        level: 'WARN',
        channel: 'AUDIT',
        login,
        message: 'AUTH_LOGIN_FAILED',
        meta: { reason: 'account_disabled' }
      });
      throw new Error("Konto jest nieaktywne");
    }

    // Fixed properties in logEvent
    await auditService.logEvent({
      level: 'INFO',
      channel: 'AUDIT',
      user_id: record.user.id,
      login,
      message: 'AUTH_LOGIN_SUCCESS',
      meta: { position: record.user.position }
    });

    return {
      user: record.user,
      token: 'mock-jwt-token-' + Math.random().toString(36).substr(2)
    };
  },

  async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
    await new Promise(r => setTimeout(r, 1000));
    
    // Fixed properties in logEvent
    await auditService.logEvent({
      level: 'INFO',
      channel: 'AUDIT',
      user_id: userId,
      login: 'system', // context user
      message: 'AUTH_PASSWORD_CHANGED',
      meta: { method: 'profile_settings' }
    });
  }
};
