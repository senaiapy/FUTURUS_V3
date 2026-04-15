/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { PressableProps, View } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import * as React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { tv } from 'tailwind-variants';

/**
 * Premium Button Component
 * Follows Figma design with OLED optimization
 * - 48px minimum touch target (Android guideline)
 * - Rounded corners (16px radius)
 * - Glass morphism for secondary variants
 */
const button = tv({
  slots: {
    container: 'my-2 flex flex-row items-center justify-center rounded-2xl px-6',
    label: 'font-inter text-base font-semibold tracking-wide',
    indicator: 'h-6',
  },

  variants: {
    variant: {
      // Primary - Solid indigo/purple gradient feel
      default: {
        container: 'bg-primary-500 active:bg-primary-600',
        label: 'text-white',
        indicator: 'text-white',
      },
      // Secondary - Glass morphism effect
      secondary: {
        container: 'bg-dark-200 active:bg-dark-100 border border-white/10',
        label: 'text-white',
        indicator: 'text-white',
      },
      // Outline - Transparent with border
      outline: {
        container: 'border-2 border-primary-500 bg-transparent active:bg-primary-500/10',
        label: 'text-primary-400 dark:text-primary-300',
        indicator: 'text-primary-400 dark:text-primary-300',
      },
      // Success - Green variant
      success: {
        container: 'bg-success-500 active:bg-success-600',
        label: 'text-white',
        indicator: 'text-white',
      },
      // Destructive - Rose red
      destructive: {
        container: 'bg-danger-500 active:bg-danger-600',
        label: 'text-white',
        indicator: 'text-white',
      },
      // Ghost - Minimal, no background
      ghost: {
        container: 'bg-transparent active:bg-white/5',
        label: 'text-neutral-200 dark:text-neutral-200',
        indicator: 'text-neutral-200',
      },
      // Link - Text button with underline
      link: {
        container: 'bg-transparent px-2',
        label: 'text-primary-400 underline',
        indicator: 'text-primary-400',
      },
      // Premium - Gradient-like elevated look
      premium: {
        container: 'border border-primary-400/30 bg-primary-600 active:bg-primary-700',
        label: 'font-bold text-white',
        indicator: 'text-white',
      },
    },
    size: {
      // Small - minimum touch area maintained
      sm: {
        container: 'h-11 px-4',
        label: 'text-sm',
        indicator: 'h-4',
      },
      // Default - 48px (Android recommended)
      default: {
        container: 'h-12 px-6',
        label: 'text-base',
      },
      // Large - prominent CTA
      lg: {
        container: 'h-14 px-8',
        label: 'text-lg',
      },
      // Extra large - hero buttons
      xl: {
        container: 'h-15 px-10',
        label: 'text-xl',
      },
      // Icon only
      icon: {
        container: 'h-12 w-12 px-0',
      },
    },
    disabled: {
      true: {
        container: 'bg-neutral-800 opacity-50',
        label: 'text-neutral-500',
        indicator: 'text-neutral-500',
      },
    },
    fullWidth: {
      true: {
        container: '',
      },
      false: {
        container: 'self-center',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    disabled: false,
    fullWidth: true,
    size: 'default',
  },
});

type ButtonVariants = VariantProps<typeof button>;
type Props = {
  label?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
} & ButtonVariants & Omit<PressableProps, 'disabled'>;

export function Button({
  ref,
  label: text,
  loading = false,
  variant = 'default',
  disabled = false,
  size = 'default',
  className = '',
  testID,
  textClassName = '',
  ...props
}: Props & { ref?: React.RefObject<View | null> }) {
  const styles = React.useMemo(
    () => button({ variant, disabled, size }),
    [variant, disabled, size],
  );

  return (
    <Pressable
      disabled={disabled || loading}
      className={styles.container({ className })}
      {...props}
      ref={ref}
      testID={testID}
    >
      {props.children
        ? (
            props.children
          )
        : (
            <>
              {loading
                ? (
                    <ActivityIndicator
                      size="small"
                      className={styles.indicator()}
                      testID={testID ? `${testID}-activity-indicator` : undefined}
                    />
                  )
                : (
                    <Text
                      testID={testID ? `${testID}-label` : undefined}
                      className={styles.label({ className: textClassName })}
                    >
                      {text}
                    </Text>
                  )}
            </>
          )}
    </Pressable>
  );
}
