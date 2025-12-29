/**
 * app/(tabs)/index.tsx
 *
 * 【責務】
 * 記録タブの UI を提供し、サマリー表示から解析・編集・保存までを一貫して実行できるようにする。
 *
 * 【使用箇所】
 * - TabLayout の `index` ルート
 *
 * 【やらないこと】
 * - 永続化やサマリー計算
 *
 * 【他ファイルとの関係】
 * - agents で定義された各 Agent を呼び出す。
 */

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { analyze } from '@/agents/analyze-agent';
import { saveMeal } from '@/agents/save-meal-agent';
import { useDailySummary } from '@/hooks/use-daily-summary';
import { fetchGoal } from '@/agents/goal-agent';
import { fetchNotificationSetting } from '@/agents/notification-agent';
import { SummaryCard } from '@/components/summary-card';
import { FoodItemEditor } from '@/components/food-item-editor';
import { AnalyzeDraft, FoodItem } from '@/constants/schema';
import { calculateMacroFromItems } from '@/constants/schema';
import { getTodayKey } from '@/lib/date';
import { refreshFoodLibrary, toMealDraft } from '@/agents/food-library-agent';
import { syncMealsByDate } from '@/agents/history-agent';
import { consumeDraftInbox } from '@/lib/diet-store';
import { useDietState } from '@/hooks/use-diet-state';

const locale = 'ja-JP';

/**
 * 記録タブのメインコンポーネント。
 * @returns JSX.Element
 */
export default function RecordScreen() {
  const todayKey = getTodayKey();
  const navigation = useNavigation();
  const summary = useDailySummary(todayKey);
  const [inputText, setInputText] = useState('');
  const [drafts, setDrafts] = useState<AnalyzeDraft[]>(() => consumeDraftInbox());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [libraryModalVisible, setLibraryModalVisible] = useState(false);
  const foodLibrary = useDietState((state) => state.foodLibrary);


  useFocusEffect(
    useCallback(() => {
      fetchGoal().catch((error) => console.warn(error));
      fetchNotificationSetting().catch((error) => console.warn(error));
      refreshFoodLibrary().catch((error) => console.warn(error));
      syncMealsByDate(todayKey).catch((error) => console.warn(error));
      const queued = consumeDraftInbox();
      if (queued.length > 0) {
        setDrafts((prev) => [...queued, ...prev]);
      }
    }, [todayKey]),
  );

  const handleAnalyzeText = useCallback(async () => {
    if (!inputText.trim()) {
      Alert.alert('入力が空です', '記録した内容を入力してください。');
      return;
    }
    try {
      setIsAnalyzing(true);
      const draft = await analyze({ type: 'text', prompt: inputText, locale, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      setDrafts((prev) => [draft, ...prev]);
      setInputText('');
    } catch (error) {
      Alert.alert('解析に失敗しました', String((error as Error).message));
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText]);

  const handleAnalyzeImage = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('カメラの許可が必要です');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }
      const asset = result.assets[0];
      setIsAnalyzing(true);
      const draft = await analyze({
        type: 'image',
        uri: asset.uri,
        base64: asset.base64,
        locale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setDrafts((prev) => [draft, ...prev]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSaveDraft = useCallback(
    async (draft: AnalyzeDraft) => {
      try {
        await saveMeal({ draft });
        setDrafts((prev) => prev.filter((item) => item.draftId !== draft.draftId));
        Alert.alert('保存しました', `${draft.menuName} を履歴へ追加しました。`);
      } catch (error) {
        Alert.alert('保存できません', String((error as Error).message));
      }
    },
    [],
  );

  const handleUpdateDraft = useCallback((draftId: string, items: FoodItem[]) => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.draftId === draftId
          ? {
              ...draft,
              items,
              totals: calculateMacroFromItems(items),
            }
          : draft,
      ),
    );
  }, []);

  const handleRemoveDraft = useCallback((draftId: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.draftId !== draftId));
  }, []);

  const libraryEntries = foodLibrary;

  const handleSelectLibraryEntry = useCallback(
    (entryId: string) => {
      try {
        const draft = toMealDraft(entryId);
        setDrafts((prev) => [draft, ...prev]);
        setLibraryModalVisible(false);
      } catch (error) {
        Alert.alert('ライブラリ読込失敗', String((error as Error).message));
      }
    },
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <SummaryCard
        summary={summary}
        actionLabel="目標設定"
        onPressAction={() => navigation.navigate('settings' as never)}
      />

      <View style={styles.inputCard}>
        <Text style={styles.sectionTitle}>テキスト入力</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="例: 朝ごはんにオートミールと卵を食べた"
          value={inputText}
          onChangeText={setInputText}
        />
        <View style={styles.row}>
          <Pressable style={styles.primaryButton} onPress={handleAnalyzeText} disabled={isAnalyzing} accessibilityRole="button">
            <Text style={styles.primaryButtonLabel}>解析する</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleAnalyzeImage} disabled={isAnalyzing} accessibilityRole="button">
            <Text style={styles.secondaryLabel}>画像解析</Text>
          </Pressable>
        </View>
        {isAnalyzing ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>解析中...</Text>
          </View>
        ) : null}
        <Pressable style={styles.linkButton} onPress={() => setLibraryModalVisible(true)}>
          <Text style={styles.linkLabel}>ライブラリから追加</Text>
        </Pressable>
      </View>

      {drafts.map((draft) => (
        <RecordDraftCard
          key={draft.draftId}
          draft={draft}
          onChangeItems={(items) => handleUpdateDraft(draft.draftId, items)}
          onSave={() => handleSaveDraft(draft)}
          onRemove={() => handleRemoveDraft(draft.draftId)}
        />
      ))}

      <Modal visible={libraryModalVisible} animationType="slide" onRequestClose={() => setLibraryModalVisible(false)}>
        <SafeAreaView style={styles.libraryModalSafeArea}>
          <View style={styles.libraryModalContainer}>
            <Text style={styles.modalTitle}>ライブラリから選択</Text>
            <View style={styles.librarySearchRow}>
              <Text style={styles.libraryHint}>保存した食品・メニューから選択できます</Text>
            </View>
            <FlatList
              data={libraryEntries}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.libraryList}
              renderItem={({ item }) => (
                <Pressable style={styles.libraryItem} onPress={() => handleSelectLibraryEntry(item.id)}>
                  <View>
                    <Text style={styles.libraryLabel}>{item.name}</Text>
                    <Text style={styles.libraryMeta}>{item.items.length > 1 ? 'メニュー' : '単品'} / {item.items.length} 品</Text>
                  </View>
                  <Text style={styles.libraryMeta}>追加</Text>
                </Pressable>
              )}
            />
            <Pressable style={styles.secondaryOutlineButton} onPress={() => setLibraryModalVisible(false)}>
              <Text style={styles.secondaryLabel}>閉じる</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

