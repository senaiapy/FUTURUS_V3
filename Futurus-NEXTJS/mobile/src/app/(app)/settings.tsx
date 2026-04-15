import Env from '@env';
import { useUniwind } from 'uniwind';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import {
  colors,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import {
  Instagram,
  Rate,
  Share,
  Support,
  Website,
} from '@/components/ui/icons';
import { useAuth } from '@/lib';

export default function Settings() {
  const signOut = useAuth.use.signOut();
  const { theme: colorScheme } = useUniwind();
  const iconColor = colors.dark[400];
  return (
    <>
      <FocusAwareStatusBar />

      <ScrollView className="bg-neutral-950">
        <View className="flex-1 px-4 pt-16">
          <Text className="mb-6 text-3xl font-bold text-white">Ajustes</Text>
          <ItemsContainer title="Geral">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="Sobre">
            <Item text="Nome do APP" value={Env.NAME} />
            <Item text="Versão" value={Env.VERSION} />
          </ItemsContainer>

          <ItemsContainer title="Apoie-nos">
            <Item
              text="Compartilhar"
              icon={<Share color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="Avaliar"
              icon={<Rate color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="Suporte"
              icon={<Support color={iconColor} />}
              onPress={() => {}}
            />
          </ItemsContainer>

          <ItemsContainer title="Links">
            <Item text="Privacidade" onPress={() => {}} />
            <Item text="Termos" onPress={() => {}} />
            <Item
              text="Instagram"
              icon={<Instagram color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="Website"
              icon={<Website color={iconColor} />}
              onPress={() => {}}
            />
          </ItemsContainer>

          <View className="my-8 mb-16">
            <ItemsContainer>
              <Item
                text="Sair"
                onPress={signOut}
                textClassName="text-red-500"
              />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
