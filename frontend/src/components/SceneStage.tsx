import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { SceneData, SceneActor, SceneOutcome } from '../api/client';

interface SceneStageProps {
  scene: SceneData | null;
  actors: SceneActor[] | null;
  outcome?: SceneOutcome | null;
  heightClass?: string;
}

type Dir = 'N' | 'S' | 'E' | 'W';

const CENTER = { x: 400, y: 225 };
const ENTRY: Record<Dir, { x: number; y: number }> = {
  N: { x: 400, y: 65 },
  S: { x: 400, y: 385 },
  E: { x: 735, y: 225 },
  W: { x: 65, y: 225 },
};
const SIGN_POS: Record<Dir, { x: number; y: number }> = {
  N: { x: 452, y: 85 },
  S: { x: 452, y: 350 },
  E: { x: 690, y: 195 },
  W: { x: 110, y: 195 },
};

const ARM_RECT: Record<Dir, { x: number; y: number; width: number; height: number }> = {
  N: { x: 355, y: 0, width: 90, height: 225 },
  S: { x: 355, y: 225, width: 90, height: 225 },
  W: { x: 0, y: 180, width: 400, height: 90 },
  E: { x: 400, y: 180, width: 400, height: 90 },
};

function actorColor(actor: SceneActor, isFaulted: boolean): string {
  if (isFaulted) return '#ef4444';
  if (actor.role === 'player') return '#4cd7f6';
  if (actor.kind === 'tram') return '#a78bfa';
  return '#f59e0b';
}

function actorLabel(actor: SceneActor): string {
  if (actor.role === 'player') return 'SIZ';
  if (actor.kind === 'tram') return 'TRM';
  return actor.id.toUpperCase();
}

export const SceneStage: React.FC<SceneStageProps> = ({ scene, actors, outcome, heightClass = 'h-[320px] md:h-[380px]' }) => {
  if (!scene || !actors) {
    return (
      <div className={`relative w-full ${heightClass} rounded-2xl glass-panel border border-white/10 flex items-center justify-center text-slate-500 text-sm font-mono`}>
        Sahna ma'lumoti yo'q
      </div>
    );
  }

  const dirsPresent = scene.roads.map((r) => r.dir);
  const orderIndex = (id: string) => {
    const idx = outcome?.order?.indexOf(id);
    return idx === undefined || idx < 0 ? 0 : idx;
  };

  const isFail = outcome && outcome.status !== 'safe';
  const bannerColor = !outcome ? null : outcome.status === 'safe' ? 'emerald' : 'red';

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden glass-panel border border-[#4cd7f6]/30 hud-corner shadow-[0_0_30px_rgba(8,20,37,0.8)]`}>
      <div className="absolute inset-0 bg-[#06101e]">
        <svg className="w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="roadGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c182b" />
              <stop offset="100%" stopColor="#15243b" />
            </linearGradient>
          </defs>

          {/* Road arms — only directions present in this scene */}
          {dirsPresent.map((dir) => (
            <rect key={dir} {...ARM_RECT[dir as Dir]} fill="url(#roadGrad2)" />
          ))}

          {/* Junction hub */}
          <rect x={355} y={180} width={90} height={90} fill="#182436" />

          {/* Priority sign badges */}
          {scene.signs?.map((sign, i) => {
            const pos = SIGN_POS[sign.at as Dir];
            if (!pos) return null;
            return (
              <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
                <rect x={-16} y={-12} width={32} height={24} rx={5} fill="#081425" stroke="#4cd7f6" strokeWidth={1.5} opacity={0.9} />
                <text x={0} y={5} textAnchor="middle" fill="#4cd7f6" fontSize={11} fontWeight="bold" fontFamily="monospace">
                  {sign.code}
                </text>
              </g>
            );
          })}

          {/* Actors */}
          {actors.map((actor) => {
            const fromDir = actor.from as Dir;
            const toDir = actor.to as Dir;
            const entry = ENTRY[fromDir] || CENTER;
            const isFaultedActor = isFail && actor.role === 'player';
            const color = actorColor(actor, !!isFaultedActor);
            const label = actorLabel(actor);

            let target = entry;
            let repeatCount: string | number = 'indefinite';
            let dur = '1.8s';

            if (outcome) {
              if (isFaultedActor) {
                // The at-fault driver only makes it to the junction before the collision.
                target = outcome.collideWith ? CENTER : entry;
                repeatCount = '1';
              } else {
                target = ENTRY[toDir] || CENTER;
              }
            }

            const delay = outcome && outcome.status === 'safe' ? orderIndex(actor.id) * 0.7 : 0;

            return (
              <g key={actor.id}>
                <rect
                  x={entry.x - 15}
                  y={entry.y - 15}
                  width={30}
                  height={30}
                  rx={7}
                  fill={color}
                  stroke="#081425"
                  strokeWidth={2}
                  opacity={isFail && !isFaultedActor ? 0.9 : 1}
                >
                  {outcome && (
                    <>
                      <animate attributeName="x" from={entry.x - 15} to={target.x - 15} dur={dur} begin={`${delay}s`} repeatCount={repeatCount} fill="freeze" />
                      <animate attributeName="y" from={entry.y - 15} to={target.y - 15} dur={dur} begin={`${delay}s`} repeatCount={repeatCount} fill="freeze" />
                    </>
                  )}
                </rect>
                <text
                  x={entry.x}
                  y={entry.y + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#081425"
                  pointerEvents="none"
                >
                  {label}
                  {outcome && (
                    <>
                      <animate attributeName="x" from={entry.x} to={target.x} dur={dur} begin={`${delay}s`} repeatCount={repeatCount} fill="freeze" />
                      <animate attributeName="y" from={entry.y + 4} to={target.y + 4} dur={dur} begin={`${delay}s`} repeatCount={repeatCount} fill="freeze" />
                    </>
                  )}
                </text>
                {!outcome && (
                  <circle cx={entry.x} cy={entry.y} r={22} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5}>
                    <animate attributeName="r" values="18;24;18" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                )}
                {isFaultedActor && outcome?.collideWith && (
                  <circle cx={CENTER.x} cy={CENTER.y} r={4} fill="#ef4444">
                    <animate attributeName="r" from={4} to={40} dur="0.6s" begin={`${dur.replace('s', '')}s`} fill="freeze" />
                    <animate attributeName="opacity" from={0.9} to={0} dur="0.6s" begin={`${dur.replace('s', '')}s`} fill="freeze" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Outcome banner */}
      {bannerColor && (
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border shadow-lg backdrop-blur-md ${
              bannerColor === 'emerald'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/80 border-red-500/50 text-red-300'
            }`}
          >
            {bannerColor === 'emerald' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>TO'G'RI — XAVFSIZ O'TISH</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>XATO — {outcome?.status === 'collision' ? 'TO\'QNASHUV' : 'USTUNLIK BUZILDI'}</span>
              </>
            )}
          </span>
        </div>
      )}

      {!outcome && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-[#081425]/80 border border-[#4cd7f6]/30 text-[#4cd7f6] text-xs font-mono font-bold backdrop-blur-md">
          KIM BIRINCHI O'TADI?
        </div>
      )}
    </div>
  );
};