type RecordDraftCardProps = {
  draft: AnalyzeDraft;
  onChangeItems: (items: FoodItem[]) => void;
  onSave: () => void;
  onRemove: () => void;
};

/**
 * Draft を編集・保存するためのカード。
 * 呼び出し元: RecordScreen。
 * @param props Draft とハンドラ
 */
function RecordDraftCard({ draft, onChangeItems, onSave, onRemove }: RecordDraftCardProps) {
  return (
    <View style={styles.draftCard}>
      <View style={styles.draftHeader}>
        <Text style={styles.draftTitle}>{draft.menuName || '新しいメニュー'}</Text>
        <Pressable onPress={onRemove}>
          <Text style={styles.delete}>削除</Text>
        </Pressable>
      </View>
      {draft.warnings.length > 0 ? (
        <View style={styles.warningBox}>
          {draft.warnings.map((warning, index) => (
            <Text key={index} style={styles.warningText}>
              {warning}
            </Text>
          ))}
        </View>
      ) : null}
      <FoodItemEditor items={draft.items} onChange={onChangeItems} />
      <Pressable style={styles.primaryButton} onPress={onSave} accessibilityRole="button">
        <Text style={styles.primaryButtonLabel}>保存</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingTop: 24,
  },
  inputCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryOutlineButton: {
    borderWidth: 1,
    borderColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 8,
  },
  linkLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#666',
  },
  draftCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  draftTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  delete: {
    color: '#f06292',
  },
  warningBox: {
    backgroundColor: '#fff5e1',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  warningText: {
    color: '#b26a00',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  libraryModalSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  libraryModalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  librarySearchRow: {
    marginBottom: 8,
  },
  libraryHint: {
    color: '#666',
  },
  libraryItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libraryList: {
    flexGrow: 1,
  },
  libraryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  libraryMeta: {
    color: '#666',
  },
});
