/**
 * hooks/use-ai-food-append.tsx
 *
 * 【責務】
 * テキストもしくは画像から食品リストを生成し、呼び出し元に渡す AI 追加モーダルを提供する。
 *
 * 【使用箇所】
 * - RecordScreen
 * - HistoryScreen
 * - FoodsScreen
 *
 * 【やらないこと】
 * - 生成結果の保存やドメイン更新
 *
 * 【他ファイルとの関係】
 * - analyze-agent を通じて草稿 Draft を取得する。
 */

import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { analyze } from '@/agents/analyze-agent';
import { AnalyzeDraft } from '@/constants/schema';

type UseAiFoodAppendOptions = {
  locale: string;
  timezone: string;
};

type AiFoodAppendRequest = {
  onDraft: (draft: AnalyzeDraft) => void;
};

export type AiFoodAppendController = {
  open: (request: AiFoodAppendRequest) => void;
  close: () => void;
  modal: JSX.Element;
};

/**
 * テキスト/画像解析を介した食品追加モーダルを提供するカスタムフック。
 * 呼び出し元: 記録/履歴/食品各画面。
 * @param options ロケールとタイムゾーン
 * @returns AiFoodAppendController モーダル制御用の API
 */
export function useAiFoodAppend({ locale, timezone }: UseAiFoodAppendOptions): AiFoodAppendController {
  const [visible, setVisible] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const requestRef = useRef<AiFoodAppendRequest | null>(null);

  /**
   * モーダルを閉じ入力状態をリセットする。
   */
  const close = useCallback(() => {
    setVisible(false);
    setPrompt('');
    setIsProcessing(false);
    requestRef.current = null;
  }, []);

  /**
   * 呼び出し元のコールバックを登録してモーダルを開く。
   * @param request 解析結果の受け取り先
   */
  const open = useCallback((request: AiFoodAppendRequest) => {
    requestRef.current = request;
    setPrompt('');
    setVisible(true);
  }, []);

  /**
   * AI Draft を呼び出し元へ連携する。
   * @param draft AnalyzeAgent が返す Draft
   */
  const deliverDraft = useCallback((draft: AnalyzeDraft) => {
    requestRef.current?.onDraft(draft);
  }, []);

  /**
   * テキスト入力を解析し食品を追加する。
   */
  const handleSubmitText = useCallback(async () => {
    if (!requestRef.current) {
      Alert.alert('追加対象がありません');
      return;
    }
    if (!prompt.trim()) {
      Alert.alert('入力が空です', '追加したい食品の説明を入力してください。');
      return;
    }
    try {
      setIsProcessing(true);
      const draft = await analyze({ type: 'text', prompt, locale, timezone });
      deliverDraft(draft);
      close();
    } catch (error) {
      Alert.alert('追加できませんでした', String((error as Error).message));
    } finally {
      setIsProcessing(false);
    }
  }, [close, deliverDraft, locale, prompt, timezone]);

  /**
   * 画像 Asset を解析する。
   * @param asset ImagePicker の結果
   */
  const analyzeImageAsset = useCallback(
    async (asset: ImagePicker.ImagePickerAsset | undefined) => {
      if (!requestRef.current) {
        Alert.alert('追加対象がありません');
        return;
      }
      if (!asset?.uri) {
        Alert.alert('画像を取得できません', '画像ファイルの URI が無効です。');
        return;
      }
      if (!asset.base64) {
        Alert.alert('画像データが不足しています', '画像の読み込みに失敗しました。');
        return;
      }
      try {
        setIsProcessing(true);
        const draft = await analyze({
          type: 'image',
          uri: asset.uri,
          base64: asset.base64,
          locale,
          timezone,
        });
        deliverDraft(draft);
        close();
      } catch (error) {
        Alert.alert('画像解析に失敗しました', String((error as Error).message));
      } finally {
        setIsProcessing(false);
      }
    },
    [close, deliverDraft, locale, timezone],
  );

  /**
   * カメラを起動し画像解析を行う。
   */
  const handleImageFromCamera = useCallback(async () => {
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
    if (result.canceled) {
      return;
    }
    await analyzeImageAsset(result.assets?.[0]);
  }, [analyzeImageAsset]);

  /**
   * 端末ライブラリから画像を選んで解析する。
   */
  const handleImageFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('写真フォルダの許可が必要です');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) {
      return;
    }
    await analyzeImageAsset(result.assets?.[0]);
  }, [analyzeImageAsset]);

  /**
   * 画像追加の取得方法を選択する。
   */
  const handleImageAction = useCallback(() => {
    Alert.alert('画像で食品を追加', '写真の取得方法を選択してください。', [
      { text: '写真を撮影', onPress: () => void handleImageFromCamera() },
      { text: 'ライブラリから選ぶ', onPress: () => void handleImageFromLibrary() },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  }, [handleImageFromCamera, handleImageFromLibrary]);

  const modal = visible ? (
    <View style={styles.portal} pointerEvents="box-none">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>AIで食品を追加</Text>
          <Text style={styles.caption}>追加したい食品をテキストで説明してください</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="例: サラダチキンと味噌汁を追加"
            value={prompt}
            onChangeText={setPrompt}
          />
          {isProcessing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>解析中...</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <Pressable style={styles.primaryButton} onPress={handleSubmitText} accessibilityRole="button">
                <Text style={styles.primaryLabel}>AI解析で追加</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={handleImageAction} accessibilityRole="button">
                <Text style={styles.secondaryLabel}>写真から追加</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={styles.outlineButton} onPress={close} accessibilityRole="button">
            <Text style={styles.secondaryLabel}>閉じる</Text>
          </Pressable>
        </View>
      </View>
    </View>
  ) : null;

  return { open, close, modal };
}

const styles = StyleSheet.create({
  portal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  caption: {
    color: '#666',
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#666',
  },
  actions: {
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
});
