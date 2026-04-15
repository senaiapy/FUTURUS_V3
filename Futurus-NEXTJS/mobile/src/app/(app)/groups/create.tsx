import type { ProposedMarket } from '@/api/groups';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Globe,
  ImageIcon,
  LockKeyhole,
  Upload,
} from 'lucide-react-native';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {

  useCategories,
  useCreateGroup,
  useSubcategories,
  useUploadMarketImage,
} from '@/api/groups';
import { useMarkets } from '@/api/markets';
import { Modal, Text, useModal } from '@/components/ui';
import { CDP, THEME } from '@/lib/theme';

type MarketMode = 'select' | 'create';

export default function CreateGroupScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createGroupMutation = useCreateGroup();
  const uploadImageMutation = useUploadMarketImage();
  const { data: marketsResponse } = useMarkets({ variables: { status: 'OPEN' } });
  const markets = marketsResponse?.data || [];

  // Market mode
  const [marketMode, setMarketMode] = useState<MarketMode>('select');

  // Group form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [minContribution, setMinContribution] = useState('10');
  const [maxContribution, setMaxContribution] = useState('');
  const [targetLiquidity, setTargetLiquidity] = useState('1000');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [managerFee, setManagerFee] = useState('2');
  const [decisionMethod, setDecisionMethod] = useState<'MANAGER' | 'VOTING'>('MANAGER');

  // Proposed market form state
  const [marketQuestion, setMarketQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [marketDescription, setMarketDescription] = useState('');
  const [marketImage, setMarketImage] = useState<string | null>(null);
  const [marketImageUrl, setMarketImageUrl] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [initialYesPool, setInitialYesPool] = useState('100');
  const [initialNoPool, setInitialNoPool] = useState('100');

  // Categories data
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];
  const { data: subcategoriesData } = useSubcategories({
    variables: { categoryId: selectedCategory?.id || 0 },
    enabled: !!selectedCategory?.id,
  });
  const subcategories = subcategoriesData || [];

  // Modals
  const marketPickerModal = useModal();
  const decisionPickerModal = useModal();
  const categoryPickerModal = useModal();
  const subcategoryPickerModal = useModal();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('groups.image_permission_required'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMarketImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'market-image.jpg',
    } as any);

    try {
      const response = await uploadImageMutation.mutateAsync(formData);
      setMarketImageUrl(response.url);
    }
    catch (error) {
      console.error('Failed to upload image:', error);
      Alert.alert(t('common.error'), t('groups.image_upload_failed'));
    }
  };

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('groups.name_required'));
      return;
    }

    if (marketMode === 'select' && !selectedMarket) {
      Alert.alert(t('common.error'), t('groups.market_required'));
      return;
    }

    if (marketMode === 'create') {
      if (!marketQuestion.trim()) {
        Alert.alert(t('common.error'), t('groups.market_question_required'));
        return;
      }
      if (!selectedCategory) {
        Alert.alert(t('common.error'), t('groups.category_required'));
        return;
      }
    }

    if (!targetLiquidity || Number.parseFloat(targetLiquidity) <= 0) {
      Alert.alert(t('common.error'), t('groups.target_required'));
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
        minContribution: Number.parseFloat(minContribution) || 0,
        maxContribution: maxContribution ? Number.parseFloat(maxContribution) : undefined,
        targetLiquidity: Number.parseFloat(targetLiquidity),
        maxParticipants: maxParticipants ? Number.parseInt(maxParticipants) : undefined,
        managerFeePercent: Number.parseFloat(managerFee) || 0,
        decisionMethod,
      };

      if (marketMode === 'select') {
        payload.marketId = selectedMarket.id;
      }
      else {
        const proposedMarket: ProposedMarket = {
          question: marketQuestion.trim(),
          categoryId: selectedCategory.id,
          subcategoryId: selectedSubcategory?.id,
          description: marketDescription.trim() || undefined,
          image: marketImageUrl || undefined,
          endDate: endDate.toISOString(),
          initialYesPool: Number.parseFloat(initialYesPool) || 100,
          initialNoPool: Number.parseFloat(initialNoPool) || 100,
        };
        payload.proposedMarket = proposedMarket;
      }

      const group = await createGroupMutation.mutateAsync(payload);

      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });

      const message
        = marketMode === 'create'
          ? t('groups.created_with_proposed_market')
          : t('groups.created_success');

      Alert.alert(t('common.success'), message, [
        { text: 'OK', onPress: () => router.replace(`/(app)/groups/${group.slug}`) },
      ]);
    }
    catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('groups.create_error'));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('groups.create_group')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('groups.name')}
            {' '}
            *
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder={t('groups.name_placeholder')}
            placeholderTextColor={THEME.textDim}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('groups.description')}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            placeholder={t('groups.description_placeholder')}
            placeholderTextColor={THEME.textDim}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Market Mode Toggle */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('groups.market')}
            {' '}
            *
          </Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, marketMode === 'select' && styles.modeButtonActive]}
              onPress={() => setMarketMode('select')}
            >
              <Text
                style={[styles.modeButtonText, marketMode === 'select' && styles.modeButtonTextActive]}
              >
                {t('groups.select_existing')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, marketMode === 'create' && styles.modeButtonActive]}
              onPress={() => setMarketMode('create')}
            >
              <Text
                style={[styles.modeButtonText, marketMode === 'create' && styles.modeButtonTextActive]}
              >
                {t('groups.create_new_market')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {marketMode === 'select' ? (
          /* Existing Market Selector */
          <View style={styles.inputGroup}>
            <TouchableOpacity style={styles.selector} onPress={() => marketPickerModal.present()}>
              <Text style={selectedMarket ? styles.selectorText : styles.selectorPlaceholder}>
                {selectedMarket ? selectedMarket.title : t('groups.select_market')}
              </Text>
              <ChevronDown size={20} color={THEME.textDim} />
            </TouchableOpacity>
          </View>
        ) : (
          /* New Market Form */
          <View style={styles.proposedMarketForm}>
            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <AlertTriangle size={18} color={THEME.warning} />
              <Text style={styles.warningText}>{t('groups.proposed_market_notice')}</Text>
            </View>

            {/* Market Question */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('groups.market_question')}
                {' '}
                *
              </Text>
              <TextInput
                value={marketQuestion}
                onChangeText={setMarketQuestion}
                style={styles.input}
                placeholder={t('groups.market_question_placeholder')}
                placeholderTextColor={THEME.textDim}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('groups.category')}
                {' '}
                *
              </Text>
              <TouchableOpacity style={styles.selector} onPress={() => categoryPickerModal.present()}>
                <Text style={selectedCategory ? styles.selectorText : styles.selectorPlaceholder}>
                  {selectedCategory ? selectedCategory.name : t('groups.select_category')}
                </Text>
                <ChevronDown size={20} color={THEME.textDim} />
              </TouchableOpacity>
            </View>

            {/* Subcategory */}
            {subcategories.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('groups.subcategory')}</Text>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => subcategoryPickerModal.present()}
                >
                  <Text
                    style={selectedSubcategory ? styles.selectorText : styles.selectorPlaceholder}
                  >
                    {selectedSubcategory
                      ? selectedSubcategory.name
                      : t('groups.select_subcategory')}
                  </Text>
                  <ChevronDown size={20} color={THEME.textDim} />
                </TouchableOpacity>
              </View>
            )}

            {/* Market Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('groups.market_description')}</Text>
              <TextInput
                value={marketDescription}
                onChangeText={setMarketDescription}
                style={[styles.input, styles.textArea]}
                placeholder={t('groups.resolution_criteria')}
                placeholderTextColor={THEME.textDim}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Image Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('groups.market_image')}</Text>
              <View style={styles.imageUploadRow}>
                {marketImage
                  ? (
                      <Image source={{ uri: marketImage }} style={styles.imagePreview} />
                    )
                  : (
                      <View style={styles.imagePlaceholder}>
                        <ImageIcon size={24} color={THEME.textDim} />
                      </View>
                    )}
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handlePickImage}
                  disabled={uploadImageMutation.isPending}
                >
                  {uploadImageMutation.isPending
                    ? (
                        <ActivityIndicator size="small" color={THEME.primary} />
                      )
                    : (
                        <>
                          <Upload size={16} color={THEME.textDim} />
                          <Text style={styles.uploadButtonText}>{t('groups.choose_image')}</Text>
                        </>
                      )}
                </TouchableOpacity>
              </View>
            </View>

            {/* End Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('groups.end_date')}
                {' '}
                *
              </Text>
              <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.selectorText}>{endDate.toLocaleDateString()}</Text>
                <ChevronDown size={20} color={THEME.textDim} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Initial Pools */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('groups.initial_yes_pool')}</Text>
                <View style={styles.inputWithPrefix}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    value={initialYesPool}
                    onChangeText={setInitialYesPool}
                    style={styles.inputNoBorder}
                    placeholder="100"
                    placeholderTextColor={THEME.textDim}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('groups.initial_no_pool')}</Text>
                <View style={styles.inputWithPrefix}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    value={initialNoPool}
                    onChangeText={setInitialNoPool}
                    style={styles.inputNoBorder}
                    placeholder="100"
                    placeholderTextColor={THEME.textDim}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Privacy Toggle */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('groups.visibility')}</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              {isPublic
                ? (
                    <Globe size={20} color={THEME.primary} />
                  )
                : (
                    <LockKeyhole size={20} color={THEME.warning} />
                  )}
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>
                  {isPublic ? t('groups.public') : t('groups.private')}
                </Text>
                <Text style={styles.toggleDescription}>
                  {isPublic ? t('groups.public_desc') : t('groups.private_desc')}
                </Text>
              </View>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: THEME.card, true: THEME.primary }}
              thumbColor={THEME.textMain}
            />
          </View>
        </View>

        {/* Contribution Limits */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('groups.min_contribution')}</Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                value={minContribution}
                onChangeText={setMinContribution}
                style={styles.inputNoBorder}
                placeholder="0"
                placeholderTextColor={THEME.textDim}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('groups.max_contribution')}</Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                value={maxContribution}
                onChangeText={setMaxContribution}
                style={styles.inputNoBorder}
                placeholder={t('groups.no_limit')}
                placeholderTextColor={THEME.textDim}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Target & Max Participants */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>
              {t('groups.target_liquidity')}
              {' '}
              *
            </Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                value={targetLiquidity}
                onChangeText={setTargetLiquidity}
                style={styles.inputNoBorder}
                placeholder="1000"
                placeholderTextColor={THEME.textDim}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('groups.max_participants')}</Text>
            <TextInput
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              style={styles.input}
              placeholder={t('groups.no_limit')}
              placeholderTextColor={THEME.textDim}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Manager Fee */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('groups.manager_fee')}</Text>
          <View style={styles.inputWithSuffix}>
            <TextInput
              value={managerFee}
              onChangeText={setManagerFee}
              style={styles.inputNoBorder}
              placeholder="0"
              placeholderTextColor={THEME.textDim}
              keyboardType="numeric"
            />
            <Text style={styles.suffix}>%</Text>
          </View>
          <Text style={styles.hint}>{t('groups.manager_fee_hint')}</Text>
        </View>

        {/* Decision Method */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('groups.decision_method')}</Text>
          <TouchableOpacity style={styles.selector} onPress={() => decisionPickerModal.present()}>
            <Text style={styles.selectorText}>
              {decisionMethod === 'MANAGER' ? t('groups.manager_decides') : t('groups.member_voting')}
            </Text>
            <ChevronDown size={20} color={THEME.textDim} />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, createGroupMutation.isPending && styles.disabledBtn]}
          onPress={handleCreate}
          disabled={createGroupMutation.isPending}
        >
          {createGroupMutation.isPending
            ? (
                <ActivityIndicator color={THEME.textMain} />
              )
            : (
                <Text style={styles.submitBtnText}>{t('groups.create_group')}</Text>
              )}
        </TouchableOpacity>
      </ScrollView>

      {/* Market Picker Modal */}
      <Modal ref={marketPickerModal.ref} snapPoints={['60%']} title={t('groups.select_market')}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.pickerList}>
            {markets.map((market: any) => (
              <TouchableOpacity
                key={market.id}
                style={[
                  styles.pickerItem,
                  selectedMarket?.id === market.id && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setSelectedMarket(market);
                  marketPickerModal.dismiss();
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedMarket?.id === market.id && styles.pickerItemTextActive,
                  ]}
                  numberOfLines={2}
                >
                  {market.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal ref={categoryPickerModal.ref} snapPoints={['50%']} title={t('groups.select_category')}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.pickerList}>
            {categories.map((category: any) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.pickerItem,
                  selectedCategory?.id === category.id && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  setSelectedSubcategory(null);
                  categoryPickerModal.dismiss();
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedCategory?.id === category.id && styles.pickerItemTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Subcategory Picker Modal */}
      <Modal
        ref={subcategoryPickerModal.ref}
        snapPoints={['50%']}
        title={t('groups.select_subcategory')}
      >
        <View style={styles.modalContent}>
          <ScrollView style={styles.pickerList}>
            {subcategories.map((subcategory: any) => (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.pickerItem,
                  selectedSubcategory?.id === subcategory.id && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setSelectedSubcategory(subcategory);
                  subcategoryPickerModal.dismiss();
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedSubcategory?.id === subcategory.id && styles.pickerItemTextActive,
                  ]}
                >
                  {subcategory.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Decision Method Picker */}
      <Modal ref={decisionPickerModal.ref} snapPoints={['40%']} title={t('groups.decision_method')}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={[styles.pickerItem, decisionMethod === 'MANAGER' && styles.pickerItemActive]}
            onPress={() => {
              setDecisionMethod('MANAGER');
              decisionPickerModal.dismiss();
            }}
          >
            <Text style={styles.pickerItemText}>{t('groups.manager_decides')}</Text>
            <Text style={styles.pickerItemDesc}>{t('groups.manager_decides_desc')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pickerItem, decisionMethod === 'VOTING' && styles.pickerItemActive]}
            onPress={() => {
              setDecisionMethod('VOTING');
              decisionPickerModal.dismiss();
            }}
          >
            <Text style={styles.pickerItemText}>{t('groups.member_voting')}</Text>
            <Text style={styles.pickerItemDesc}>{t('groups.member_voting_desc')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textMain,
    marginLeft: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDim,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: THEME.textMain,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDim,
  },
  modeButtonTextActive: {
    color: THEME.textMain,
  },
  proposedMarketForm: {
    backgroundColor: THEME.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: `${THEME.warning}15`,
    borderWidth: 1,
    borderColor: `${THEME.warning}30`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: THEME.warning,
    lineHeight: 18,
  },
  imageUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imagePreview: {
    width: 80,
    height: 48,
    borderRadius: 8,
    backgroundColor: THEME.card,
  },
  imagePlaceholder: {
    width: 80,
    height: 48,
    borderRadius: 8,
    backgroundColor: THEME.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: THEME.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  uploadButtonText: {
    fontSize: 14,
    color: THEME.textDim,
    fontWeight: '600',
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
    marginRight: 4,
  },
  suffix: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
    marginLeft: 4,
  },
  inputNoBorder: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: THEME.textMain,
  },
  hint: {
    fontSize: 12,
    color: THEME.textDim,
    marginTop: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  selectorText: {
    fontSize: 16,
    color: THEME.textMain,
    flex: 1,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: THEME.textDim,
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textMain,
  },
  toggleDescription: {
    fontSize: 12,
    color: THEME.textDim,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textMain,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  modalContent: {
    padding: 20,
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  pickerItemActive: {
    borderColor: THEME.primary,
    backgroundColor: `${THEME.primary}15`,
  },
  pickerItemText: {
    fontSize: 15,
    color: THEME.textMain,
    fontWeight: '600',
  },
  pickerItemTextActive: {
    color: THEME.primary,
  },
  pickerItemDesc: {
    fontSize: 12,
    color: THEME.textDim,
    marginTop: 4,
  },
});
