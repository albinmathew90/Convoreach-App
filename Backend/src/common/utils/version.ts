import * as fs from 'fs';
import * as path from 'path';

/**
 * Walks up from the current directory until it finds the root package.json and returns its version.
 * Works reliably in both TypeScript source (src/) and compiled build output (dist/src/ or dist/).
 */
export function getAppVersion(): string {
  let dir = __dirname;
  while (dir !== path.parse(dir).root) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version?: string };
        if (pkg.version) return pkg.version;
      } catch {
        // Ignore JSON parse errors and continue walking up
      }
    }
    dir = path.dirname(dir);
  }
  return '0.0.0';
}
