import * as crypto from 'crypto';

// Simulate the same rollout logic that FlagVault uses
export function simulateRollout(userId: string, flagKey: string, rolloutPercentage: number, rolloutSeed: string): boolean {
  // Create hash using the same algorithm as FlagVault
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}-${flagKey}-${rolloutSeed}`)
    .digest();

  // Convert first 2 bytes to a number between 0-9999 (for 0.01% precision)
  const bucket = (hash[0] * 256 + hash[1]) % 10000;

  // Check if this context is in the rollout percentage
  const threshold = rolloutPercentage * 100; // Convert percentage to 0-10000 scale

  return bucket < threshold;
}