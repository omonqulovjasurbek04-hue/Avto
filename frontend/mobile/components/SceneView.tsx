import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export interface SceneRoad {
  dir: 'N' | 'S' | 'E' | 'W';
  priority: 'main' | 'secondary' | 'equal';
}

export interface SceneSign {
  at: string;
  code: string;
}

export interface SceneActor {
  id: string;
  kind: string;
  role?: string;
  from: string;
  to: string;
}

export interface SceneData {
  type: string;
  roads: SceneRoad[];
  signs?: SceneSign[];
}

export interface SceneOutcome {
  status: 'safe' | 'collision' | 'priority_violation' | 'fail';
  collideWith?: string;
  ruleCode?: string;
  ruleText?: string;
}

interface SceneViewProps {
  scene: SceneData | null;
  actors: SceneActor[] | null;
  outcome?: SceneOutcome | null;
}

type Dir = 'N' | 'S' | 'E' | 'W';

const ENTRY: Record<Dir, { x: number; y: number }> = {
  N: { x: 200, y: 40 },
  S: { x: 200, y: 200 },
  E: { x: 370, y: 120 },
  W: { x: 30, y: 120 },
};

const ARM_RECT: Record<Dir, { x: number; y: number; width: number; height: number }> = {
  N: { x: 175, y: 0, width: 50, height: 120 },
  S: { x: 175, y: 120, width: 50, height: 120 },
  W: { x: 0, y: 95, width: 200, height: 50 },
  E: { x: 200, y: 95, width: 200, height: 50 },
};

function actorColor(actor: SceneActor, isFaulted: boolean): string {
  if (isFaulted) return '#ef4444';
  if (actor.role === 'player') return '#4cd7f6';
  if (actor.kind === 'tram') return '#a78bfa';
  return '#f59e0b';
}

export const SceneView: React.FC<SceneViewProps> = ({ scene, actors, outcome }) => {
  if (!scene || !actors) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Sahna ma'lumoti yo'q</Text>
      </View>
    );
  }

  const dirsPresent = scene.roads.map((r) => r.dir);
  const isFail = !!outcome && outcome.status !== 'safe';

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 400 240">
        {dirsPresent.map((dir) => (
          <Rect key={dir} {...ARM_RECT[dir as Dir]} fill="#15243b" />
        ))}
        <Rect x={175} y={95} width={50} height={50} fill="#1f2e45" />

        {scene.signs?.map((sign, i) => {
          const pos = ENTRY[sign.at as Dir];
          if (!pos) return null;
          return (
            <React.Fragment key={i}>
              <Rect x={pos.x - 14} y={pos.y - 30} width={28} height={18} rx={4} fill="#081425" stroke="#4cd7f6" strokeWidth={1} />
              <SvgText x={pos.x} y={pos.y - 17} fontSize={9} fill="#4cd7f6" textAnchor="middle" fontWeight="bold">
                {sign.code}
              </SvgText>
            </React.Fragment>
          );
        })}

        {actors.map((actor) => {
          const entry = ENTRY[actor.from as Dir] || { x: 200, y: 120 };
          const isFaultedActor = isFail && actor.role === 'player';
          const color = actorColor(actor, isFaultedActor);
          const label = actor.role === 'player' ? 'SIZ' : actor.kind === 'tram' ? 'TRM' : actor.id.toUpperCase();
          return (
            <React.Fragment key={actor.id}>
              <Rect x={entry.x - 13} y={entry.y - 13} width={26} height={26} rx={6} fill={color} stroke="#081425" strokeWidth={2} />
              <SvgText x={entry.x} y={entry.y + 4} fontSize={8} fontWeight="bold" fill="#081425" textAnchor="middle">
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {outcome && (
        <View style={[styles.banner, outcome.status === 'safe' ? styles.bannerSafe : styles.bannerFail]}>
          <Text style={[styles.bannerText, outcome.status === 'safe' ? styles.bannerTextSafe : styles.bannerTextFail]}>
            {outcome.status === 'safe' ? "✅ TO'G'RI — XAVFSIZ O'TISH" : outcome.status === 'collision' ? "❌ TO'QNASHUV" : '❌ USTUNLIK BUZILDI'}
          </Text>
        </View>
      )}
      {!outcome && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>KIM BIRINCHI O'TADI?</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#06101e',
    borderWidth: 1,
    borderColor: 'rgba(76,215,246,0.3)',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  banner: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  bannerSafe: {
    backgroundColor: 'rgba(6,78,59,0.85)',
    borderColor: 'rgba(16,185,129,0.5)',
  },
  bannerFail: {
    backgroundColor: 'rgba(69,10,10,0.85)',
    borderColor: 'rgba(239,68,68,0.5)',
  },
  bannerText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bannerTextSafe: {
    color: '#6ee7b7',
  },
  bannerTextFail: {
    color: '#fca5a5',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(8,20,37,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(76,215,246,0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4cd7f6',
  },
});
