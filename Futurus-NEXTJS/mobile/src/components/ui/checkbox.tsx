import type { PressableProps } from 'react-native';
import { MotiView } from 'moti';
import * as React from 'react';
import { useCallback } from 'react';
import {
  I18nManager,
  Pressable,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import colors from '@/components/ui/colors';

import { Text } from './text';

/**
 * Premium Checkbox, Radio & Switch Components
 * Based on Figma design with OLED optimization
 *
 * Uses Indigo primary color (#6366F1) for active states
 */

const SIZE = 22;
const WIDTH = 52;
const HEIGHT = 30;
const THUMB_HEIGHT = 24;
const THUMB_WIDTH = 24;
const THUMB_OFFSET = 3;

// Theme colors
const THEME = {
  primary: colors.primary[500], // #6366F1
  primaryLight: colors.primary[400], // #818CF8
  inactive: colors.dark[600], // #757575
  surface: colors.dark[200], // #1E1E1E
  textPrimary: colors.text.primary, // #E8E8E8
};

export type RootProps = {
  onChange: (checked: boolean) => void;
  checked?: boolean;
  className?: string;
  accessibilityLabel: string;
} & Omit<PressableProps, 'onPress'>;

export type IconProps = {
  checked: boolean;
};

export function Root({
  checked = false,
  children,
  onChange,
  disabled,
  className = '',
  ...props
}: RootProps) {
  const handleChange = useCallback(() => {
    onChange(!checked);
  }, [onChange, checked]);

  return (
    <Pressable
      onPress={handleChange}
      className={`flex-row items-center ${className} ${
        disabled ? 'opacity-50' : ''
      }`}
      accessibilityState={{ checked }}
      disabled={disabled}
      {...props}
    >
      {children}
    </Pressable>
  );
}

type LabelProps = {
  text: string;
  className?: string;
  testID?: string;
};

function Label({ text, testID, className = '' }: LabelProps) {
  return (
    <Text testID={testID} className={`${className} pl-3 text-neutral-200`}>
      {text}
    </Text>
  );
}

export function CheckboxIcon({ checked = false }: IconProps) {
  const color = checked ? THEME.primary : THEME.inactive;
  return (
    <MotiView
      style={{
        height: SIZE,
        width: SIZE,
        borderColor: color,
        borderRadius: 6,
      }}
      className="items-center justify-center border-2"
      from={{ backgroundColor: 'transparent', borderColor: THEME.inactive }}
      animate={{
        backgroundColor: checked ? color : 'transparent',
        borderColor: color,
      }}
      transition={{
        backgroundColor: { type: 'timing', duration: 150 },
        borderColor: { type: 'timing', duration: 150 },
      }}
    >
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: checked ? 1 : 0 }}
        transition={{ opacity: { type: 'timing', duration: 100 } }}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="m16.726 7-.64.633c-2.207 2.212-3.878 4.047-5.955 6.158l-2.28-1.928-.69-.584L6 12.66l.683.577 2.928 2.477.633.535.591-.584c2.421-2.426 4.148-4.367 6.532-6.756l.633-.64L16.726 7Z"
            fill="#fff"
          />
        </Svg>
      </MotiView>
    </MotiView>
  );
}

function CheckboxRoot({ checked = false, children, ...props }: RootProps) {
  return (
    <Root checked={checked} accessibilityRole="checkbox" {...props}>
      {children}
    </Root>
  );
}

function CheckboxBase({
  checked = false,
  testID,
  label,
  ...props
}: RootProps & { label?: string }) {
  return (
    <CheckboxRoot checked={checked} testID={testID} {...props}>
      <CheckboxIcon checked={checked} />
      {label
        ? (
            <Label
              text={label}
              testID={testID ? `${testID}-label` : undefined}
              className="pr-2"
            />
          )
        : null}
    </CheckboxRoot>
  );
}

export const Checkbox = Object.assign(CheckboxBase, {
  Icon: CheckboxIcon,
  Root: CheckboxRoot,
  Label,
});

export function RadioIcon({ checked = false }: IconProps) {
  const color = checked ? THEME.primary : THEME.inactive;
  return (
    <MotiView
      style={{
        height: SIZE,
        width: SIZE,
        borderColor: color,
        borderRadius: SIZE / 2,
      }}
      className="items-center justify-center border-2 bg-transparent"
      from={{ borderColor: THEME.inactive }}
      animate={{
        borderColor: color,
      }}
      transition={{ borderColor: { duration: 150, type: 'timing' } }}
    >
      <MotiView
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: THEME.primary,
        }}
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
        transition={{
          opacity: { duration: 100, type: 'timing' },
          scale: { type: 'spring', damping: 15 },
        }}
      />
    </MotiView>
  );
}

function RadioRoot({ checked = false, children, ...props }: RootProps) {
  return (
    <Root checked={checked} accessibilityRole="radio" {...props}>
      {children}
    </Root>
  );
}

function RadioBase({
  checked = false,
  testID,
  label,
  ...props
}: RootProps & { label?: string }) {
  return (
    <RadioRoot checked={checked} testID={testID} {...props}>
      <RadioIcon checked={checked} />
      {label
        ? (
            <Label text={label} testID={testID ? `${testID}-label` : undefined} />
          )
        : null}
    </RadioRoot>
  );
}

export const Radio = Object.assign(RadioBase, {
  Icon: RadioIcon,
  Root: RadioRoot,
  Label,
});

export function SwitchIcon({ checked = false }: IconProps) {
  const translateX = checked
    ? THUMB_OFFSET
    : WIDTH - THUMB_WIDTH - THUMB_OFFSET;

  const backgroundColor = checked ? THEME.primary : THEME.inactive;

  return (
    <View style={{ width: WIDTH, justifyContent: 'center' }}>
      <MotiView
        style={{
          width: WIDTH,
          height: HEIGHT,
          borderRadius: HEIGHT / 2,
          overflow: 'hidden',
        }}
        from={{ backgroundColor: THEME.inactive }}
        animate={{ backgroundColor }}
        transition={{ backgroundColor: { type: 'timing', duration: 200 } }}
      />
      <MotiView
        style={{
          height: THUMB_HEIGHT,
          width: THUMB_WIDTH,
          position: 'absolute',
          backgroundColor: 'white',
          borderRadius: THUMB_HEIGHT / 2,
          right: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 3,
        }}
        animate={{
          translateX: I18nManager.isRTL ? translateX : -translateX,
        }}
        transition={{
          translateX: { type: 'spring', damping: 15, stiffness: 120 },
        }}
      />
    </View>
  );
}

function SwitchRoot({ checked = false, children, ...props }: RootProps) {
  return (
    <Root checked={checked} accessibilityRole="switch" {...props}>
      {children}
    </Root>
  );
}

function SwitchBase({
  checked = false,
  testID,
  label,
  ...props
}: RootProps & { label?: string }) {
  return (
    <SwitchRoot checked={checked} testID={testID} {...props}>
      <SwitchIcon checked={checked} />
      {label
        ? (
            <Label text={label} testID={testID ? `${testID}-label` : undefined} />
          )
        : null}
    </SwitchRoot>
  );
}

export const Switch = Object.assign(SwitchBase, {
  Icon: SwitchIcon,
  Root: SwitchRoot,
  Label,
});
