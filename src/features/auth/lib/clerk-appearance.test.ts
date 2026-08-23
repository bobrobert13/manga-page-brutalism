import { describe, expect, it } from 'vitest';
import { clerkAppearance } from './clerk-appearance';

describe('clerkAppearance', () => {
  it('exports a non-null appearance object', () => {
    expect(clerkAppearance).toBeDefined();
    expect(typeof clerkAppearance).toBe('object');
  });

  it('has flush elevation', () => {
    expect(clerkAppearance.options?.elevation).toBe('flush');
  });

  it('places social buttons at the bottom', () => {
    expect(clerkAppearance.options?.socialButtonsPlacement).toBe('bottom');
    expect(clerkAppearance.options?.socialButtonsVariant).toBe('blockButton');
  });

  it('defines brand color variables', () => {
    const vars = clerkAppearance.variables;
    expect(vars).toBeDefined();
    expect(vars?.colorPrimary).toBe('#E63946');
    expect(vars?.colorBackground).toBe('#F2EDE4');
    expect(vars?.colorText).toBe('#0A0A0A');
    expect(vars?.borderRadius).toBe('0');
  });

  it('provides font family tokens', () => {
    const vars = clerkAppearance.variables;
    expect(vars?.fontFamily).toContain('Inter');
    expect(vars?.fontFamilyButtons).toContain('Archivo Black');
  });

  it('includes all required element categories', () => {
    const elements = clerkAppearance.elements;
    expect(elements).toBeDefined();

    // Core form elements
    expect(elements?.cardBox).toBeDefined();
    expect(elements?.formButtonPrimary).toBeDefined();
    expect(elements?.formFieldInput).toBeDefined();
    expect(elements?.formFieldLabel).toBeDefined();

    // Social buttons
    expect(elements?.socialButtonsBlockButton).toBeDefined();
    expect(elements?.socialButtonsBlockButtonText).toBeDefined();

    // OTP
    expect(elements?.otpCodeFieldInput).toBeDefined();

    // User button
    expect(elements?.userButtonPopoverCard).toBeDefined();
    expect(elements?.avatarBox).toBeDefined();

    // Footer
    expect(elements?.footerActionLink).toBeDefined();
  });

  it('primary button uses brutalist box-shadow', () => {
    const btn = clerkAppearance.elements?.formButtonPrimary;
    expect(btn).toBeDefined();
    expect(btn?.boxShadow).toContain('6px');
    expect(btn?.borderRadius).toBe('0');
  });

  it('input fields have zero border-radius and brutal border', () => {
    const input = clerkAppearance.elements?.formFieldInput;
    expect(input).toBeDefined();
    expect(input?.borderRadius).toBe('0');
    expect(input?.border).toContain('3px solid');
  });

  it('hides logo and header titles', () => {
    const elements = clerkAppearance.elements;
    expect(elements?.logoBox?.display).toBe('none');
    expect(elements?.headerTitle?.display).toBe('none');
    expect(elements?.headerSubtitle?.display).toBe('none');
  });
});
