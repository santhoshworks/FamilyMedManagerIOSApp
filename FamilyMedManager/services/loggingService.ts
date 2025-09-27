// Note: AsyncStorage functionality temporarily disabled
// import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AISearchLog {
  id: string;
  timestamp: Date;
  symptoms: string[];
  patientType: 'adult' | 'child';
  severity: 'mild' | 'moderate' | 'severe';
  additionalContext?: string;
  recommendationsCount: number;
  seekMedicalAttention: boolean;
  completed: boolean;
}

export class LoggingService {
  private static logs: AISearchLog[] = [];
  private static readonly MAX_LOGS = 50;

  static async logAISearchInteraction(log: Omit<AISearchLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newLog: AISearchLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: new Date(),
      };

      // Add to in-memory storage
      this.logs = [newLog, ...this.logs].slice(0, this.MAX_LOGS);

      // Log to console for debugging
      console.log('AI Search interaction logged:', {
        symptoms: newLog.symptoms,
        patientType: newLog.patientType,
        severity: newLog.severity,
        recommendationsCount: newLog.recommendationsCount,
        completed: newLog.completed,
      });
    } catch (error) {
      console.error('Error logging AI search interaction:', error);
    }
  }

  static async getAISearchLogs(): Promise<AISearchLog[]> {
    try {
      return [...this.logs]; // Return a copy
    } catch (error) {
      console.error('Error getting AI search logs:', error);
      return [];
    }
  }

  static async clearAISearchLogs(): Promise<void> {
    try {
      this.logs = [];
      console.log('AI search logs cleared');
    } catch (error) {
      console.error('Error clearing AI search logs:', error);
    }
  }

  static async getRecentSearchCount(days: number = 7): Promise<number> {
    try {
      const logs = await this.getAISearchLogs();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return logs.filter(log => log.timestamp > cutoffDate).length;
    } catch (error) {
      console.error('Error getting recent search count:', error);
      return 0;
    }
  }
}
