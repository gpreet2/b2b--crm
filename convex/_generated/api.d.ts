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
import type * as employees from "../employees.js";
import type * as http from "../http.js";
import type * as internal_secrets from "../internal/secrets.js";
import type * as lib_kms from "../lib/kms.js";
import type * as lib_secretValidation from "../lib/secretValidation.js";
import type * as lib_secrets from "../lib/secrets.js";
import type * as organizations from "../organizations.js";
import type * as seed from "../seed.js";
import type * as testSecrets from "../testSecrets.js";

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
  employees: typeof employees;
  http: typeof http;
  "internal/secrets": typeof internal_secrets;
  "lib/kms": typeof lib_kms;
  "lib/secretValidation": typeof lib_secretValidation;
  "lib/secrets": typeof lib_secrets;
  organizations: typeof organizations;
  seed: typeof seed;
  testSecrets: typeof testSecrets;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
