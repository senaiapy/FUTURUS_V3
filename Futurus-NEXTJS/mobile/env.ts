import z from 'zod';
import packageJSON from './package.json';

// Single unified environment schema
const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']),
  EXPO_PUBLIC_NAME: z.string(),
  EXPO_PUBLIC_SCHEME: z.string(),
  EXPO_PUBLIC_BUNDLE_ID: z.string(),
  EXPO_PUBLIC_PACKAGE: z.string(),
  EXPO_PUBLIC_VERSION: z.string(),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_API: z.string().optional(),
  EXPO_PUBLIC_ASSOCIATED_DOMAIN: z.string().url().optional(),
  EXPO_PUBLIC_VAR_NUMBER: z.number(),
  EXPO_PUBLIC_VAR_BOOL: z.boolean(),

  // Only available for app.config.ts usage
  APP_BUILD_ONLY_VAR: z.string().optional(),

  // Legacy variables used in the app logic
  API_URL: z.string().url(),
  IMAGE_BASE_URL: z.string().url(),
  SIMPLE_API_URL: z.string().url(),
  NEXT_PUBLIC_ZAP_PHONE: z.string(),
  NAME: z.string(),
  VERSION: z.string(),
});

// Config records per environment
const EXPO_PUBLIC_APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV
  ?? 'development') as z.infer<typeof envSchema>['EXPO_PUBLIC_APP_ENV'];

const BUNDLE_IDS = {
  development: 'com.futurus.development',
  preview: 'com.futurus.preview',
  production: 'com.futurus',
} as const;

const PACKAGES = {
  development: 'com.futurus.development',
  preview: 'com.futurus.preview',
  production: 'com.futurus',
} as const;

const SCHEMES = {
  development: 'futurusApp',
  preview: 'futurusApp.preview',
  production: 'futurusApp',
} as const;

const NAME = 'FUTURUS';

// Check if strict validation is required (before prebuild)
const STRICT_ENV_VALIDATION = process.env.STRICT_ENV_VALIDATION === '1';

// Build env object
const _env: z.infer<typeof envSchema> = {
  EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_NAME: NAME,
  EXPO_PUBLIC_SCHEME: SCHEMES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_BUNDLE_ID: BUNDLE_IDS[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_PACKAGE: PACKAGES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || packageJSON.version,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? '',
  EXPO_PUBLIC_API: process.env.EXPO_PUBLIC_API ?? 'laravel',
  EXPO_PUBLIC_ASSOCIATED_DOMAIN: process.env.EXPO_PUBLIC_ASSOCIATED_DOMAIN,
  EXPO_PUBLIC_VAR_NUMBER: Number(process.env.EXPO_PUBLIC_VAR_NUMBER ?? 0),
  EXPO_PUBLIC_VAR_BOOL: process.env.EXPO_PUBLIC_VAR_BOOL === 'true',
  APP_BUILD_ONLY_VAR: process.env.APP_BUILD_ONLY_VAR,

  // Legacy variables
  API_URL: process.env.API_URL || process.env.EXPO_PUBLIC_API_URL || '',
  IMAGE_BASE_URL: process.env.IMAGE_BASE_URL || '',
  SIMPLE_API_URL: process.env.SIMPLE_API_URL || '',
  NEXT_PUBLIC_ZAP_PHONE: process.env.NEXT_PUBLIC_ZAP_PHONE || '',
  NAME,
  VERSION: process.env.EXPO_PUBLIC_APP_VERSION || packageJSON.version,
};

function getValidatedEnv(env: z.infer<typeof envSchema>) {
  const parsed = envSchema.safeParse(env);

  if (parsed.success === false) {
    const errorMessage
      = `❌ Invalid environment variables:${
        JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
      }\n❌ Missing variables in .env file for APP_ENV=${EXPO_PUBLIC_APP_ENV}`
      + `\n💡 Tip: If you recently updated the .env file, try restarting with -c flag to clear the cache.`;

    if (STRICT_ENV_VALIDATION) {
      console.error(errorMessage);
      throw new Error('Invalid environment variables');
    }
  }
  else {
    console.log('✅ Environment variables validated successfully');
  }

  return parsed.success ? (parsed.data as any) : env;
}

const Env = STRICT_ENV_VALIDATION ? getValidatedEnv(_env) : _env;

export default Env;
