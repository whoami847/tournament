'use client';

import { type ReactNode } from 'react';

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

export function FirebaseEnvValidator({ children }: { children: ReactNode }) {
  // In a Next.js client component, process.env is a static object.
  // We check for the keys here. An empty string is also considered missing.
  const missingVars = REQUIRED_ENV_VARS.filter(
    (varName) => !process.env[varName as keyof typeof process.env]
  );

  if (missingVars.length > 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <div className="max-w-2xl rounded-lg border border-destructive bg-card p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="mt-4 text-foreground">
            Your Firebase environment variables are not set up correctly. This application cannot run without them.
          </p>
          <p className="mt-2 text-muted-foreground">
            Please check your Vercel project settings and ensure all required Firebase variables are added. Refer to the <code>DEPLOYMENT_GUIDE.md</code> file for instructions.
          </p>
          <div className="mt-6 text-left">
            <h2 className="font-semibold text-foreground">Missing Variables:</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-sm text-destructive">
              {missingVars.map((varName) => (
                <li key={varName}>{varName}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
