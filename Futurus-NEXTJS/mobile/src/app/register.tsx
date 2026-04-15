import * as React from 'react';
import { RegisterForm } from '@/components/register-form';
import { FocusAwareStatusBar, View } from '@/components/ui';
import colors from '@/components/ui/colors';

export default function Register() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark[950] }}>
      <FocusAwareStatusBar />
      <RegisterForm />
    </View>
  );
}
