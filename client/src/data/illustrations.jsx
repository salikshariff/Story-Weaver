/**
 * Hand-crafted SVG illustration library.
 *
 * Nothing here is generated at request time — the server returns a short
 * `scene` string per page, and the compositor (src/lib/sceneMatcher.js) picks
 * one backdrop plus up to two subjects and two props from these tables and
 * layers them into a single SVG. That keeps illustration free, instant and
 * offline, at the cost of a fixed vocabulary.
 *
 * Coordinate contract:
 *   backdrop — drawn in the full 400 × 300 viewBox
 *   subject  — drawn inside a 0 0 120 120 box; the compositor translates/scales
 *   prop     — drawn inside a 0 0 60 60 box; same deal
 *
 * Colors come from CSS custom properties so the art follows the theme.
 */

/* ---------------------------------------------------------------- backdrops */

export const BACKDROPS = {
  forest: {
    keywords: ['forest', 'wood', 'trees', 'jungle'],
    sky: ['#cde8d4', '#8fc9a4'],
    art: (
      <g>
        <ellipse cx="200" cy="268" rx="240" ry="48" fill="#5d9c6f" />
        {[40, 110, 300, 362].map((x, i) => (
          <g key={x} transform={`translate(${x} ${180 - i * 6})`}>
            <rect x="-6" y="40" width="12" height="52" rx="4" fill="#6b4a32" />
            <path d="M0 -24 L34 46 H-34 Z" fill="#3f7d55" />
            <path d="M0 -4 L28 60 H-28 Z" fill="#4d9065" />
          </g>
        ))}
        <circle cx="330" cy="62" r="26" fill="#f7e7a8" opacity="0.85" />
      </g>
    ),
  },
  moon: {
    keywords: ['moon', 'space', 'stars', 'sky', 'night', 'galaxy'],
    sky: ['#1b1f4b', '#3b2d6b'],
    art: (
      <g>
        {[
          [48, 52], [96, 28], [148, 68], [212, 36], [268, 72], [330, 44], [372, 96], [24, 108],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2.6 : 1.6} fill="#fff8e1" opacity="0.9" />
        ))}
        <circle cx="318" cy="84" r="34" fill="#f2efe2" />
        <circle cx="308" cy="76" r="7" fill="#ded9c6" />
        <circle cx="328" cy="96" r="5" fill="#ded9c6" />
        <ellipse cx="200" cy="276" rx="250" ry="56" fill="#6f6a94" />
        <ellipse cx="120" cy="266" rx="34" ry="9" fill="#5e5a82" />
        <ellipse cx="286" cy="282" rx="48" ry="11" fill="#5e5a82" />
      </g>
    ),
  },
  ocean: {
    keywords: ['ocean', 'sea', 'underwater', 'water', 'reef', 'waves'],
    sky: ['#9fd6ee', '#1f6f9e'],
    art: (
      <g>
        <path d="M0 240 Q 60 214 120 240 T 240 240 T 360 240 T 480 240 V300 H0 Z" fill="#b89b6a" />
        {[70, 150, 250, 330].map((x, i) => (
          <path
            key={x}
            d={`M${x} 244 q -10 -42 4 -68 q 14 26 4 68`}
            fill="#2f8f6e"
            opacity={0.7 + i * 0.05}
          />
        ))}
        {[[90, 90], [200, 54], [300, 118], [350, 70]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={5 + (i % 3) * 3} fill="#e6f6ff" opacity="0.5" />
        ))}
      </g>
    ),
  },
  castle: {
    keywords: ['castle', 'tower', 'kingdom', 'fortress', 'palace'],
    sky: ['#f6d9c0', '#e89b7d'],
    art: (
      <g>
        <ellipse cx="200" cy="272" rx="250" ry="44" fill="#7f9d74" />
        <g fill="#8c8aa3">
          <rect x="140" y="140" width="120" height="118" />
          <rect x="108" y="108" width="40" height="150" />
          <rect x="252" y="108" width="40" height="150" />
        </g>
        <g fill="#5f5d78">
          <path d="M108 108 L128 74 L148 108 Z" />
          <path d="M252 108 L272 74 L292 108 Z" />
        </g>
        <rect x="182" y="194" width="36" height="64" rx="18" fill="#4a3b52" />
        {[120, 262].map((x) => (
          <rect key={x} x={x} y="140" width="16" height="22" rx="8" fill="#4a3b52" />
        ))}
      </g>
    ),
  },
  library: {
    keywords: ['library', 'books', 'bookshelf', 'reading room', 'study'],
    sky: ['#f3e3c9', '#d8b98f'],
    art: (
      <g>
        <rect x="0" y="236" width="400" height="64" fill="#8a5f3c" />
        {[20, 250].map((shelfX) => (
          <g key={shelfX} transform={`translate(${shelfX} 60)`}>
            <rect x="0" y="0" width="130" height="176" rx="6" fill="#6f4727" />
            {[12, 70, 128].map((y) => (
              <g key={y}>
                <rect x="8" y={y} width="114" height="8" fill="#53331b" />
                {[10, 26, 40, 58, 74, 92].map((x, i) => (
                  <rect
                    key={x}
                    x={x + 2}
                    y={y - 42 + (i % 3) * 4}
                    width="12"
                    height={42 - (i % 3) * 4}
                    rx="2"
                    fill={['#c8694f', '#4f7fa8', '#c9a227', '#6a9a6a', '#9a6aa8', '#c05f7a'][i]}
                  />
                ))}
              </g>
            ))}
          </g>
        ))}
        <circle cx="200" cy="54" r="20" fill="#f6e3a8" opacity="0.8" />
      </g>
    ),
  },
  mountain: {
    keywords: ['mountain', 'snow', 'peak', 'cliff', 'hill'],
    sky: ['#d6ecf7', '#8fb7d6'],
    art: (
      <g>
        <path d="M-20 270 L110 92 L210 270 Z" fill="#7b8ba3" />
        <path d="M110 92 L156 162 H64 Z" fill="#f4f8fb" />
        <path d="M150 270 L270 118 L420 270 Z" fill="#657489" />
        <path d="M270 118 L310 184 H230 Z" fill="#f4f8fb" />
        <ellipse cx="200" cy="278" rx="250" ry="34" fill="#e9f1f6" />
      </g>
    ),
  },
  desert: {
    keywords: ['desert', 'sand', 'dunes', 'oasis'],
    sky: ['#ffe2b8', '#f6a96b'],
    art: (
      <g>
        <circle cx="300" cy="78" r="30" fill="#ffd27a" />
        <path d="M0 212 Q 100 170 200 212 T 400 206 V300 H0 Z" fill="#e8b876" />
        <path d="M0 252 Q 120 222 240 256 T 400 246 V300 H0 Z" fill="#d49e5c" />
        <g transform="translate(70 196)" fill="#4f8a5e">
          <rect x="-6" y="-44" width="12" height="60" rx="6" />
          <rect x="-28" y="-30" width="12" height="28" rx="6" />
          <rect x="16" y="-38" width="12" height="34" rx="6" />
        </g>
      </g>
    ),
  },
  city: {
    keywords: ['city', 'town', 'street', 'buildings', 'rooftops'],
    sky: ['#ffd9c2', '#6b5b95'],
    art: (
      <g>
        {[
          [10, 150, 56, '#4a4568'], [72, 108, 44, '#3b3756'], [122, 170, 62, '#534e72'],
          [192, 92, 48, '#3b3756'], [246, 148, 58, '#4a4568'], [310, 120, 50, '#453f66'],
          [366, 176, 44, '#534e72'],
        ].map(([x, y, w, fill]) => (
          <g key={x}>
            <rect x={x} y={y} width={w} height={300 - y} fill={fill} />
            {Array.from({ length: Math.floor((280 - y) / 26) }).map((_, row) =>
              [0, 1, 2].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={x + 8 + col * 16}
                  y={y + 12 + row * 26}
                  width="8"
                  height="12"
                  fill={(row + col + x) % 3 === 0 ? '#ffd98a' : '#2c2845'}
                />
              )),
            )}
          </g>
        ))}
        <rect x="0" y="282" width="400" height="18" fill="#2c2845" />
      </g>
    ),
  },
  garden: {
    keywords: ['garden', 'flowers', 'meadow', 'field', 'greenhouse'],
    sky: ['#e8f6d8', '#a9d98c'],
    art: (
      <g>
        <ellipse cx="200" cy="266" rx="250" ry="52" fill="#6fae5e" />
        {[36, 92, 150, 214, 272, 338].map((x, i) => (
          <g key={x} transform={`translate(${x} ${212 + (i % 3) * 10})`}>
            <rect x="-2" y="0" width="4" height="40" fill="#4a8a42" />
            <circle cx="0" cy="-4" r="9" fill={['#e8697d', '#f2b84b', '#b98ad6', '#e8697d', '#f2b84b', '#7fc4e0'][i]} />
            <circle cx="0" cy="-4" r="3.5" fill="#fff4d6" />
          </g>
        ))}
        <circle cx="340" cy="58" r="24" fill="#ffe9a3" />
      </g>
    ),
  },
  attic: {
    keywords: ['attic', 'basement', 'room', 'house', 'indoors', 'bedroom'],
    sky: ['#e2d3c0', '#a98d74'],
    art: (
      <g>
        <path d="M200 30 L390 170 V300 H10 V170 Z" fill="#c4a98c" />
        <path d="M200 30 L390 170 H10 Z" fill="#b2967a" />
        <rect x="150" y="150" width="100" height="78" rx="6" fill="#8fc0dc" />
        <path d="M150 150 H250 M200 150 V228" stroke="#6d5440" strokeWidth="6" />
        <rect x="0" y="262" width="400" height="38" fill="#8a6f55" />
        <g transform="translate(66 206)">
          <rect x="0" y="0" width="64" height="48" rx="4" fill="#8c5f3a" />
          <rect x="0" y="18" width="64" height="8" fill="#6a4529" />
          <circle cx="32" cy="34" r="4" fill="#e8c56a" />
        </g>
      </g>
    ),
  },
  meadow: {
    keywords: ['meadow', 'outside', 'day', 'hill', 'picnic', 'sky'],
    sky: ['#d9efff', '#8fc6ec'],
    art: (
      <g>
        <ellipse cx="200" cy="268" rx="260" ry="56" fill="#7cbf6a" />
        <ellipse cx="86" cy="256" rx="90" ry="26" fill="#6cae5c" />
        <circle cx="328" cy="62" r="26" fill="#ffe9a3" />
        {[[70, 70], [140, 46], [250, 76]].map(([cx, cy], i) => (
          <g key={i} fill="#ffffff" opacity="0.9">
            <ellipse cx={cx} cy={cy} rx="26" ry="14" />
            <ellipse cx={cx + 18} cy={cy + 4} rx="20" ry="11" />
          </g>
        ))}
      </g>
    ),
  },
};

