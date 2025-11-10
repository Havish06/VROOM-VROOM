// A larger file for more accurate download measurement. Using a public speed test file.
export const DOWNLOAD_URL = 'https://speed.cloudflare.com/__down?bytes=50000000'; // 50MB
export const DOWNLOAD_FILE_SIZE_BYTES = 50 * 1024 * 1024;

// URL for ping test. We only need the headers. Using cloudflare for low latency check.
export const PING_URL = 'https://speed.cloudflare.com/__down?bytes=0';

// Number of ping requests to make for averaging
export const PING_COUNT = 5;

// Interval for live speed updates
export const LIVE_SPEED_UPDATE_INTERVAL_MS = 500;

// Duration for download/upload tests
export const TEST_DURATION_MS = 5000; // 5 seconds (10 readings at 500ms interval)
