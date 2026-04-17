const appName = process.env.NEXT_PUBLIC_APP_NAME || "Futurus";

export function getAppName(): string {
  return appName;
}

export function getLogoPath(): string {
  const name = appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase();
  return `/images/logo/logo${name}.png`;
}

export function getFullLogoPath(): string {
  const name = appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase();
  return `/images/logo/${name}.png`;
}
