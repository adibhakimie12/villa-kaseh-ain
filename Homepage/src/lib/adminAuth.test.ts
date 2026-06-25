import assert from 'node:assert/strict';
import { isAllowedAdminEmail, parseAdminEmails } from './adminAuth';

assert.deepEqual(parseAdminEmails('owner@example.com, admin@example.com'), [
  'owner@example.com',
  'admin@example.com',
]);

assert.equal(isAllowedAdminEmail('OWNER@example.com', 'owner@example.com'), true);
assert.equal(isAllowedAdminEmail('guest@example.com', 'owner@example.com'), false);
assert.equal(isAllowedAdminEmail('', 'owner@example.com'), false);
assert.equal(isAllowedAdminEmail('owner@example.com', ''), false);
