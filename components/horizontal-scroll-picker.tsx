import { useRef, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Colors } from '@/constants/theme';

const ITEM_WIDTH = 56;

interface Props<T> {
  values: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  label?: string;
}

export function HorizontalScrollPicker<T>({ values, selectedIndex, onSelect, label }: Props<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const padding = containerWidth > 0 ? (containerWidth - ITEM_WIDTH) / 2 : 0;

  useEffect(() => {
    if (containerWidth > 0) {
      scrollRef.current?.scrollTo({ x: selectedIndex * ITEM_WIDTH, animated: true });
    }
  }, [selectedIndex, containerWidth]);

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.max(0, Math.min(values.length - 1, Math.round(offsetX / ITEM_WIDTH)));
    onSelect(index);
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: padding }}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
        >
          {values.map((value, index) => (
            <Pressable
              key={index}
              style={styles.item}
              onPress={() => onSelect(index)}
            >
              <Text style={[styles.itemText, index === selectedIndex && styles.itemTextSelected]}>
                {String(value)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {/* Center indicator line */}
        <View style={styles.centerLine} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  label: {
    color: Colors.dark.icon,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  container: {
    height: 44,
    width: '100%',
    justifyContent: 'center',
  },
  item: {
    width: ITEM_WIDTH,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    color: Colors.dark.icon,
    fontSize: 20,
    fontWeight: '300',
  },
  itemTextSelected: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: '600',
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    marginLeft: -ITEM_WIDTH / 2,
    width: ITEM_WIDTH,
    height: 44,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.dark.icon + '40',
  },
});
