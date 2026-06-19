/**
 * Propential — front-end submission config
 * -----------------------------------------
 * One place to control where the Apply form sends data. apply.js reads this.
 *
 * mode:
 *   "proxy"   (default, recommended) → POST to our own /api/apply serverless
 *             function, which forwards to Formstack with a hidden server-side
 *             token. Configure the token/form id as Vercel env vars (see
 *             api/apply.js and .env.example). Nothing secret lives here.
 *
 *   "direct"  → POST straight to a hosted Formstack form URL from the browser.
 *             Fully static (no /api needed) but no token secrecy. Set
 *             directUrl to your Formstack form's POST/submit endpoint.
 *
 *   "off"     → Don't send anywhere; just show the confirmation screen.
 *             (Same visible behaviour as proxy-before-it's-configured.)
 *
 * The form ALWAYS shows the success confirmation to the applicant, even if the
 * network call fails — submissions should never be lost behind a blank error.
 */
window.PROPENTIAL_FORMS = {
  mode: "proxy",
  proxyUrl: "/api/apply",
  directUrl: "", // e.g. "https://medipay.formstack.com/forms/index.php/.../submit"
  timeoutMs: 12000,
};
