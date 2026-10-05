import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Official SemVer 2.0.0 expression: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * @param {{ version: string }} packageJson
 * @param {{ version: string, packages: Record<string, { version?: string }> }} packageLock
 * @param {Record<string, string>} manifest
 */
export function validateReleaseVersions(packageJson, packageLock, manifest) {
  const { version } = packageJson;
  if (!semver.test(version)) throw new Error("package.json version must use SemVer 2.0.0.");
  if (packageLock.version !== version || packageLock.packages[""]?.version !== version)
    throw new Error("package-lock.json release versions must match package.json.");
  // Release Please populates the manifest when its first release PR is merged.
  if (Object.keys(manifest).length > 0 && manifest["."] !== version)
    throw new Error("The release manifest version must match package.json.");
  return version;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const readJson = (name) => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), "utf8"));
  const version = validateReleaseVersions(
    readJson("package.json"), readJson("package-lock.json"), readJson(".release-please-manifest.json"),
  );
  console.log(`Release version: ${version}`);
}
