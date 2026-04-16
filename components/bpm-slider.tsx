import { Colors } from '@/constants/theme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const STEP_WIDTH = 14;
const DIAL_HEIGHT = 56;
const TICK_TALL = 24;
const TICK_MID = 14;
const TICK_SHORT = 8;

interface Props {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  min?: number;
  max?: number;
}

export function BpmSlider({ bpm, onBpmChange, min = 20, max = 300 }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);
  const [sidePadding, setSidePadding] = useState(
    () => Dimensions.get('window').width / 2 - STEP_WIDTH / 2
  );

  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let i = min; i <= max; i++) arr.push(i);
    return arr;
  }, [min, max]);

  useEffect(() => {
    if (!isUserScrolling.current) {
      scrollRef.current?.scrollTo({
        x: (bpm - min) * STEP_WIDTH,
        animated: false,
      });
    }
  }, [bpm, min, sidePadding]);

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      isUserScrolling.current = false;
      const x = e.nativeEvent.contentOffset.x;
      const newBpm = Math.max(min, Math.min(max, min + Math.round(x / STEP_WIDTH)));
      onBpmChange(newBpm);
    },
    [min, max, onBpmChange]
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        setSidePadding(Math.max(0, w / 2 - STEP_WIDTH / 2));
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={STEP_WIDTH}
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={[styles.content, { paddingHorizontal: sidePadding }]}
      >
        {ticks.map((v) => {
          const isTen = v % 10 === 0;
          const isFive = v % 5 === 0;
          const tickH = isTen ? TICK_TALL : isFive ? TICK_MID : TICK_SHORT;
          const tickOpacity = isTen ? 1 : isFive ? 0.55 : 0.3;
          return (
            <View key={v} style={styles.tickItem}>
              {isTen && <View style={styles.isTenContainer}>
                <Text style={styles.label}>{v}</Text>
              </View>}
              <View style={[styles.tick, { height: tickH, opacity: tickOpacity }]} />
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.indicator} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: DIAL_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    height: DIAL_HEIGHT,
  },
  tickItem: {
    width: STEP_WIDTH,
    height: DIAL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    overflow: 'visible',
  },
  tick: {
    width: 1.5,
    borderRadius: 1,
    backgroundColor: Colors.dark.icon,
  },
  isTenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    flexDirection: 'column',
    position: 'absolute',
    top: 12,
    left: -10,
    right: -10,
  },
  label: {
    zIndex: 10,
    overflow: 'visible',
    fontSize: 10,
    color: Colors.dark.icon,
    fontVariant: ['tabular-nums'],
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: Colors.dark.tint,
  },
});
