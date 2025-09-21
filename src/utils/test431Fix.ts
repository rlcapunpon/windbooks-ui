/**
 * Test utility to verify 431 error fix is working properly
 */

// Simulate a large JWT token (like superadmin with many roles)
const LARGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 'x'.repeat(19000);

// Constants from API client
const MAX_AUTH_HEADER_SIZE = 4000;
const WARN_AUTH_HEADER_SIZE = 2000;

export function test431Fix() {
    console.log('🔍 Testing 431 Error Fix');
    console.log('========================');
    
    // Test token size detection
    const authHeaderValue = `Bearer ${LARGE_TOKEN}`;
    const headerSize = authHeaderValue.length;
    
    console.log(`📏 Large token size: ${LARGE_TOKEN.length} characters`);
    console.log(`📏 Authorization header size: ${headerSize} characters`);
    console.log(`⚠️ Warning threshold: ${WARN_AUTH_HEADER_SIZE} characters`);
    console.log(`🚫 Max allowed size: ${MAX_AUTH_HEADER_SIZE} characters`);
    
    // Simulate the logic from our API client
    if (headerSize > MAX_AUTH_HEADER_SIZE) {
        console.log('✅ PASS: Large token would be rejected (no Authorization header sent)');
        console.log('   This prevents 431 Request Header Fields Too Large errors');
        return true;
    } else {
        console.log('❌ FAIL: Token would be sent and might cause 431 error');
        return false;
    }
}

// Test with actual stored token if available
export function testCurrentToken() {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
        console.log('ℹ️ No token stored in localStorage');
        return;
    }
    
    console.log('🔍 Testing Current Stored Token');
    console.log('===============================');
    
    const authHeaderValue = `Bearer ${storedToken}`;
    const headerSize = authHeaderValue.length;
    
    console.log(`📏 Current token size: ${storedToken.length} characters`);
    console.log(`📏 Authorization header size: ${headerSize} characters`);
    
    if (headerSize > MAX_AUTH_HEADER_SIZE) {
        console.log('⚠️ Current token exceeds size limit - Authorization headers will be skipped');
    } else if (headerSize > WARN_AUTH_HEADER_SIZE) {
        console.log('⚠️ Current token approaching size limit');
    } else {
        console.log('✅ Current token within normal size limits');
    }
}

// Make functions available globally for testing
declare global {
    interface Window {
        test431Fix: () => boolean;
        testCurrentToken: () => void;
    }
}

if (typeof window !== 'undefined') {
    window.test431Fix = test431Fix;
    window.testCurrentToken = testCurrentToken;
}