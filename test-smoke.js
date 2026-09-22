// Quick smoke test for PulseDesk services
import assert from 'assert';
import { parseCurl, generateCurl } from './src/services/curlParser.ts';
import { substituteVariables, buildFullUrl } from './src/services/environment.ts';

console.log('Testing PulseDesk core modules...');

// Test 1: Variable substitution
const env = {
  id: 'test-env',
  name: 'Test',
  variables: [
    { id: '1', key: 'baseUrl', value: 'https://api.test.com', enabled: true },
    { id: '2', key: 'token', value: 'secret123', enabled: true },
    { id: '3', key: 'disabledVar', value: 'nope', enabled: false }
  ]
};

const subUrl = substituteVariables('{{baseUrl}}/v1/users', env);
assert.strictEqual(subUrl, 'https://api.test.com/v1/users', 'Variable substitution failed on URL');

const untouched = substituteVariables('{{disabledVar}}/v1', env);
assert.strictEqual(untouched, '{{disabledVar}}/v1', 'Disabled variable should not be replaced');

// Test 2: URL query builder
const fullUrl = buildFullUrl('https://api.test.com/search', [
  { key: 'q', value: 'cross platform', enabled: true },
  { key: 'limit', value: '10', enabled: true },
  { key: 'ignore', value: 'me', enabled: false }
]);
assert.strictEqual(
  fullUrl,
  'https://api.test.com/search?q=cross%20platform&limit=10',
  'Query string build failed'
);

// Test 3: cURL parser
const curlCommand = `curl -X POST https://api.test.com/items -H 'Authorization: Bearer mytoken' -H 'Content-Type: application/json' -d '{"name":"PulseDesk"}'`;
const parsed = parseCurl(curlCommand);

assert.ok(parsed, 'parseCurl returned null');
assert.strictEqual(parsed.method, 'POST');
assert.strictEqual(parsed.url, 'https://api.test.com/items');
assert.strictEqual(parsed.headers.length, 2);
assert.strictEqual(parsed.headers[0].key, 'Authorization');
assert.strictEqual(parsed.headers[0].value, 'Bearer mytoken');
assert.strictEqual(parsed.bodyType, 'json');

// Test 4: cURL generator
const generated = generateCurl(
  {
    id: 'req1',
    name: 'Req 1',
    method: 'POST',
    url: 'https://api.test.com/items',
    params: [],
    headers: [{ id: 'h1', key: 'X-Custom', value: 'Val', enabled: true }],
    bodyType: 'json',
    bodyContent: '{"key":"value"}'
  },
  'https://api.test.com/items'
);

assert.ok(generated.includes('--request POST'), 'Generated cURL missing method');
assert.ok(generated.includes('--header \'X-Custom: Val\''), 'Generated cURL missing header');
assert.ok(generated.includes('--data \'{"key":"value"}\''), 'Generated cURL missing body');

console.log('✓ All core logic smoke tests passed successfully!');
