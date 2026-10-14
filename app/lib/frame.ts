// Deploy-Version für /frame. FRAME_VERSION überschreibt lokal, um den Auto-Reload zu testen.
export function getFrameVersion() {
  return (
    process.env.FRAME_VERSION ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_DEPLOYMENT_ID ??
    'dev'
  );
}
