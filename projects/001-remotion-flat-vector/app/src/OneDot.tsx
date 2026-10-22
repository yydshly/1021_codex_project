import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, Audio, cancelRender, continueRender, delayRender, Easing,
  interpolate, spring, staticFile, useCurrentFrame,
} from 'remotion';
import cues from './cues.json';

const C = {
  cream: '#FFF6E9', ink: '#18213C', blue: '#303FE8',
  orange: '#FF6846', yellow: '#FFD34F', mint: '#94E5C5',
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const tween = (f: number, a: number, b: number, x = 0, y = 1) =>
  interpolate(f, [a, b], [x, y], {...clamp, easing: Easing.inOut(Easing.cubic)});
const pop = (f: number, start: number, damping = 13) =>
  spring({frame: Math.max(0, f - start), fps: cues.fps,
    config: {damping, stiffness: 170, mass: 0.8}});
const cue = (label: string) => {
  const event = cues.cues.find((item) => item.label === label);
  if (!event) throw new Error(`Missing cue: ${label}`);
  return event.time * cues.fps;
};
const Text = ({x, y, size = 32, fill = C.ink, weight = 800, children, ...rest}: {
  x: number; y: number; size?: number; fill?: string; weight?: number;
  children: React.ReactNode;
} & React.SVGProps<SVGTextElement>) => (
  <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight}
    fontFamily="MotionSans, sans-serif" {...rest}>{children}</text>
);
const Reveal = ({f, start, x, y, children}: {
  f: number; start: number; x: number; y: number; children: React.ReactNode;
}) => {
  const p = pop(f, start, 19);
  return <g opacity={tween(f, start, start + 7)}
    transform={`translate(${x}, ${y + 65 * (1 - p)})`}>{children}</g>;
};
const Flower = ({x, y, radius, fill, turn = 0}: {
  x: number; y: number; radius: number; fill: string; turn?: number;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${turn})`}>
    {Array.from({length: 8}, (_, i) => (
      <ellipse key={i} cx={0} cy={-radius * 0.5}
        rx={radius * 0.31} ry={radius * 0.52} fill={fill}
        transform={`rotate(${i * 45})`} />
    ))}
    <circle r={radius * 0.38} fill={fill} />
  </g>
);
const Spark = ({x, y, size, fill, turn = 0}: {
  x: number; y: number; size: number; fill: string; turn?: number;
}) => <path transform={`translate(${x} ${y}) rotate(${turn}) scale(${size})`}
  d="M 0 -1 Q .13 -.13 1 0 Q .13 .13 0 1 Q -.13 .13 -1 0 Q -.13 -.13 0 -1"
  fill={fill} />;
const Chrome = ({dark = false, section, f}: {dark?: boolean; section: string; f: number}) => {
  const ink = dark ? C.cream : C.ink;
  return <g>
    <circle cx={108} cy={104} r={12} fill={dark ? C.yellow : C.orange} />
    <Text x={138} y={115} size={30} fill={ink} letterSpacing={3}>ONE DOT</Text>
    <Text x={1810} y={113} size={21} weight={500} fill={ink}
      textAnchor="end" letterSpacing={4}>A LITTLE IDEA. A BIG WORLD.</Text>
    <Text x={100} y={987} size={22} weight={500} fill={ink} letterSpacing={3}>{section}</Text>
    <g transform="translate(1590 974)">
      {Array.from({length: 20}, (_, i) =>
        <rect key={i} x={i * 11} y={0} width={5} height={i % 5 === 0 ? 17 : 9}
          fill={ink} opacity={f / 15 >= i ? 0.8 : 0.2} />)}
    </g>
    <path d="M100 141 H1820" stroke={ink} strokeWidth={2} opacity={0.12} />
  </g>;
};

const Seed = ({f}: {f: number}) => {
  const y = interpolate(f, [0, 5, 18, 30, 42, 47, 60],
    [260, 245, 690, 430, 570, 540, 540], clamp);
  const squash = interpolate(f, [0, 12, 17, 19, 23, 30, 41, 44, 49],
    [1, 0.9, 0.88, 1.16, 0.93, 1, 1.09, 0.97, 1], clamp);
  return <g>
    <rect width={1920} height={1080} fill={C.cream} />
    <Chrome section="01 / 一切，从一点开始" f={f} />
    <Reveal f={f} start={3} x={100} y={374}>
      <Text x={0} y={0} size={29} weight={500} letterSpacing={8}>SMALL BEGINNINGS</Text>
    </Reveal>
    <Reveal f={f} start={6} x={92} y={530}>
      <Text x={0} y={0} size={132}>一点灵感，</Text>
    </Reveal>
    <Reveal f={f} start={13} x={92} y={692}>
      <Text x={0} y={0} size={132}>就够了<tspan fill={C.orange}>。</tspan></Text>
    </Reveal>
    <path d="M1150 790 H1670" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <g opacity={tween(f, 8, 12)} transform={`translate(0 ${100 * (1 - pop(f, 8))})`}>
      <path d="M1190 790 A220 220 0 0 1 1630 790" fill={C.blue} />
      <circle cx={1410} cy={790} r={120} fill={C.cream} />
    </g>
    <g transform={`translate(1410 ${y}) scale(${squash} ${1 / squash})`}>
      <circle r={100} fill={C.orange} />
      <circle cx={-28} cy={-24} r={10} fill={C.cream} />
    </g>
    <g opacity={tween(f, 37, 45)}>
      {[0, 1, 2].map((i) =>
        <path key={i} d="M0 0 v-38" stroke={C.orange} strokeWidth={8} strokeLinecap="round"
          transform={`translate(${1410 + (i - 1) * 140} ${i === 1 ? 345 : 400}) rotate(${(i - 1) * 38})`} />)}
    </g>
    <circle cx={1150} cy={380} r={16 * pop(f, 38)} fill={C.mint} />
    <Spark x={1670} y={590} size={36 * pop(f, 43)} fill={C.yellow} turn={f / 2} />
  </g>;
};

const Grow = ({f}: {f: number}) => {
  const local = f - cue('蓝色圆形扩张');
  const person = pop(local, 12);
  const leaf = pop(local, 25);
  return <g>
    <rect width={1920} height={1080} fill={C.blue} />
    <Chrome dark section="02 / 给想法一点空间" f={f} />
    <Reveal f={local} start={8} x={100} y={360}>
      <Text x={0} y={0} size={29} fill={C.mint} weight={500} letterSpacing={8}>MAKE ROOM TO GROW</Text>
    </Reveal>
    <Reveal f={local} start={12} x={92} y={520}>
      <Text x={0} y={0} size={132} fill={C.cream}>让想法</Text>
    </Reveal>
    <Reveal f={local} start={17} x={92} y={685}>
      <Text x={0} y={0} size={132} fill={C.cream}>开始生长。</Text>
    </Reveal>
    <path d="M1080 860 A370 175 0 0 1 1820 860 Z" fill={C.cream} />
    <g transform={`translate(1280 820) scale(${person})`}>
      <path d="M-65 0 L-48 -160 H52 L85 0" fill={C.ink} />
      <path d="M-100 -124 Q-120 -320 0 -320 Q120 -320 95 -124 Z" fill={C.mint} />
      <rect x={-20} y={-365} width={44} height={68} rx={20} fill={C.orange} />
      <g transform={`rotate(${-4 + Math.sin(local / 14) * 3} 0 -395)`}>
        <circle cy={-400} r={70} fill={C.orange} />
        <path d="M-70 -405 A70 70 0 0 1 68 -415 L0 -430 L-15 -380 Z" fill={C.ink} />
        <circle cx={28} cy={-390} r={5} fill={C.ink} />
        <path d="M20 -364 q15 12 27 -3" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      </g>
      <path d="M-75 -270 Q-150 -200 -105 -150" fill="none" stroke={C.mint} strokeWidth={54} strokeLinecap="round" />
      <g transform={`rotate(${-18 * pop(local, 22) + 6 * Math.sin(local / 7)} 75 -260)`}>
        <path d="M75 -260 Q155 -250 163 -365" fill="none" stroke={C.mint} strokeWidth={50} strokeLinecap="round" />
        <circle cx={163} cy={-368} r={28} fill={C.orange} />
      </g>
      <path d="M-72 0 h-25 M85 0 h25" stroke={C.ink} strokeWidth={26} strokeLinecap="round" />
    </g>
    <path d="M1580 808 Q1520 620 1570 380" fill="none" stroke={C.mint}
      strokeWidth={14} strokeLinecap="round" pathLength={1}
      strokeDasharray={1} strokeDashoffset={1 - tween(local, 16, 35)} />
    <g transform={`translate(1555 650) scale(${leaf})`}>
      <path d="M0 0 Q-180 15 -180 -140 Q-30 -160 0 0" fill={C.mint} />
      <path d="M0 -50 Q5 -200 155 -205 Q185 -60 0 -50" fill={C.yellow} />
    </g>
    <Flower x={1575} y={370} radius={135 * pop(local, 28)} fill={C.orange} turn={local * 0.8} />
    <circle cx={1575} cy={370} r={44 * pop(local, 30)} fill={C.yellow} />
    <Spark x={1755} y={520} size={34 * pop(local, 37)} fill={C.cream} turn={local} />
    <circle cx={1120} cy={300} r={13 * pop(local, 33)} fill={C.yellow} />
  </g>;
};

const Form = ({f}: {f: number}) => {
  const local = f - cue('橙色遮罩');
  const morph = tween(local, 44, 65);
  return <g>
    <rect width={1920} height={1080} fill={C.orange} />
    <Chrome section="03 / 简单形状，无限组合" f={f} />
    <Reveal f={local} start={9} x={96} y={340}>
      <Text x={0} y={0} size={114}>让想法，成形。</Text>
    </Reveal>
    <Reveal f={local} start={16} x={1480} y={304}>
      <Text x={0} y={0} size={24} weight={500} letterSpacing={4}>LESS SHAPE.</Text>
      <Text x={0} y={38} size={24} weight={500} letterSpacing={4}>MORE POSSIBILITY.</Text>
    </Reveal>
    <g transform={`translate(390 620) scale(${pop(local, 15)})`}>
      <circle r={138} fill={C.cream} />
      <circle cx={52 * Math.sin(local / 15)} cy={-22 * Math.sin(local / 12)}
        r={48 + 22 * morph} fill={C.blue} />
      <circle cx={-60} cy={-50} r={15} fill={C.yellow} />
    </g>
    <g transform={`translate(940 620) scale(${pop(local, 30)})`}>
      <path d={`M-155 85 C-155 ${-185 - morph * 20},0 ${-185 - morph * 20},0 0 S155 185,155 -85`}
        fill="none" stroke={C.ink} strokeWidth={60} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tween(local, 29, 42)} />
      <circle cx={155} cy={-85} r={30} fill={C.cream} />
    </g>
    <g transform={`translate(1500 620) rotate(${tween(local, 44, 70, -45, 0)}) scale(${pop(local, 45)})`}>
      <rect x={-145} y={-145} width={290} height={290} rx={24 + 120 * (1 - morph)} fill={C.blue} />
      <Flower x={0} y={0} radius={115} fill={C.mint} turn={local * 1.1} />
      <circle r={34} fill={C.yellow} />
    </g>
    {[{x: 390, word: '点', start: 15}, {x: 940, word: '线', start: 30}, {x: 1500, word: '面', start: 45}].map(item =>
      <g key={item.word} opacity={tween(local, item.start + 5, item.start + 13)}>
        <Text x={item.x} y={858} textAnchor="middle" size={34} weight={600}>{item.word}</Text>
      </g>)}
    <path d="M650 620 h45 m-15 -15 15 15 -15 15 M1200 620 h45 m-15 -15 15 15 -15 15"
      fill="none" stroke={C.ink} strokeWidth={4} opacity={0.4 * tween(local, 35, 48)} />
  </g>;
};

const End = ({f}: {f: number}) => {
  const local = f - cue('片尾揭示');
  const tile = (start: number, x: number, y: number, children: React.ReactNode) =>
    <g transform={`translate(${x} ${y}) scale(${pop(local, start, 16)})`}>{children}</g>;
  return <g>
    <rect width={1920} height={1080} fill={C.cream} />
    <Chrome section="04 / 把灵感，变成下一步" f={f} />
    <Reveal f={local} start={7} x={100} y={350}>
      <Text x={0} y={0} size={29} weight={500} letterSpacing={8}>START SMALL. THINK BIG.</Text>
    </Reveal>
    <Reveal f={local} start={12} x={92} y={505}>
      <Text x={0} y={0} size={125}>从一点，</Text>
    </Reveal>
    <Reveal f={local} start={20} x={92} y={667}>
      <Text x={0} y={0} size={125}>到无限可能<tspan fill={C.orange}>。</tspan></Text>
    </Reveal>
    <Reveal f={local} start={31} x={100} y={776}>
      <Text x={0} y={0} size={31} weight={500} fill={C.blue} letterSpacing={5}>让每一个想法，都动起来。</Text>
    </Reveal>
    {tile(9, 1330, 405, <g>
      <circle r={120} fill={C.blue} />
      <circle r={44} fill={C.cream} />
      <circle cx={84 * Math.cos(local / 40)} cy={84 * Math.sin(local / 40)} r={18} fill={C.yellow} />
    </g>)}
    {tile(13, 1580, 405, <g>
      <rect x={-112} y={-112} width={224} height={224} rx={112} fill={C.mint} />
      <path d="M-112 112 A224 224 0 0 1 112 -112 V112 Z" fill={C.ink} />
      <circle cx={40} cy={40} r={28} fill={C.cream} />
    </g>)}
    {tile(17, 1330, 660, <g>
      <rect x={-112} y={-112} width={224} height={224} rx={26} fill={C.yellow} />
      {[-55, 0, 55].map(y => <path key={y} d={`M-70 ${y + 25} Q0 ${y - 55} 70 ${y + 25}`}
        stroke={C.ink} strokeWidth={15} fill="none" strokeLinecap="round" />)}
    </g>)}
    {tile(21, 1580, 660, <g>
      <Flower x={0} y={0} radius={125} fill={C.orange} turn={-local / 3} />
      <circle r={38} fill={C.cream} />
    </g>)}
    <Spark x={1765} y={280} size={33 * pop(local, 30)} fill={C.blue} turn={local / 2} />
    <circle cx={1185} cy={825} r={16 * pop(local, 35)} fill={C.orange} />
  </g>;
};

export const OneDot: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('Loading bundled OFL font'));
  useEffect(() => {
    const font = new FontFace('MotionSans', `url("${staticFile('MotionSans.ttf')}")`, {weight: '100 900'});
    font.load().then(loaded => {
      document.fonts.add(loaded);
      continueRender(fontHandle);
    }).catch(cancelRender);
  }, [fontHandle]);
  const reveals = [
    {start: cue('蓝色圆形扩张'), x: 1410, y: 540, scene: <Grow f={f} />},
    {start: cue('橙色遮罩'), x: 1575, y: 370, scene: <Form f={f} />},
    {start: cue('片尾揭示'), x: 1500, y: 620, scene: <End f={f} />},
  ];
  return <AbsoluteFill style={{backgroundColor: C.cream}}>
    <Audio src={staticFile('soundtrack.wav')} />
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <Seed f={f} />
      {reveals.map(({start, x, y, scene}, i) => {
        if (f < start) return null;
        return <g key={start}>
          <defs><clipPath id={`wipe-${i}`}>
            <circle cx={x} cy={y} r={tween(f, start, start + 17, 0, 2300)} />
          </clipPath></defs>
          <g clipPath={`url(#wipe-${i})`}>{scene}</g>
        </g>;
      })}
    </svg>
  </AbsoluteFill>;
};
