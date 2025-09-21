// Simple test for debugging authResponseParser
import { parseAuthResponse } from './src/utils/authResponseParser.js';

const testError = {
  response: {
    status: 401,
    data: { message: 'User account is not active and unverified' }
  }
};

console.log('Testing authResponseParser with unverified account error...');
const result = parseAuthResponse(testError);
console.log('Result:', result);
console.log('Type:', result.type);
console.log('Should be notification:', result.type === 'notification');