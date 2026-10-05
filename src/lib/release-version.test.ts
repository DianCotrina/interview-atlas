import { expect, it } from "vitest";
import { validateReleaseVersions } from "../../scripts/check-release-version.mjs";

function versions(version: string) {
  return {
    packageJson: { version },
    packageLock: { version, packages: { "": { version } } },
    manifest: { ".": version },
  };
}

it.each(["0.1.0", "1.2.3", "1.2.3-rc.1", "1.2.3+build.42", "1.2.3-rc.1+build.42"])(
  "accepts the synchronized SemVer release %s",
  (version) => {
    const values = versions(version);
    expect(validateReleaseVersions(values.packageJson, values.packageLock, values.manifest)).toBe(version);
  },
);

it.each(["v0.1.0", "1.2", "01.2.3", "1.02.3", "1.2.03", "1.2.3-01", "1.2.3-", "1.2.3+", "1.2.3\n"])(
  "rejects the invalid release version %s",
  (version) => {
    const values = versions(version);
    expect(() => validateReleaseVersions(values.packageJson, values.packageLock, values.manifest)).toThrow("SemVer");
  },
);

it("allows the empty bootstrap manifest before the first release", () => {
  const values = versions("0.1.0");
  expect(validateReleaseVersions(values.packageJson, values.packageLock, {})).toBe("0.1.0");
});

it("rejects a stale lockfile version before it can become a deployed artifact", () => {
  const values = versions("0.2.0");
  values.packageLock.version = "0.1.0";
  expect(() => validateReleaseVersions(values.packageJson, values.packageLock, values.manifest)).toThrow("package-lock.json");
});

it("also checks the lockfile's root package entry", () => {
  const values = versions("0.2.0");
  values.packageLock.packages[""].version = "0.1.0";
  expect(() => validateReleaseVersions(values.packageJson, values.packageLock, values.manifest)).toThrow("package-lock.json");
});

it("rejects a release manifest out of sync with the app", () => {
  const values = versions("0.2.0");
  values.manifest["."] = "0.1.0";
  expect(() => validateReleaseVersions(values.packageJson, values.packageLock, values.manifest)).toThrow("manifest");
});
