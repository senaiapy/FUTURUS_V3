/* eslint-disable max-lines-per-function, max-params */
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowLeft, Camera, CheckCircle2, UploadCloud } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSubmitKYC } from '@/api/kyc';
import { FocusAwareStatusBar, Image, Text } from '@/components/ui';
import { CDP } from '@/lib/theme';

type DocType = 'Passport' | 'National ID' | 'Driver License';

export default function KycScreen() {
  const insets = useSafeAreaInsets();
  const { mutate: submitKyc, isPending } = useSubmitKYC();

  const [docType, setDocType] = React.useState<DocType>('National ID');
  const [frontImage, setFrontImage] = React.useState<string | null>(null);
  const [backImage, setBackImage] = React.useState<string | null>(null);
  const [selfieImage, setSelfieImage] = React.useState<string | null>(null);

  const pickImage = async (field: 'front' | 'back' | 'selfie') => {
    // Determine if we should ask for camera or library. For simplicity, we just use library here.
    // In a real advanced UI, you might prompt Camera vs Gallery.
    Alert.alert(
      'Selecionar Imagem',
      'Escolha a origem da foto',
      [
        {
          text: 'Câmera',
          onPress: () => {
            setTimeout(async () => {
              const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
              if (!permissionResult.granted) {
                Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                handleImageResult(field, result.assets[0].uri);
              }
            }, 100);
          },
        },
        {
          text: 'Galeria',
          onPress: () => {
            setTimeout(async () => {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permissionResult.granted) {
                Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                handleImageResult(field, result.assets[0].uri);
              }
            }, 100);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
    );
  };

  const handleImageResult = (field: 'front' | 'back' | 'selfie', uri: string) => {
    if (field === 'front')
      setFrontImage(uri);
    if (field === 'back')
      setBackImage(uri);
    if (field === 'selfie')
      setSelfieImage(uri);
  };

  const handleSubmit = () => {
    if (!frontImage || !backImage || !selfieImage) {
      Alert.alert('Incompleto', 'Por favor, envie todas as três fotos: Frente, Verso e Selfie.');
      return;
    }

    const formData = new FormData();
    formData.append('document_type', docType);

    formData.append('document_front', {
      uri: frontImage,
      name: 'front.jpg',
      type: 'image/jpeg',
    } as any);

    formData.append('document_back', {
      uri: backImage,
      name: 'back.jpg',
      type: 'image/jpeg',
    } as any);

    formData.append('selfie', {
      uri: selfieImage,
      name: 'selfie.jpg',
      type: 'image/jpeg',
    } as any);

    submitKyc(formData, {
      onSuccess: () => {
        Alert.alert('Sucesso!', 'Seus documentos KYC foram enviados para análise.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || 'Falha ao enviar os dados.';
        Alert.alert('Erro', msg);
      },
    });
  };

  const renderDocOption = (type: DocType, label: string) => {
    const isSelected = docType === type;
    return (
      <TouchableOpacity
        style={[styles.docTypeBtn, isSelected && styles.docTypeBtnSelected]}
        onPress={() => setDocType(type)}
        activeOpacity={0.7}
      >
        <Text style={[styles.docTypeText, isSelected && styles.docTypeTextSelected]}>
          {label}
        </Text>
        {isSelected && <CheckCircle2 size={16} color={CDP.bg} />}
      </TouchableOpacity>
    );
  };

  const renderUploadBox = (title: string, subtitle: string, field: 'front' | 'back' | 'selfie', imageUri: string | null) => {
    return (
      <View style={styles.uploadSection}>
        <View style={styles.uploadHeader}>
          <Text style={styles.uploadTitle}>{title}</Text>
          <Text style={styles.uploadSubtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={() => pickImage(field)}
        >
          {imageUri
            ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <View style={styles.imageOverlay}>
                    <CheckCircle2 color={CDP.success} size={32} />
                    <Text style={styles.changeImageText}>Toque para alterar</Text>
                  </View>
                </View>
              )
            : (
                <View style={styles.placeholderContainer}>
                  <View style={styles.iconCircle}>
                    {field === 'selfie' ? <Camera color={CDP.primary} size={28} /> : <UploadCloud color={CDP.primary} size={28} />}
                  </View>
                  <Text style={styles.placeholderText}>
                    {field === 'selfie' ? 'Tirar Selfie' : 'Selecionar Documento'}
                  </Text>
                </View>
              )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={CDP.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificação KYC</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>Complete sua Verificação</Text>
          <Text style={styles.introText}>
            Para garantir a segurança da plataforma e liberar saques, precisamos confirmar sua identidade. Suas informações são criptografadas e mantidas em segurança.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Tipo de Documento</Text>
        <View style={styles.docTypeRow}>
          {renderDocOption('National ID', 'RG / CNH')}
          {renderDocOption('Passport', 'Passaporte')}
        </View>

        {renderUploadBox('Frente do Documento', 'Tire uma foto clara da frente do documento.', 'front', frontImage)}
        {renderUploadBox('Verso do Documento', 'Tire uma foto clara do verso do documento.', 'back', backImage)}
        {renderUploadBox('Selfie com Documento', 'Segure o documento próximo ao seu rosto.', 'selfie', selfieImage)}

        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending
            ? (
                <ActivityIndicator color={CDP.bg} />
              )
            : (
                <Text style={styles.submitText}>Enviar para Análise</Text>
              )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CDP.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: CDP.bg,
    borderBottomWidth: 1,
    borderBottomColor: CDP.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CDP.textPrimary,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  introBox: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
    marginBottom: 30,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CDP.primary,
    marginBottom: 8,
  },
  introText: {
    fontSize: 13,
    color: CDP.textSecondary,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: CDP.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  docTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  docTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: CDP.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CDP.border,
    gap: 8,
  },
  docTypeBtnSelected: {
    backgroundColor: CDP.primary,
    borderColor: CDP.primary,
  },
  docTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: CDP.textSecondary,
  },
  docTypeTextSelected: {
    color: CDP.bg,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadHeader: {
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: CDP.textPrimary,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: CDP.textMuted,
  },
  uploadBox: {
    height: 160,
    backgroundColor: CDP.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CDP.borderSubtle,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CDP.glow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: CDP.primary,
  },
  imageWrapper: {
    flex: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  submitBtn: {
    height: 56,
    backgroundColor: CDP.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: CDP.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '800',
    color: CDP.bg,
    letterSpacing: 0.5,
  },
});
