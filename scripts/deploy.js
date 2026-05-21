const { execFileSync } = require("child_process");
const path = require("path");
const dotenv = require("dotenv");

const envFile = process.env.DEPLOY_ENV_FILE || ".env.local";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const command = process.argv[2];

const bucket = process.env.REACT_APP_AUTH_COOKIE_STORAGE_DOMAIN;
const prefixSource = process.env.REACT_APP_PATH_TEXT;

const required = [
  "AWS_PROFILE",
  "CLOUDFRONT_DISTRIBUTION_ID",
];

const missing = [
  ...required.filter((key) => !process.env[key]),
  ...(bucket ? [] : ["REACT_APP_AUTH_COOKIE_STORAGE_DOMAIN"]),
  ...(prefixSource ? [] : ["REACT_APP_PATH_TEXT"]),
];
if (missing.length > 0) {
  console.error(
    `[deploy] Missing env: ${missing.join(", ")}. Loaded file: ${envFile}`
  );
  process.exit(1);
}

const profile = process.env.AWS_PROFILE;
const prefix = prefixSource.replace(/^\/+|\/+$/g, "");
const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const invalidatePath = `/${prefix}/*`;

function runAws(args) {
  console.log(`[deploy] aws ${args.join(" ")}`);
  execFileSync("aws", args, { stdio: "inherit" });
}

if (command === "s3") {
  runAws([
    "--profile",
    profile,
    "s3",
    "sync",
    "build/",
    `s3://${bucket}/${prefix}`,
    "--delete",
  ]);
} else if (command === "invalidate") {
  runAws([
    "--profile",
    profile,
    "cloudfront",
    "create-invalidation",
    "--distribution-id",
    distributionId,
    "--paths",
    invalidatePath,
  ]);
} else {
  console.error("Usage: node scripts/deploy.js <s3|invalidate>");
  process.exit(1);
}
