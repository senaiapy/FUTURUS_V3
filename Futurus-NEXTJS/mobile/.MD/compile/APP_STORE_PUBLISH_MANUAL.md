# manual: Publicação na Apple App Store (Produção)

Este manual descreve os passos para compilar o app em modo de produção e enviá-lo para a Apple App Store.

---

## 1. Login no EAS CLI

Certifique-se de estar logado na conta correta da Expo:

```bash
npx eas login
npx eas whoami
```

---

## 2. Configuração de Credenciais da Apple

A Expo gerencia automaticamente os certificados e perfis de provisionamento. Para isso, você precisará de uma conta de desenvolvedor da Apple paga.

Para verificar ou criar novas credenciais:

```bash
npx eas credentials
```

_Selecione a plataforma `ios` e o profile `production`._

---

## 3. Compilação para Produção

Existem duas formas de compilar: na nuvem (EAS Cloud) ou localmente.

### Opção A: Compilação na Nuvem (Recomendado)

_Não requer Mac potente, mas depende da fila da Expo._

```bash
pnpm build:production:ios
```

_Este comando executa: `APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios`_

### Opção B: Compilação Local

_Requer Mac com Xcode instalado e ambiente configurado._

```bash
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios --local
```

---

## 4. Envio para o App Store Connect (Submissão)

Após o build completar com sucesso no EAS, você pode enviar o `.ipa` gerado diretamente para a Apple:

```bash
pnpm submit:ios
```

_Siga as instruções para selecionar o build que você acabou de criar._

---

## 5. Passos Manuais no App Store Connect

1. Acesse [App Store Connect](https://appstoreconnect.apple.com/).
2. Vá em **My Apps** e selecione o seu app.
3. Crie uma nova versão (ex: `1.0.9`).
4. Role até a seção **Build** e clique no "+" para selecionar o build que você enviou via EAS.
5. Preencha as informações de marketing (descrição, screenshots, etc.).
6. Clique em **Add for Review** (Enviar para Revisão).

---

## Solução de Problemas Comuns

### Erro de Provisioning Profile no Xcode Local

Se você estiver tentando rodar via Xcode e receber erro de perfil:

1. Abra o arquivo `.xcworkspace` em `ios/`.
2. Vá em **Signing & Capabilities**.
3. Marque "Automatically manage signing".
4. Selecione seu Team (Time de desenvolvimento).

### Erro de Deployment Target

Os erros `The iOS deployment target 'IPHONEOS_DEPLOYMENT_TARGET' is set to 9.0...` foram corrigidos automaticamente via `app.config.ts` e `Podfile`. Se persistirem, rode:

```bash
pnpm erase && pnpm install && pnpm pods
```

---

**Última Atualização**: 16 de Janeiro de 2026
**EAS Project ID**: 762f480f-9c15-44b5-99a6-e228c430a71c
**Bundle ID**: com.futurus
