import type { SignInProps } from '@clerk/shared/types';

export type ClerkAppearance = NonNullable<SignInProps['appearance']>;

/**
 * Brand constant tokens — used to build the Clerk appearance statically.
 *
 * Theme-aware theming is handled in `src/styles/clerk.css` via stable
 * `.cl-*` class selectors and CSS custom properties. That file flips with
 * `[data-theme]` on <html> automatically, no MutationObserver or re-mount
 * needed. See the JSDoc in clerk.css for details.
 */
const INK = '#0A0A0A';
const PAPER = '#F2EDE4';
const RED = '#E63946';
const RED_HOVER = '#D12F3C';
const YELLOW = '#FFB703';
const GREEN = '#16A34A';
const AMBER = '#D97706';
const FONT_DISPLAY = "'Archivo Black', system-ui, sans-serif";
const FONT_MONO = "'Space Mono', ui-monospace, monospace";
const FONT_BODY = "'Inter', system-ui, sans-serif";
const brutalBorder = `3px solid ${INK}`;

const elements: ClerkAppearance['elements'] = {
  rootBox: { width: '100%', backgroundColor: 'transparent', boxShadow: 'none' },
  cardBox: { width: '100%', backgroundColor: 'transparent', boxShadow: 'none', padding: '0' },
  card: {
    width: '100%',
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    padding: '0',
  },
  main: { animation: 'auth-rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both' },
  headerTitle: { display: 'none' },
  headerSubtitle: { display: 'none' },
  formHeaderTitle: { display: 'none' },
  formFieldRow: { marginBottom: '1rem' },
  formFieldLabelRow: { marginBottom: '0.4rem' },
  formFieldLabel: {
    color: INK,
    fontFamily: FONT_MONO,
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  formFieldInput: {
    width: '100%',
    border: brutalBorder,
    backgroundColor: PAPER,
    borderRadius: '0',
    boxShadow: 'none',
    color: INK,
    fontFamily: FONT_BODY,
    fontSize: '15px',
    padding: '0.75rem 0.9rem',
    transition: 'background 150ms ease, color 150ms ease, box-shadow 150ms ease',
    '&:focus, &:focus-visible': {
      backgroundColor: INK,
      color: PAPER,
      boxShadow: `4px 4px 0 0 ${RED}`,
      outline: 'none',
    },
  },
  formFieldInputGroup: {
    border: brutalBorder,
    borderRadius: '0',
    backgroundColor: PAPER,
    boxShadow: 'none',
    '&:focus-within': {
      backgroundColor: INK,
      color: PAPER,
      boxShadow: `4px 4px 0 0 ${RED}`,
    },
  },
  formFieldInputShowPasswordButton: {
    color: INK,
    fontFamily: FONT_MONO,
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    '&:hover': { color: RED, backgroundColor: 'transparent' },
  },
  formFieldErrorText: {
    color: RED,
    fontFamily: FONT_MONO,
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginTop: '0.35rem',
  },
  formFieldHintText: {
    color: INK,
    opacity: '0.65',
    fontFamily: FONT_MONO,
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginTop: '0.35rem',
  },
  formButtonPrimary: {
    width: '100%',
    backgroundColor: RED,
    color: PAPER,
    border: brutalBorder,
    borderRadius: '0',
    boxShadow: `6px 6px 0 0 ${INK}`,
    fontFamily: FONT_DISPLAY,
    fontSize: '1rem',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    padding: '0.95rem 1rem',
    transition: 'transform 150ms ease, box-shadow 150ms ease, background 150ms ease',
    '&:hover': { backgroundColor: RED_HOVER },
    '&:active': { transform: 'translate(2px, 2px)', boxShadow: 'none' },
    '&:focus-visible': {
      transform: 'translate(2px, 2px)',
      boxShadow: 'none',
      outline: `3px solid ${YELLOW}`,
      outlineOffset: '3px',
    },
  },
  formButtonReset: {
    border: brutalBorder,
    borderRadius: '0',
    backgroundColor: PAPER,
    color: INK,
    fontFamily: FONT_MONO,
    fontWeight: '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    '&:hover': { backgroundColor: INK, color: PAPER },
  },
  formResendCodeLink: {
    color: INK,
    fontFamily: FONT_MONO,
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    '&:hover': { color: RED },
  },
  socialButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(7rem, 1fr))',
    gap: '0.5rem',
  },
  socialButtonsBlockButton: {
    width: '100%',
    border: brutalBorder,
    borderRadius: '0',
    backgroundColor: PAPER,
    color: INK,
    boxShadow: 'none',
    padding: '0.7rem 0.9rem',
    gap: '0.6rem',
    transition:
      'transform 150ms ease, background 150ms ease, color 150ms ease, box-shadow 150ms ease',
    '&:hover': {
      backgroundColor: INK,
      color: PAPER,
      transform: 'translate(-2px, -2px)',
      boxShadow: `4px 4px 0 0 ${RED}`,
    },
    '&:focus-visible': { outline: `3px solid ${YELLOW}`, outlineOffset: '3px' },
  },
  socialButtonsBlockButtonText: {
    fontFamily: FONT_MONO,
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  socialButtonsProviderIcon: { width: '18px', height: '18px' },
  dividerRow: { display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.5rem 0 1rem' },
  dividerLine: { height: '3px', flex: '1', backgroundColor: INK },
  dividerText: {
    color: INK,
    opacity: '0.7',
    fontFamily: FONT_MONO,
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  otpCodeFieldInputsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    width: '100%',
  },
  otpCodeFieldInput: {
    width: '42px',
    height: '50px',
    border: brutalBorder,
    borderRadius: '0',
    backgroundColor: PAPER,
    color: INK,
    fontFamily: FONT_DISPLAY,
    fontSize: '1.4rem',
    padding: '0',
    textAlign: 'center',
    '&:focus': {
      borderColor: RED,
      boxShadow: `4px 4px 0 0 ${RED}`,
      outline: 'none',
    },
  },
  identityPreview: {
    border: brutalBorder,
    borderRadius: '0',
    backgroundColor: PAPER,
    color: INK,
    padding: '0.75rem',
  },
  identityPreviewText: {
    fontFamily: FONT_MONO,
    fontSize: '0.75rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  identityPreviewEditButton: {
    border: brutalBorder,
    borderRadius: '0',
    backgroundColor: YELLOW,
    color: INK,
    fontFamily: FONT_MONO,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  alert: {
    border: `3px solid ${RED}`,
    borderRadius: '0',
    backgroundColor: PAPER,
    color: INK,
    boxShadow: `3px 3px 0 0 ${INK}`,
    padding: '0.75rem 1rem',
  },
  alertText: {
    fontFamily: FONT_MONO,
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  footer: { marginTop: '1.5rem', paddingTop: '1rem', borderTop: '3px solid rgba(10, 10, 10, 0.2)' },
  footerActionText: {
    fontFamily: FONT_MONO,
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  footerActionLink: {
    color: INK,
    fontFamily: FONT_MONO,
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    '&:hover': { color: RED },
  },
  logoBox: { display: 'none' },
  userButtonPopoverCard: {
    border: brutalBorder,
    borderRadius: '0',
    boxShadow: `6px 6px 0 0 ${INK}`,
    backgroundColor: PAPER,
  },
  userPreview: { border: brutalBorder, borderRadius: '0', backgroundColor: PAPER, color: INK },
  avatarBox: { border: brutalBorder, borderRadius: '0', backgroundColor: PAPER },
};

export const clerkAppearance: ClerkAppearance = {
  options: {
    elevation: 'flush',
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'blockButton',
  },
  variables: {
    colorPrimary: RED,
    colorBackground: PAPER,
    colorText: INK,
    colorTextSecondary: INK,
    colorInputBackground: PAPER,
    colorInputText: INK,
    colorDanger: RED,
    colorSuccess: GREEN,
    colorWarning: AMBER,
    colorNeutral: INK,
    borderRadius: '0',
    fontFamily: FONT_BODY,
    fontFamilyButtons: FONT_DISPLAY,
    fontWeight: { normal: 400, medium: 500, bold: 700 },
  },
  elements,
};
