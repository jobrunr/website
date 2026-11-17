---
title: "Path traversal in the JobRunr dashboard allows reading classpath resources"
meta_title: "GHSA-fm36-5jx4-vwhf: Path Traversal in the JobRunr Dashboard | JobRunr"
description: "Security advisory for JobRunr: a path traversal in the dashboard's static file handler can expose classpath resources when the classpath contains directories. Affected versions, fixed versions and mitigation."
# ---------------------------------------------------------------------------
# GO-LIVE CHECKLIST (YAML comments, never rendered)
#
# This page must NOT go live before the advisory is published on GitHub.
# 1. Release the fixed versions. 9.0.5 and 8.8.4 below come from the GitHub
#    advisory text of 17 Nov. Check `fix_versions`, `latest_fix`,
#    `fixes`, `affected` and the last History line against the real release.
# 2. Publish GHSA-fm36-5jx4-vwhf on GitHub. Its form says affected "< 9.0.4",
#    but the fix commit (985dc9b4, 17 Nov 2026) came after the v9.0.4 tag, so
#    9.0.4 is affected. Correct the range there first.
# 3. When the CVE number arrives: fill in `cve`, rename this file to
#    cve-<year>-<number>.md and add the old URL under `aliases`.
# 4. Set `date` to the publication date, add a History line, set draft: false
#    here and in _index.md.
# 5. Ronald to confirm: the Pro rows in `fixes`, and the workarounds.
# ---------------------------------------------------------------------------
draft: false
date: 2026-11-17

ghsa: "GHSA-fm36-5jx4-vwhf"
cve: ""
severity: "medium"
cvss_score: 6.5
cvss_vector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N"
cwe: "CWE-22"
cwe_name: "Improper Limitation of a Pathname to a Restricted Directory"
component: "Dashboard"

affected:
  - product: "JobRunr and JobRunr Pro"
    versions:
      - "9.0.0 to 9.0.4"
      - "8.8.3 and earlier"

fix_versions: ["9.0.5", "8.8.4"]
latest_fix: "9.0.5"

# One row per version the reader runs, one cell per edition.
# access: free | included | extended | upgrade. `version` is the release that holds the fix.
fixes:
  - runs: "9.x"
    oss: { access: "free", version: "9.0.5" }
    pro: { access: "included", version: "9.0.5" }
  - runs: "8.x"
    oss: { access: "extended", version: "8.8.4" }
    pro: { access: "included", version: "8.8.4" }
  - runs: "7.x and 6.x"
    oss: { access: "extended" }
    pro: { access: "extended" }
  - runs: "5.x and earlier"
    oss: { access: "upgrade" }
    pro: { access: "upgrade" }

fixes_note: "Running JobRunr OSS 8 or earlier? Upgrading to the latest JobRunr 9 release is free and always gets you the fix. If your application cannot move to JobRunr 9 yet, Extended Support gives you the same fix on the version you run today. It is available for the open source edition as well as for JobRunr Pro."

credit: "The issue was found and responsibly reported by [Ashish Vaghela](https://github.com/Ashish-CodeJourney)."

references:
  - label: "GitHub Security Advisory GHSA-fm36-5jx4-vwhf"
    url: "https://github.com/jobrunr/jobrunr/security/advisories/GHSA-fm36-5jx4-vwhf"
  - label: "CVSS v3.1 vector"
    url: "https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator?vector=AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N&version=3.1"
  - label: "CWE-22"
    url: "https://cwe.mitre.org/data/definitions/22.html"

history:
  - date: 2026-11-16
    text: "Vulnerability reported to the JobRunr team."
  - date: 2026-11-17
    text: "Fix released in JobRunr 9.0.5, JobRunr Pro 9.0.5 and JobRunr Pro 8.8.4. Advisory published."
---

## Description

The JobRunr dashboard serves its frontend files from the classpath. `StaticFileHttpHandler` builds the classpath resource name by appending the decoded request path to the dashboard root (`org/jobrunr/dashboard/frontend/build/`) without rejecting `..` segments. A client can therefore read arbitrary resources from the application classpath, for example `service-account.json `.

Who can exploit it depends on the edition:

- **JobRunr OSS:** an unauthenticated client, when the dashboard is publicly available and basic authentication is not configured, which is the default. The dashboard binds to all network interfaces, so it is reachable from the network by default.
- **JobRunr Pro:** only users who are authenticated on the dashboard.

## Details

In `StaticFileHttpHandler`:

- The request path is percent-decoded, so `%2e%2e` becomes `..`.
- `com.sun.net.httpserver.HttpServer` does not normalize the path.
- Any path containing `/static/` is treated as a static file, which skips the file extension allowlist entirely.
- The result is passed to `ClassLoader.getResource`.

When the classpath contains directories (exploded deployments, `WEB-INF/classes`, IDE runs, layered container images), the class loader resolves `..` and returns txt, json, js and image resources outside the dashboard root.

## Impact

Disclosure of txt, json, js and image resources: configuration files with secrets, credentials, keys, and compiled classes.

## Mitigation

Upgrade to the fixed version for your release line. No configuration change is needed after the upgrade.

If you cannot upgrade right away, these reduce the exposure:

- Do not expose the dashboard port to untrusted networks.
- Protect the dashboard with [authentication]({{< ref "guides/authentication/basic-authentication" >}}).