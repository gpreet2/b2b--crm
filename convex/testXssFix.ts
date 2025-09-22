import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { detectXssAttempt } from "./lib/sanitization";
import { ValidationError } from "./lib/errors";

// Direct test of XSS validation
export const testXssValidation = mutation({
  args: {
    testInput: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Testing XSS detection with input:", args.testInput);
    
    // Test the function directly
    const isXss = detectXssAttempt(args.testInput);
    console.log("XSS detected:", isXss);
    
    if (isXss) {
      throw new ValidationError("XSS content detected: " + args.testInput, "testInput");
    }
    
    return {
      success: true,
      input: args.testInput,
      message: "Input is safe"
    };
  },
});

// Test client creation with validation
export const testClientCreationWithValidation = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    organizationId: v.id("organizations"),
    membershipType: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Testing client creation with firstName:", args.firstName);
    
    // Test XSS detection step by step
    console.log("1. Checking XSS in firstName...");
    const firstNameXss = detectXssAttempt(args.firstName);
    console.log("   firstName XSS result:", firstNameXss);
    
    if (firstNameXss) {
      console.log("   BLOCKING: XSS detected in firstName");
      throw new ValidationError("First name contains potentially malicious content", "firstName");
    }
    
    console.log("2. Checking XSS in lastName...");
    const lastNameXss = detectXssAttempt(args.lastName);
    console.log("   lastName XSS result:", lastNameXss);
    
    if (lastNameXss) {
      console.log("   BLOCKING: XSS detected in lastName");
      throw new ValidationError("Last name contains potentially malicious content", "lastName");
    }
    
    console.log("3. All validation passed, would create client");
    
    return {
      success: true,
      message: "Client creation would succeed",
      validationResults: {
        firstNameXss,
        lastNameXss
      }
    };
  },
});