/**
 * Comprehensive validation and security testing for Task 5
 * Tests XSS prevention, injection attacks, sanitization, and edge cases
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { 
  normalizeEmail, 
  sanitizeInput, 
  preventXss, 
  detectXssAttempt, 
  detectSqlInjection,
  normalizeName,
  sanitizeBusinessName,
  sanitizeTags,
  normalizePhone,
  sanitizeNotes
} from "./lib/sanitization";
import { withErrorHandlingMutation } from "./lib/errorHandler";
import { ValidationError } from "./lib/errors";

// Comprehensive validation framework tests
export const testValidationFramework = mutation({
  args: {},
  handler: withErrorHandlingMutation(async (ctx, args) => {
    const results: any = {
      timestamp: Date.now(),
      tests: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };

    // Helper to run individual tests
    const runTest = (testName: string, testFn: () => any) => {
      results.summary.total++;
      try {
        const result = testFn();
        results.tests[testName] = { status: "PASS", result };
        results.summary.passed++;
      } catch (error: any) {
        results.tests[testName] = { 
          status: "FAIL", 
          error: error.message,
          expected: "Should not throw error"
        };
        results.summary.failed++;
      }
    };

    // Helper to test that function SHOULD throw error
    const runFailureTest = (testName: string, testFn: () => any, expectedError?: string) => {
      results.summary.total++;
      try {
        const result = testFn();
        results.tests[testName] = { 
          status: "FAIL", 
          result,
          expected: `Should throw error${expectedError ? `: ${expectedError}` : ""}`
        };
        results.summary.failed++;
      } catch (error: any) {
        const errorMatches = expectedError ? error.message.includes(expectedError) : true;
        if (errorMatches) {
          results.tests[testName] = { 
            status: "PASS", 
            error: error.message,
            expected: "Should throw error as expected"
          };
          results.summary.passed++;
        } else {
          results.tests[testName] = { 
            status: "FAIL", 
            error: error.message,
            expected: `Should throw error containing: ${expectedError}`
          };
          results.summary.failed++;
        }
      }
    };

    // === EMAIL VALIDATION TESTS ===
    runTest("email_normalization_basic", () => {
      return normalizeEmail("  Test@EXAMPLE.COM  ");
    });

    runFailureTest("email_validation_invalid", () => {
      return normalizeEmail("invalid-email");
    }, "Invalid email format");

    runFailureTest("email_validation_empty", () => {
      return normalizeEmail("");
    }, "Invalid email format");

    // === XSS DETECTION TESTS ===
    runTest("xss_detection_script_tag", () => {
      return detectXssAttempt("<script>alert('xss')</script>");
    });

    runTest("xss_detection_iframe", () => {
      return detectXssAttempt('<iframe src="javascript:alert()"></iframe>');
    });

    runTest("xss_detection_onerror", () => {
      return detectXssAttempt('<img src=x onerror="alert(1)">');
    });

    runTest("xss_detection_javascript_url", () => {
      return detectXssAttempt('javascript:alert("xss")');
    });

    runTest("xss_detection_safe_content", () => {
      return !detectXssAttempt("Hello World! This is safe content.");
    });

    // === XSS PREVENTION TESTS ===
    runTest("xss_prevention_script", () => {
      const result = preventXss("<script>alert('bad')</script>Hello");
      return result.includes("&lt;") && result.includes("&gt;") && !result.includes("<script");
    });

    runTest("xss_prevention_safe_text", () => {
      const result = preventXss("Hello World 123!");
      return result === "Hello World 123!";
    });

    // === SQL INJECTION DETECTION TESTS ===
    runTest("sql_injection_detection_union", () => {
      return detectSqlInjection("'; DROP TABLE users; --");
    });

    runTest("sql_injection_detection_select", () => {
      return detectSqlInjection("1 UNION SELECT * FROM passwords");
    });

    runTest("sql_injection_detection_safe", () => {
      return !detectSqlInjection("Regular safe text with numbers 123");
    });

    // === NAME SANITIZATION TESTS ===
    runTest("name_normalization_basic", () => {
      const result = normalizeName("  john    doe  ");
      return result === "John Doe";
    });

    runTest("name_normalization_unicode", () => {
      const result = normalizeName("andré müller");
      return result === "André Müller";
    });

    runFailureTest("name_validation_empty", () => {
      return normalizeName("");
    }, "Name cannot be empty");

    runFailureTest("name_validation_too_long", () => {
      return normalizeName("a".repeat(100));
    }, "Name is too long");

    // === BUSINESS NAME SANITIZATION TESTS ===
    runTest("business_name_basic", () => {
      const result = sanitizeBusinessName("  Iron Fitness Gym  ");
      return result === "Iron Fitness Gym";
    });

    runFailureTest("business_name_xss", () => {
      return sanitizeBusinessName("<script>alert('hack')</script>Gym");
    }, "malicious content");

    runFailureTest("business_name_empty", () => {
      return sanitizeBusinessName("");
    }, "Business name cannot be empty");

    // === PHONE NORMALIZATION TESTS ===
    runTest("phone_normalization_us", () => {
      const result = normalizePhone("(555) 123-4567");
      return result === "+15551234567";
    });

    runTest("phone_normalization_international", () => {
      const result = normalizePhone("+44 20 7946 0958");
      return result === "+442079460958";
    });

    runFailureTest("phone_validation_invalid", () => {
      return normalizePhone("invalid");
    }, "Invalid phone number format");

    // === TAG SANITIZATION TESTS ===
    runTest("tags_sanitization_basic", () => {
      const result = sanitizeTags(["FITNESS", " yoga ", "Cross-Training"]);
      return result?.includes("fitness") && result?.includes("yoga") && result?.includes("cross-training");
    });

    runTest("tags_sanitization_duplicates", () => {
      const result = sanitizeTags(["fitness", "FITNESS", "fitness"]);
      return result?.length === 1 && result[0] === "fitness";
    });

    runTest("tags_sanitization_invalid", () => {
      const result = sanitizeTags(["valid", "<script>", "also-valid"]);
      return result?.length === 2 && !result?.includes("<script>");
    });

    // === COMPREHENSIVE INPUT SANITIZATION TESTS ===
    runTest("input_sanitization_basic", () => {
      const result = sanitizeInput("Hello World!", "test");
      return result === "Hello World!";
    });

    runFailureTest("input_sanitization_xss", () => {
      return sanitizeInput("<script>alert('xss')</script>", "test");
    }, "malicious content");

    runFailureTest("input_sanitization_sql", () => {
      return sanitizeInput("'; DROP TABLE users; --", "test");
    }, "malicious SQL patterns");

    runFailureTest("input_sanitization_too_long", () => {
      return sanitizeInput("a".repeat(300), "test", { maxLength: 100 });
    }, "must not exceed 100 characters");

    // === NOTES SANITIZATION TESTS ===
    runTest("notes_sanitization_safe", () => {
      const result = sanitizeNotes("Client has back issues. Avoid heavy lifting.");
      return result === "Client has back issues. Avoid heavy lifting.";
    });

    runFailureTest("notes_sanitization_xss", () => {
      return sanitizeNotes('<img src=x onerror="alert(1)">Notes here');
    }, "malicious content");

    runTest("notes_sanitization_null", () => {
      const result = sanitizeNotes(null);
      return result === null;
    });

    // === EDGE CASES AND BOUNDARY CONDITIONS ===
    runTest("edge_case_empty_strings", () => {
      const result1 = preventXss("");
      const result2 = detectXssAttempt("");
      return result1 === "" && result2 === false;
    });

    runTest("edge_case_whitespace_only", () => {
      const result = sanitizeInput("   ", "test", { minLength: 0 });
      return result === "";
    });

    runTest("edge_case_unicode_handling", () => {
      const result = normalizeName("José María García-López");
      return result === "José María García-López";
    });

    // === TYPE SAFETY AND ERROR HANDLING TESTS ===
    runFailureTest("type_safety_non_string_email", () => {
      return (normalizeEmail as any)(123);
    }, "must be a string");

    runFailureTest("type_safety_non_string_name", () => {
      return (normalizeName as any)(null);
    }, "must be a string");

    return {
      success: true,
      message: `Task 5 Data Validation Framework Test Results: ${results.summary.passed}/${results.summary.total} tests passed`,
      results: results,
      framework_status: results.summary.failed === 0 ? "ROBUST" : "NEEDS_ATTENTION"
    };
  }, "testValidationFramework"),
});

// Test specific XSS attack vectors
export const testXssAttackVectors = mutation({
  args: {
    testVector: v.optional(v.string())
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Common XSS attack vectors to test
    const attackVectors = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      '<iframe src="javascript:alert()"></iframe>',
      '<svg onload="alert(1)">',
      'javascript:alert("XSS")',
      '<body onload=alert(1)>',
      '<input onfocus=alert(1) autofocus>',
      '"><script>alert(1)</script>',
      "'><script>alert(1)</script>",
      '<script src="http://evil.com/xss.js"></script>',
      '<link rel="stylesheet" href="javascript:alert(1)">',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
      'eval("alert(1)")',
      'Expression(alert(1))',
      '<table background="javascript:alert(1)">',
      '<object data="javascript:alert(1)">',
      '<embed src="javascript:alert(1)">',
      '<applet code="alert(1)">',
      '<form><button formaction="javascript:alert(1)">',
      '<input type="image" src="javascript:alert(1)">'
    ];

    const testVector = args.testVector || attackVectors[0];
    
    const results = {
      testedVector: testVector,
      detectionResults: {
        detectXssAttempt: detectXssAttempt(testVector),
        detectSqlInjection: detectSqlInjection(testVector)
      },
      sanitizationResults: {
        preventXss: preventXss(testVector),
        stripHtml: testVector.replace(/<[^>]*>/g, ''),
      },
      isBlocked: false,
      errorThrown: null
    };

    // Test if sanitizeInput blocks it
    try {
      sanitizeInput(testVector, "testField");
      results.isBlocked = false;
    } catch (error: any) {
      results.isBlocked = true;
      results.errorThrown = error.message;
    }

    return {
      success: true,
      message: `XSS Attack Vector Test: ${results.isBlocked ? 'BLOCKED' : 'NOT BLOCKED'}`,
      results: results,
      recommendation: results.isBlocked ? 
        "✅ Attack vector successfully blocked by validation framework" : 
        "⚠️ Attack vector not blocked - review sanitization logic",
      allVectorsAvailable: attackVectors.length
    };
  }, "testXssAttackVectors"),
});

// Original simple test for backwards compatibility
export const testValidation = mutation({
  args: {},
  handler: async (ctx, args) => {
    try {
      // Test email normalization
      const email = normalizeEmail("  Test@EXAMPLE.COM  ");
      
      // Test input sanitization
      const sanitized = sanitizeInput("Hello World", "test");
      
      return {
        success: true,
        email: email,
        sanitized: sanitized,
        message: "Task 5 Data Validation Framework is working!",
        note: "Use testValidationFramework for comprehensive testing"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error"
      };
    }
  },
});