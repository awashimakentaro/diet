/**
 * features/foods/components/food-filter-toolbar.tsx
 *
 * 【責務】
 * 食品タブの検索欄と追加ボタンをまとめて表示する。
 *
 * 【使用箇所】
 * - FoodsScreen
 *
 * 【やらないこと】
 * - データ取得
 *
 * 【他ファイルとの関係】
 * - useFoodsScreen から受け取った値を表示するだけ。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type FoodFilterToolbarProps = {
  keyword: string;
  onChangeKeyword: (value: string) => void;
  onPressAdd: () => void;
};

/**
 * 検索 + フィルター UI。
 * 呼び出し元: FoodsScreen。
 */
export function FoodFilterToolbar({ keyword, onChangeKeyword, onPressAdd }: FoodFilterToolbarProps) {
 return (
    <View>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={18} color="#99a1af" />
          <TextInput
            style={styles.searchInput}
            placeholder="食品名を検索"
            placeholderTextColor="#99a1af"
            value={keyword}
            onChangeText={onChangeKeyword}
          />
        </View>
        <Pressable style={styles.primaryButton} onPress={onPressAdd} accessibilityRole="button">
          <Text style={styles.primaryLabel}>追加</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#101828',
  },
  primaryButton: {
    backgroundColor: '#155dfc',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 16,
    shadowColor: '#dbeafe',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