export const DEFAULT_BACKDROP = 'meadow';

/* ----------------------------------------------------------------- subjects */

export const SUBJECTS = {
  dragon: {
    keywords: ['dragon', 'wyvern', 'lizard'],
    art: (
      <g>
        <path d="M30 86 Q 8 78 14 58 Q 30 64 34 76 Z" fill="#4f9a6a" />
        <ellipse cx="62" cy="76" rx="34" ry="24" fill="#5bb07a" />
        <path d="M54 56 Q 70 24 92 40 Q 78 50 76 62 Z" fill="#4f9a6a" />
        <circle cx="92" cy="62" r="18" fill="#5bb07a" />
        <circle cx="98" cy="58" r="3.4" fill="#22303a" />
        <path d="M86 46 L92 34 L97 46 Z" fill="#3c7f55" />
        <path d="M104 70 q 12 2 16 -6" stroke="#e8914f" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M44 96 l8 12 M70 98 l6 12" stroke="#3c7f55" strokeWidth="7" strokeLinecap="round" />
      </g>
    ),
  },
  child: {
    keywords: ['child', 'girl', 'boy', 'kid', 'grandmother', 'grandma', 'person', 'friend'],
    art: (
      <g>
        <circle cx="60" cy="40" r="20" fill="#f0c49a" />
        <path d="M40 36 q 20 -24 40 0 q -10 -8 -20 -6 q -12 2 -20 6" fill="#4a3728" />
        <circle cx="53" cy="42" r="2.6" fill="#2b2b2b" />
        <circle cx="67" cy="42" r="2.6" fill="#2b2b2b" />
        <path d="M54 50 q 6 5 12 0" stroke="#2b2b2b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M42 108 q 0 -42 18 -42 q 18 0 18 42 Z" fill="#e2766f" />
        <path d="M44 72 l-12 20 M76 72 l12 20" stroke="#f0c49a" strokeWidth="8" strokeLinecap="round" />
        <path d="M52 108 v10 M68 108 v10" stroke="#3f4a6b" strokeWidth="8" strokeLinecap="round" />
      </g>
    ),
  },
  cat: {
    keywords: ['cat', 'kitten', 'tabby'],
    art: (
      <g>
        <ellipse cx="58" cy="84" rx="36" ry="22" fill="#9a8878" />
        <path d="M92 84 q 20 -6 14 -26" stroke="#9a8878" strokeWidth="9" fill="none" strokeLinecap="round" />
        <circle cx="36" cy="60" r="20" fill="#a89684" />
        <path d="M22 48 L20 30 L36 42 Z" fill="#a89684" />
        <path d="M50 48 L54 30 L36 42 Z" fill="#a89684" />
        <circle cx="29" cy="58" r="2.8" fill="#2b2b2b" />
        <circle cx="43" cy="58" r="2.8" fill="#2b2b2b" />
        <path d="M36 66 l-3 3 M36 66 l3 3" stroke="#6b5a4a" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  robot: {
    keywords: ['robot', 'machine', 'android', 'tin'],
    art: (
      <g>
        <rect x="36" y="56" width="48" height="50" rx="8" fill="#8f9bab" />
        <rect x="40" y="26" width="40" height="32" rx="8" fill="#a7b3c2" />
        <circle cx="52" cy="42" r="5" fill="#2f3b4a" />
        <circle cx="68" cy="42" r="5" fill="#2f3b4a" />
        <rect x="52" y="52" width="16" height="3" rx="1.5" fill="#2f3b4a" />
        <path d="M60 26 v-10" stroke="#8f9bab" strokeWidth="3" />
        <circle cx="60" cy="13" r="4" fill="#e8914f" />
        <rect x="24" y="64" width="10" height="28" rx="5" fill="#7a8694" />
        <rect x="86" y="64" width="10" height="28" rx="5" fill="#7a8694" />
        <rect x="44" y="106" width="10" height="12" rx="3" fill="#7a8694" />
        <rect x="66" y="106" width="10" height="12" rx="3" fill="#7a8694" />
      </g>
    ),
  },
  owl: {
    keywords: ['owl', 'bird', 'wings'],
    art: (
      <g>
        <ellipse cx="60" cy="72" rx="30" ry="36" fill="#a07b55" />
        <ellipse cx="60" cy="82" rx="20" ry="24" fill="#d8bb92" />
        <path d="M34 44 L40 28 L50 42 Z" fill="#a07b55" />
        <path d="M86 44 L80 28 L70 42 Z" fill="#a07b55" />
        <circle cx="49" cy="58" r="10" fill="#fdf6e6" />
        <circle cx="71" cy="58" r="10" fill="#fdf6e6" />
        <circle cx="49" cy="58" r="4.5" fill="#2b2b2b" />
        <circle cx="71" cy="58" r="4.5" fill="#2b2b2b" />
        <path d="M60 66 l-5 7 h10 Z" fill="#e8a44f" />
        <path d="M50 108 v6 M70 108 v6" stroke="#e8a44f" strokeWidth="5" strokeLinecap="round" />
      </g>
    ),
  },
  whale: {
    keywords: ['whale', 'fish', 'dolphin', 'shark'],
    art: (
      <g>
        <path d="M14 76 q 32 -34 72 -22 q 24 8 22 24 q -2 18 -30 20 q -42 4 -64 -22 Z" fill="#5b8fc4" />
        <path d="M14 76 q -12 -14 -10 -24 q 14 6 20 14 Z" fill="#4a79a8" />
        <ellipse cx="54" cy="88" rx="30" ry="10" fill="#cfe4f5" />
        <circle cx="86" cy="66" r="3.2" fill="#22303a" />
        <path d="M70 44 q 4 -16 14 -20" stroke="#cfe4f5" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  mouse: {
    keywords: ['mouse', 'rat', 'tiny'],
    art: (
      <g>
        <ellipse cx="60" cy="84" rx="26" ry="18" fill="#b0a69c" />
        <circle cx="40" cy="74" r="14" fill="#bdb3a8" />
        <circle cx="34" cy="60" r="9" fill="#d8b9b9" />
        <circle cx="48" cy="58" r="8" fill="#d8b9b9" />
        <circle cx="31" cy="76" r="2.4" fill="#2b2b2b" />
        <circle cx="27" cy="80" r="2" fill="#d87a7a" />
        <path d="M86 86 q 18 4 14 -14" stroke="#b0a69c" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  astronaut: {
    keywords: ['astronaut', 'spacesuit', 'explorer'],
    art: (
      <g>
        <rect x="40" y="58" width="40" height="46" rx="12" fill="#eef2f6" />
        <circle cx="60" cy="40" r="22" fill="#eef2f6" />
        <path d="M44 38 a16 14 0 0 1 32 0 a16 14 0 0 1 -32 0" fill="#3a4a63" />
        <circle cx="68" cy="34" r="4" fill="#9fc4e0" opacity="0.8" />
        <rect x="26" y="64" width="12" height="30" rx="6" fill="#dde4ec" />
        <rect x="82" y="64" width="12" height="30" rx="6" fill="#dde4ec" />
        <rect x="46" y="104" width="12" height="14" rx="4" fill="#dde4ec" />
        <rect x="64" y="104" width="12" height="14" rx="4" fill="#dde4ec" />
        <rect x="50" y="70" width="20" height="12" rx="3" fill="#e8914f" />
      </g>
    ),
  },
};

/* -------------------------------------------------------------------- props */

export const PROPS = {
  key: {
    keywords: ['key', 'keyhole'],
    art: (
      <g>
        <circle cx="20" cy="22" r="11" fill="none" stroke="#e0b24a" strokeWidth="6" />
        <path d="M28 28 L48 48" stroke="#e0b24a" strokeWidth="6" strokeLinecap="round" />
        <path d="M40 40 l8 -6 M46 46 l8 -6" stroke="#e0b24a" strokeWidth="5" strokeLinecap="round" />
      </g>
    ),
  },
  map: {
    keywords: ['map', 'chart', 'treasure map'],
    art: (
      <g>
        <path d="M6 14 L22 8 L40 16 L56 10 V46 L40 52 L22 44 L6 50 Z" fill="#edd9ae" stroke="#b79a69" strokeWidth="2" />
        <path d="M22 8 V44 M40 16 V52" stroke="#b79a69" strokeWidth="1.5" />
        <path d="M14 34 q 12 -10 24 -2 q 8 6 14 0" stroke="#a8604f" strokeWidth="2" fill="none" strokeDasharray="3 3" />
        <path d="M48 28 l-4 4 m0 -4 l4 4" stroke="#a8604f" strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  umbrella: {
    keywords: ['umbrella', 'parasol', 'rain'],
    art: (
      <g>
        <path d="M6 30 a24 24 0 0 1 48 0 Z" fill="#d9566b" />
        <path d="M22 30 a8 24 0 0 1 16 0" fill="#eef0f2" opacity="0.5" />
        <path d="M30 30 V50 q 0 6 -8 6" stroke="#6b4a32" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  lantern: {
    keywords: ['lantern', 'lamp', 'light', 'candle', 'torch'],
    art: (
      <g>
        <path d="M30 6 v6" stroke="#6b5a4a" strokeWidth="3" />
        <rect x="16" y="12" width="28" height="6" rx="3" fill="#6b5a4a" />
        <path d="M18 18 h24 l4 26 h-32 Z" fill="#f3d98a" />
        <ellipse cx="30" cy="34" rx="5" ry="8" fill="#f09a3e" />
        <rect x="12" y="44" width="36" height="6" rx="3" fill="#6b5a4a" />
      </g>
    ),
  },
  seed: {
    keywords: ['seed', 'sprout', 'plant', 'acorn', 'bean'],
    art: (
      <g>
        <ellipse cx="30" cy="40" rx="12" ry="15" fill="#b9825a" />
        <path d="M30 26 q 2 -14 14 -18 q -2 14 -14 18" fill="#63a86b" />
        <path d="M30 30 q -4 -10 -14 -12 q 2 10 14 12" fill="#75bb7a" />
      </g>
    ),
  },
  boat: {
    keywords: ['boat', 'ship', 'sail', 'raft'],
    art: (
      <g>
        <path d="M8 38 h44 l-8 14 h-28 Z" fill="#c76a4f" />
        <path d="M30 36 V8 L50 32 Z" fill="#f2f4f6" />
        <path d="M28 36 V12 L12 34 Z" fill="#dfe4ea" />
      </g>
    ),
  },
  telescope: {
    keywords: ['telescope', 'spyglass', 'binoculars'],
    art: (
      <g>
        <rect x="10" y="22" width="34" height="12" rx="6" transform="rotate(-20 10 22)" fill="#3f5a78" />
        <rect x="38" y="12" width="16" height="16" rx="8" transform="rotate(-20 38 12)" fill="#2f455c" />
        <path d="M18 40 L14 54 M26 42 L32 54" stroke="#6b5a4a" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    ),
  },
  violin: {
    keywords: ['violin', 'music', 'fiddle', 'song', 'instrument'],
    art: (
      <g>
        <path d="M30 18 q 12 0 12 12 q 0 8 -6 10 q 6 4 6 12 q 0 12 -12 12 q -12 0 -12 -12 q 0 -8 6 -12 q -6 -2 -6 -10 q 0 -12 12 -12 Z" fill="#9a5a34" />
        <rect x="28" y="6" width="4" height="18" fill="#6b3f22" />
        <path d="M22 40 h16" stroke="#f0e2c8" strokeWidth="1.5" />
      </g>
    ),
  },
  cookie: {
    keywords: ['cookie', 'biscuit', 'cake', 'food', 'snack'],
    art: (
      <g>
        <circle cx="30" cy="32" r="18" fill="#d6a461" />
        <circle cx="24" cy="26" r="3" fill="#6b4126" />
        <circle cx="36" cy="30" r="3.4" fill="#6b4126" />
        <circle cx="28" cy="40" r="2.8" fill="#6b4126" />
      </g>
    ),
  },
  door: {
    keywords: ['door', 'gate', 'archway', 'portal', 'entrance'],
    art: (
      <g>
        <path d="M12 52 V20 a18 18 0 0 1 36 0 v32 Z" fill="#7a4a8c" />
        <path d="M18 52 V20 a12 12 0 0 1 24 0 v32 Z" fill="#9a66ac" />
        <circle cx="38" cy="36" r="3" fill="#e8c56a" />
      </g>
    ),
  },
};
