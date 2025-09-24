/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as backup_config from "../backup/config.js";
import type * as backup_monitor from "../backup/monitor.js";
import type * as backup_scheduleTests from "../backup/scheduleTests.js";
import type * as backup_testRestore from "../backup/testRestore.js";
import type * as backup_verifyEncryption from "../backup/verifyEncryption.js";
import type * as clients from "../clients.js";
import type * as compliance from "../compliance.js";
import type * as crons from "../crons.js";
import type * as debugAuth from "../debugAuth.js";
import type * as employees from "../employees.js";
import type * as http from "../http.js";
import type * as internal_secrets from "../internal/secrets.js";
import type * as lib_circuitBreaker from "../lib/circuitBreaker.js";
import type * as lib_errorHandler from "../lib/errorHandler.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_kms from "../lib/kms.js";
import type * as lib_resilientAction from "../lib/resilientAction.js";
import type * as lib_sanitization from "../lib/sanitization.js";
import type * as lib_secretValidation from "../lib/secretValidation.js";
import type * as lib_secrets from "../lib/secrets.js";
import type * as lib_sentry from "../lib/sentry.js";
import type * as lib_tracing from "../lib/tracing.js";
import type * as lib_validators from "../lib/validators.js";
import type * as organizationContext from "../organizationContext.js";
import type * as organizations from "../organizations.js";
import type * as ownerAccounts from "../ownerAccounts.js";
import type * as seed from "../seed.js";
import type * as test_errorHandling from "../test/errorHandling.js";
import type * as testAuth from "../testAuth.js";
import type * as testSecrets from "../testSecrets.js";
import type * as testValidation from "../testValidation.js";
import type * as testXssFix from "../testXssFix.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "backup/config": typeof backup_config;
  "backup/monitor": typeof backup_monitor;
  "backup/scheduleTests": typeof backup_scheduleTests;
  "backup/testRestore": typeof backup_testRestore;
  "backup/verifyEncryption": typeof backup_verifyEncryption;
  clients: typeof clients;
  compliance: typeof compliance;
  crons: typeof crons;
  debugAuth: typeof debugAuth;
  employees: typeof employees;
  http: typeof http;
  "internal/secrets": typeof internal_secrets;
  "lib/circuitBreaker": typeof lib_circuitBreaker;
  "lib/errorHandler": typeof lib_errorHandler;
  "lib/errors": typeof lib_errors;
  "lib/kms": typeof lib_kms;
  "lib/resilientAction": typeof lib_resilientAction;
  "lib/sanitization": typeof lib_sanitization;
  "lib/secretValidation": typeof lib_secretValidation;
  "lib/secrets": typeof lib_secrets;
  "lib/sentry": typeof lib_sentry;
  "lib/tracing": typeof lib_tracing;
  "lib/validators": typeof lib_validators;
  organizationContext: typeof organizationContext;
  organizations: typeof organizations;
  ownerAccounts: typeof ownerAccounts;
  seed: typeof seed;
  "test/errorHandling": typeof test_errorHandling;
  testAuth: typeof testAuth;
  testSecrets: typeof testSecrets;
  testValidation: typeof testValidation;
  testXssFix: typeof testXssFix;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
