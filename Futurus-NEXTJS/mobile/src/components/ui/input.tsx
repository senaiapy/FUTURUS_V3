/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import * as React from 'react';
import {

  useController,
} from 'react-hook-form';
import {
  I18nManager,
  TextInput as NTextInput,

  StyleSheet,

  TouchableOpacity,
  View,

} from 'react-native';

import { tv } from 'tailwind-variants';

import colors from './colors';
import { Text } from './text';

/**
 * Premium Input Component
 * Follows Figma design with glass morphism effect
 * - 48px minimum height for touch target
 * - Rounded corners (12px radius)
 * - Glass border effect on focus
 */
const inputTv = tv({
  slots: {
    container: 'mb-3',
    label: 'text-text-secondary mb-2 text-base font-medium', // Use color.js 'text.secondary'
    input:
      'font-inter bg-dark-200 placeholder:text-text-muted dark:bg-dark-200 min-h-[48px] rounded-xl border border-white/10 px-4 py-3 text-base text-white dark:text-white', // Dark background for input, placeholder text muted
  },

  variants: {
    focused: {
      true: {
        input: 'bg-dark-100 border-primary-500/50', // Focused with Primary from color.js
      },
    },
    error: {
      true: {
        input: 'border-danger-500',
        label: 'text-danger-400',
      },
    },
    disabled: {
      true: {
        input: 'bg-dark-300 opacity-50',
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
});

export type NInputProps = {
  label?: string;
  disabled?: boolean;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  showPasswordToggle?: boolean;
} & TextInputProps;

export function Input({
  ref,
  ...props
}: NInputProps & { ref?: React.Ref<NTextInput | null> }) {
  const {
    label,
    error,
    testID,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    containerStyle,
    labelStyle,
    showPasswordToggle,
    secureTextEntry: secureTextEntryProp,
    ...inputProps
  } = props;
  const [isFocussed, setIsFocussed] = React.useState(false);
  const [secureTextEntry, setSecureTextEntry]
    = React.useState(secureTextEntryProp);

  const onBlur = React.useCallback(
    (e: any) => {
      setIsFocussed(false);
      onBlurProp?.(e);
    },
    [onBlurProp],
  );

  const onFocus = React.useCallback(
    (e: any) => {
      setIsFocussed(true);
      onFocusProp?.(e);
    },
    [onFocusProp],
  );

  const styles = inputTv({
    error: Boolean(error),
    focused: isFocussed,
    disabled: Boolean(props.disabled),
  });

  return (
    <View className={styles.container()} style={containerStyle}>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={styles.label()}
          style={labelStyle}
        >
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        <NTextInput
          testID={testID}
          ref={ref}
          placeholderTextColor={colors.neutral[500]}
          className={styles.input()}
          onBlur={onBlur}
          onFocus={onFocus}
          {...inputProps}
          secureTextEntry={secureTextEntry}
          style={StyleSheet.flatten([
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            inputProps.style,
            showPasswordToggle && { paddingRight: 60 },
          ])}
        />
        {showPasswordToggle && secureTextEntryProp && (
          <TouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={{
              position: 'absolute',
              right: 16,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ color: colors.primary[400], fontSize: 13, fontWeight: '600' }}>
              {secureTextEntry ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="mt-1.5 text-sm text-danger-400"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

// ControlledInput for react-hook-form
export type ControlledInputProps<
  T extends FieldValues,
> = {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T>;
} & NInputProps;

export function ControlledInput<T extends FieldValues>(
  props: ControlledInputProps<T>,
) {
  const { name, control, rules, ...inputProps } = props;
  const { field, fieldState } = useController({ control, name, rules });

  return (
    <Input
      {...inputProps}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      value={field.value}
      error={fieldState.error?.message}
    />
  );
}
