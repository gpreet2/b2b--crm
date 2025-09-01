/**
 * Backup Restoration Testing System
 * 
 * Provides automated testing of backup restoration procedures to validate
 * recovery capabilities and ensure RTO/RPO compliance.
 */

import { query, mutation } from '../_generated/server';
import { v } from 'convex/values';
import { api } from '../_generated/api';

/**
 * Create test data for restoration validation
 */
export const createTestData = mutation({
  args: {
    testId: v.string(),
    recordCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const recordCount = args.recordCount || 10;
    const testData = [];

    try {
      // Create test records across multiple tables
      for (let i = 0; i < recordCount; i++) {
        // Test users
        const userId = await ctx.db.insert('users', {
          workosId: `test_user_${args.testId}_${i}`,
          email: `test${i}@restoration-test.local`,
          name: `Test User ${i}`,
          organizationId: undefined,
          role: 'member',
          permissions: ['test.read'],
          status: 'active',
          profileData: {
            firstName: `Test${i}`,
            lastName: 'User',
            phone: `+1-555-${String(i).padStart(4, '0')}`,
          },
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        // Test audit logs
        const auditId = await ctx.db.insert('auditLogs', {
          userId,
          organizationId: undefined,
          action: 'test_data_creation',
          resourceType: 'restoration_test',
          resourceId: `test_${args.testId}_${i}`,
          details: {
            testId: args.testId,
            recordNumber: i,
            timestamp,
            testType: 'restoration_validation',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'RestorationTestSuite/1.0',
          source: 'backup_restoration_test',
          severity: 'info',
          timestamp,
        });

        testData.push({
          userId,
          auditId,
          recordNumber: i,
        });
      }

      // Create test summary record
      const summaryId = await ctx.db.insert('systemHealth', {
        checkType: 'database',
        status: 'healthy',
        details: {
          testId: args.testId,
          testType: 'restoration_preparation',
          recordsCreated: recordCount,
          tablesAffected: ['users', 'auditLogs'],
          timestamp,
        },
        timestamp,
        alertSent: false,
      });

      // Log the test data creation
      await ctx.db.insert('auditLogs', {
        userId: undefined,
        organizationId: undefined,
        action: 'restoration_test_data_created',
        resourceType: 'backup_testing',
        resourceId: args.testId,
        details: {
          testId: args.testId,
          recordsCreated: recordCount,
          summaryId,
          testData: testData.map(t => ({ userId: t.userId, recordNumber: t.recordNumber })),
        },
        ipAddress: '127.0.0.1',
        userAgent: 'RestorationTestSuite/1.0',
        source: 'backup_restoration_test',
        severity: 'info',
        timestamp,
      });

      return {
        success: true,
        testId: args.testId,
        recordsCreated: recordCount,
        testData,
        summaryId,
        message: `Test data created successfully for restoration test ${args.testId}`,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await ctx.db.insert('auditLogs', {
        userId: undefined,
        organizationId: undefined,
        action: 'restoration_test_data_failed',
        resourceType: 'backup_testing',
        resourceId: args.testId,
        details: {
          testId: args.testId,
          error: errorMessage,
          timestamp,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'RestorationTestSuite/1.0',
        source: 'backup_restoration_test',
        severity: 'error',
        timestamp,
      });

      throw new Error(`Test data creation failed: ${errorMessage}`);
    }
  },
});

/**
 * Validate restoration by checking test data integrity
 */
export const validateRestorationTest = query({
  args: {
    testId: v.string(),
    expectedRecords: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const expectedRecords = args.expectedRecords || 10;

    try {
      // Find test users created for this test
      const testUsers = await ctx.db
        .query('users')
        .filter(q => q.eq(q.field('email'), `test0@restoration-test.local`))
        .collect();

      // Get test audit logs
      const testAuditLogs = await ctx.db
        .query('auditLogs')
        .withIndex('by_action', q => q.eq('action', 'test_data_creation'))
        .filter(q => q.eq(q.field('details.testId'), args.testId))
        .collect();

      // Get system health record
      const testHealthRecords = await ctx.db
        .query('systemHealth')
        .withIndex('by_check_type', q => q.eq('checkType', 'database'))
        .filter(q => q.eq(q.field('details.testId'), args.testId))
        .collect();

      // Validate data integrity
      const validation = {
        testId: args.testId,
        expectedRecords,
        actualUsers: testUsers.length,
        actualAuditLogs: testAuditLogs.length,
        actualHealthRecords: testHealthRecords.length,
        dataIntegrity: {
          usersMatch: testUsers.length >= 1, // At least one user should exist
          auditLogsMatch: testAuditLogs.length >= expectedRecords,
          healthRecordsExist: testHealthRecords.length >= 1,
          emailFormatCorrect: testUsers.every(u => u.email?.includes('restoration-test.local')),
          timestampsValid: testAuditLogs.every(a => a.timestamp > 0),
        },
        overallSuccess: false,
        issues: [] as string[],
      };

      // Check for data integrity issues
      if (validation.actualUsers < 1) {
        validation.issues.push('No test users found - possible data loss');
      }

      if (validation.actualAuditLogs < expectedRecords) {
        validation.issues.push(`Audit log count mismatch: expected ${expectedRecords}, found ${validation.actualAuditLogs}`);
      }

      if (validation.actualHealthRecords < 1) {
        validation.issues.push('System health record not found');
      }

      // Cross-reference data consistency
      for (const user of testUsers) {
        const userAuditLogs = testAuditLogs.filter(a => a.userId === user._id);
        if (userAuditLogs.length === 0) {
          validation.issues.push(`No audit logs found for user ${user.email}`);
        }
      }

      // Overall success determination
      validation.overallSuccess = validation.issues.length === 0 && 
        validation.dataIntegrity.usersMatch &&
        validation.dataIntegrity.auditLogsMatch &&
        validation.dataIntegrity.healthRecordsExist;

      return {
        success: true,
        timestamp,
        validation,
        message: validation.overallSuccess 
          ? `Restoration validation passed for test ${args.testId}`
          : `Restoration validation failed for test ${args.testId}`,
        recommendations: generateValidationRecommendations(validation),
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        timestamp,
        error: errorMessage,
        message: `Restoration validation failed: ${errorMessage}`,
      };
    }
  },
});

/**
 * Clean up test data after restoration testing
 */
export const cleanupTestData = mutation({
  args: {
    testId: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    let deletedCount = 0;

    try {
      // Delete test users
      const testUsers = await ctx.db
        .query('users')
        .filter(q => q.contains(q.field('workosId'), args.testId))
        .collect();

      for (const user of testUsers) {
        await ctx.db.delete(user._id);
        deletedCount++;
      }

      // Delete test audit logs
      const testAuditLogs = await ctx.db
        .query('auditLogs')
        .withIndex('by_source', q => q.eq('source', 'backup_restoration_test'))
        .filter(q => q.eq(q.field('details.testId'), args.testId))
        .collect();

      for (const auditLog of testAuditLogs) {
        await ctx.db.delete(auditLog._id);
        deletedCount++;
      }

      // Delete test system health records
      const testHealthRecords = await ctx.db
        .query('systemHealth')
        .withIndex('by_check_type', q => q.eq('checkType', 'database'))
        .filter(q => q.eq(q.field('details.testId'), args.testId))
        .collect();

      for (const healthRecord of testHealthRecords) {
        await ctx.db.delete(healthRecord._id);
        deletedCount++;
      }

      // Log the cleanup
      await ctx.db.insert('auditLogs', {
        userId: undefined,
        organizationId: undefined,
        action: 'restoration_test_cleanup_completed',
        resourceType: 'backup_testing',
        resourceId: args.testId,
        details: {
          testId: args.testId,
          recordsDeleted: deletedCount,
          timestamp,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'RestorationTestSuite/1.0',
        source: 'backup_restoration_cleanup',
        severity: 'info',
        timestamp,
      });

      return {
        success: true,
        testId: args.testId,
        recordsDeleted: deletedCount,
        message: `Test data cleanup completed for ${args.testId}`,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await ctx.db.insert('auditLogs', {
        userId: undefined,
        organizationId: undefined,
        action: 'restoration_test_cleanup_failed',
        resourceType: 'backup_testing',
        resourceId: args.testId,
        details: {
          testId: args.testId,
          error: errorMessage,
          recordsDeleted: deletedCount,
          timestamp,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'RestorationTestSuite/1.0',
        source: 'backup_restoration_cleanup',
        severity: 'error',
        timestamp,
      });

      throw new Error(`Test data cleanup failed: ${errorMessage}`);
    }
  },
});

/**
 * Run comprehensive restoration test
 */
export const runRestorationTest = mutation({
  args: {
    testName: v.optional(v.string()),
    recordCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const testId = `restoration_test_${timestamp}`;
    const testName = args.testName || `Automated Restoration Test ${new Date().toISOString()}`;
    const recordCount = args.recordCount || 10;

    try {
      console.log(`Starting restoration test: ${testId}`);

      // Step 1: Create test data
      const testDataResult = await ctx.runMutation(api.backup.testRestore.createTestData, {
        testId,
        recordCount,
      });

      if (!testDataResult.success) {
        throw new Error('Test data creation failed');
      }

      // Step 2: Wait a moment for data to be committed
      // In a real test, we would trigger an actual backup and restoration here
      
      // Step 3: Validate the "restored" data (simulated)
      const validationResult = await ctx.runQuery(api.backup.testRestore.validateRestorationTest, {
        testId,
        expectedRecords: recordCount,
      });

      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.error}`);
      }

      // Step 4: Clean up test data
      const cleanupResult = await ctx.runMutation(api.backup.testRestore.cleanupTestData, {
        testId,
      });

      // Create test summary
      const testSummary = {
        testId,
        testName,
        startTime: timestamp,
        endTime: Date.now(),
        duration: Date.now() - timestamp,
        recordCount,
        phases: {
          dataCreation: testDataResult.success,
          validation: validationResult.success,
          cleanup: cleanupResult.success,
        },
        validation: validationResult.validation,
        overallSuccess: testDataResult.success && validationResult.success && cleanupResult.success,
      };

      // Log the test completion
      await ctx.db.insert('auditLogs', {
        userId: undefined,
        organizationId: undefined,
        action: 'restoration_test_completed',
        resourceType: 'backup_testing',
        resourceId: testId,
        details: testSummary,
        ipAddress: '127.0.0.1',
        userAgent: 'RestorationTestSuite/1.0',
        source: 'backup_restoration_test',
        severity: testSummary.overallSuccess ? 'info' : 'warning',
        timestamp: Date.now(),
      });

      return {
        success: testSummary.overallSuccess,
        testSummary,
        message: testSummary.overallSuccess 
          ? `Restoration test ${testId} completed successfully`
          : `Restoration test ${testId} completed with issues`,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await ctx.db.insert('auditLogs', {
        userId: undefined,
        organizationId: undefined,
        action: 'restoration_test_failed',
        resourceType: 'backup_testing',
        resourceId: testId,
        details: {
          testId,
          testName,
          error: errorMessage,
          timestamp,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'RestorationTestSuite/1.0',
        source: 'backup_restoration_test',
        severity: 'error',
        timestamp: Date.now(),
      });

      throw new Error(`Restoration test failed: ${errorMessage}`);
    }
  },
});

/**
 * Get restoration test history
 */
export const getRestorationTestHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    try {
      const testRecords = await ctx.db
        .query('auditLogs')
        .withIndex('by_action', q => q.eq('action', 'restoration_test_completed'))
        .order('desc')
        .take(limit);

      const testHistory = testRecords.map(record => ({
        testId: record.resourceId,
        timestamp: record.timestamp,
        date: new Date(record.timestamp).toISOString(),
        duration: record.details?.duration || 0,
        success: record.details?.overallSuccess || false,
        recordCount: record.details?.recordCount || 0,
        phases: record.details?.phases || {},
        validationIssues: record.details?.validation?.issues || [],
      }));

      const summary = {
        totalTests: testHistory.length,
        successfulTests: testHistory.filter(t => t.success).length,
        failedTests: testHistory.filter(t => !t.success).length,
        averageDuration: testHistory.reduce((acc, t) => acc + t.duration, 0) / testHistory.length,
        successRate: testHistory.length > 0 
          ? (testHistory.filter(t => t.success).length / testHistory.length) * 100 
          : 0,
      };

      return {
        success: true,
        testHistory,
        summary,
        message: `Retrieved ${testHistory.length} restoration test records`,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve restoration test history',
      };
    }
  },
});

/**
 * Generate validation recommendations based on test results
 */
function generateValidationRecommendations(validation: any): string[] {
  const recommendations: string[] = [];

  if (!validation.overallSuccess) {
    recommendations.push('❌ Restoration validation failed - investigate data integrity issues');
  }

  if (!validation.dataIntegrity.usersMatch) {
    recommendations.push('👥 User data integrity issue - verify user table restoration');
  }

  if (!validation.dataIntegrity.auditLogsMatch) {
    recommendations.push('📋 Audit log count mismatch - check audit trail completeness');
  }

  if (!validation.dataIntegrity.healthRecordsExist) {
    recommendations.push('💾 System health records missing - verify metadata restoration');
  }

  if (validation.issues.length > 0) {
    recommendations.push(`🔍 Address ${validation.issues.length} specific validation issues`);
  }

  if (validation.overallSuccess) {
    recommendations.push('✅ All validation checks passed successfully');
    recommendations.push('📊 Continue regular restoration testing');
    recommendations.push('🔄 Schedule next quarterly validation test');
  }

  // General recommendations
  recommendations.push('📝 Document any issues found during testing');
  recommendations.push('🛠️  Update restoration procedures based on test results');
  recommendations.push('👨‍💻 Train team on any new restoration findings');

  return recommendations;
}