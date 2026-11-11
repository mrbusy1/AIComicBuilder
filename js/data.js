/* ============================================================
   AIComic Builder Studio — Reference data
   Fetched from https://aicomicbuilder.com/ , https://ai-1.art/ , https://a1.art/
   Design and Developed by Mr.Busy
   ============================================================ */
window.ACB_DATA = (function () {

  /* Official GitHub home of this desktop edition — Design and Developed by Mr.Busy */
  const GITHUB = {
    owner: 'mrbusy1',
    repo: 'AIComicBuilder',
    url: 'https://github.com/mrbusy1/AIComicBuilder',
    profile: 'https://github.com/mrbusy1',
    issues: 'https://github.com/mrbusy1/AIComicBuilder/issues',
    releases: 'https://github.com/mrbusy1/AIComicBuilder/releases',
    visibility: 'Public',
    branch: 'main',
    license: 'MIT',
    short: 'github.com/mrbusy1/AIComicBuilder',
    note: 'Open source, offline-first desktop studio. No account, no credits, no cloud — your comics stay on this machine.'
  };

  const SOURCES = {
    primary: {
      name: 'AIComicBuilder / AIComic',
      url: 'https://aicomicbuilder.com/',
      tagline: 'AI Comic & Manga Maker — "Create Amazing Comics with AI"',
      summary: 'An AI-powered comic creation platform that turns story ideas into fully illustrated comics in minutes. 50 free credits on sign-up, consistent character generation, AI panel rendering, built-in story manager, 20+ aesthetic styles, community hub and webtoon slicer.',
      pages: ['/', '/create', '/pricing', '/how-it-works', '/faq', '/about', '/changelog', '/community', '/webtoon-slicer', '/ai-comic-generator', '/ai-manga-maker', '/ai-webtoon-generator', '/comic-strip-maker'],
      workflow: [
        '1. Write Your Story Idea — describe the concept in a text prompt',
        '2. AI Generates a Storyboard — scenes, panels, dialogue, speech bubbles',
        '3. Customize Characters and Scenes — character library + image-to-image consistency',
        '4. AI Renders High-Quality Panels — 20+ art styles, dynamic compositions',
        '5. Publish to the Community — share, discover, remix'
      ],
      createModes: ['Quick Create', 'Customize', 'Advanced (8-step wizard)'],
      wizardSteps: ['Comic Info', 'Enhance Idea', 'Choose Characters', 'Style & Layout', 'Preview Story', 'Generate Story', 'Review Sketch & Dialogue', 'Render & Finish'],
      createFields: ['Comic Title', 'Core Idea', 'Comic Length (1–8 pages)', 'Starring Character', 'Surprise Me', 'Layout (auto + 9 presets)', 'Style (auto + 20 presets)', 'Panels per page', 'Character roles: Heroes / Villains / Supporting', 'AI Enhance idea', 'Improve dialogue', 'Regenerate', 'Open Editor', 'Publish'],
      generationStages: ['Story Outline', 'Script & Dialogue', 'Sketching Panels', 'Final HD Render'],
      pricing: [
        { name: 'Free', price: '$0 / mo', credits: '50 Welcome Credits', chars: '10 characters', styles: '7 Basic Styles', speed: 'Normal Speed', extra: 'Watermarked · Community Only' },
        { name: 'Creator', price: '$9.99 / mo', credits: '500 AI Credits / mo', chars: '50 characters', styles: 'All styles', speed: 'Normal Speed', extra: '~20–30 comics/mo' },
        { name: 'Pro', price: '$19.99 / mo', credits: '1500 AI Credits / mo', chars: '300 characters', styles: 'All 20+ Styles', speed: 'Fast Generation', extra: 'Commercial License' },
        { name: 'Studio', price: '$39.99 / mo', credits: '4000 AI Credits / mo', chars: 'Unlimited characters', styles: 'All styles', speed: 'Turbo High-Res', extra: 'Commercial Rights · API Access · Private comics' }
      ],
      faq: [
        ['How do Credits work?', 'Every new user receives 50 free Welcome Credits. A standard panel costs roughly 8–10 credits; an 8-panel comic uses ~64 credits.'],
        ['Character Consistency Builder', 'Design a character once and reuse across comics; upload a photo and the image-to-image pipeline injects the face.'],
        ['Are comics private?', 'By default comics are visible in the Community hub. Only the Studio plan can make them completely private.'],
        ['Commercial rights?', 'Only paid / Studio tiers include full commercial rights for print, sale and monetisation.'],
        ['Failed generation?', 'The system detects failures and refunds credits instantly.'],
        ['Multi-language', 'English, Spanish, French, German, Japanese, Korean, Chinese, Portuguese (launched 2026-08-20).']
      ],
      changelog: [
        ['2026-09-01', 'Planned', 'AI Panel Editor — fine-tune compositions, swap backgrounds, adjust poses'],
        ['2026-08-20', 'Launched', 'Multi-Language Support (8 languages)'],
        ['2026-08-10', 'Launched', 'Enhanced AI Story Engine'],
        ['2026-07-25', 'Launched', '20+ New Art Styles'],
        ['2026-07-10', 'Launched', 'Character Consistency Pipeline']
      ]
    },
    secondary: {
      given: 'https://ai-1.art/',
      status: 'Parked / pre-launch placeholder',
      detail: 'Returns HTTP 200 with a Hostinger "Coming soon" page (title: "Coming soon", "Hosted by HOSTINGER"). No product, features or data published on that domain at fetch time (2026-11-11).',
      likelyIntended: 'https://a1.art/ — "Online AI Video & Image Generator with Millions of Filters" / "Everyone\'s art station"',
      a1art: [
        '355.2K+ Filters (Filter app marketplace)',
        'Collections',
        'Recent Generation feed',
        'Online AI image generation + photo filters',
        'Image-to-video, face-swap video, community apps (Instant Design team)',
        'Template / app builder for creative AI filters'
      ],
      borrowed: 'The filter-and-app marketplace idea inspired the new "Filters & FX" module and the Custom Style Builder in this desktop edition.'
    }
  };

  /* 20 original styles from the site + 8 new styles added in this edition */
  const STYLES = [
    { id:'american-comic', name:'American Comic', emoji:'🦸', desc:'Bold inks, halftone, dynamic superhero framing', cat:'Comic', colors:['#f2c14e','#d64545','#2b3a67'], line:3, halftone:.35, texture:'halftone', new:false },
    { id:'manga', name:'Manga', emoji:'📖', desc:'Inked B/W, screentone, speed lines', cat:'Comic', colors:['#ffffff','#2b2b2b','#9aa0a6'], line:2.5, halftone:.55, texture:'screentone', mono:true, new:false },
    { id:'anime', name:'Anime', emoji:'🎌', desc:'Bright cel shading, expressive eyes', cat:'Comic', colors:['#ffd6e8','#7ac6ff','#2d3561'], line:2, halftone:.08, texture:'clean', new:false },
    { id:'webtoon', name:'Webtoon', emoji:'📱', desc:'Full-colour Korean manhwa digital painting', cat:'Comic', colors:['#ffb3c6','#a0c4ff','#3d405b'], line:1.5, halftone:.05, texture:'clean', new:false },
    { id:'cartoon', name:'Cartoon', emoji:'🤪', desc:'Playful shapes, thick outlines', cat:'Comic', colors:['#ffd166','#ef476f','#06d6a0'], line:3.5, halftone:.1, texture:'clean', new:false },
    { id:'noir', name:'Noir', emoji:'🕵️', desc:'High-contrast monochrome, hard shadows', cat:'Noir', colors:['#101014','#4a4a52','#e8e8e8'], line:3, halftone:.4, texture:'grain', mono:true, new:false },
    { id:'cyberpunk', name:'Cyberpunk', emoji:'🤖', desc:'Neon grids, rain, magenta/cyan glow', cat:'Sci-Fi', colors:['#ff2e97','#00e5ff','#10102a'], line:2, halftone:.12, texture:'neon', new:false },
    { id:'fantasy', name:'Fantasy', emoji:'🐉', desc:'Epic painterly landscapes, warm magic light', cat:'Fantasy', colors:['#f6bd60','#84a59d','#3d405b'], line:2, halftone:.06, texture:'soft', new:false },
    { id:'pixar', name:'Pixar-like', emoji:'✨', desc:'Soft 3D render, big eyes, warm rim light', cat:'3D', colors:['#ffd29d','#9bd1e5','#f28482'], line:1, halftone:0, texture:'soft', new:false },
    { id:'chibi', name:'Chibi', emoji:'🍡', desc:'Tiny bodies, oversized heads', cat:'Cute', colors:['#ffc8dd','#bde0fe','#ffffff'], line:2.5, halftone:.08, texture:'clean', new:false },
    { id:'watercolor', name:'Watercolor', emoji:'💧', desc:'Bleeding washes, paper grain', cat:'Painterly', colors:['#a8dadc','#f1faee','#e9c46a'], line:1, halftone:0, texture:'watercolor', new:false },
    { id:'oil-painting', name:'Oil Painting', emoji:'🖼️', desc:'Textured brush strokes, rich chiaroscuro', cat:'Painterly', colors:['#8d5524','#c68642','#3b2f2f'], line:1, halftone:0, texture:'oil', new:false },
    { id:'sketch', name:'Sketch', emoji:'✏️', desc:'Loose pencil construction lines', cat:'Painterly', colors:['#f5f3ee','#8d8d8d','#3a3a3a'], line:1.5, halftone:.2, texture:'pencil', mono:true, new:false },
    { id:'ink', name:'Ink', emoji:'🖋️', desc:'Brush ink, dry texture,sumi-e feel', cat:'Painterly', colors:['#fbf7ef','#3a3a3a','#111111'], line:4, halftone:0, texture:'ink', mono:true, new:false },
    { id:'pixel', name:'Pixel Art', emoji:'👾', desc:'Chunky 8-bit blocks, limited palette', cat:'Retro', colors:['#6a4c93','#ffca3a','#1982c4'], line:0, halftone:0, texture:'pixel', new:false },
    { id:'pop-art', name:'Pop Art', emoji:'💥', desc:'Ben-Day dots, primary colours', cat:'Retro', colors:['#ffea00','#ff2e63','#08d9d6'], line:3.5, halftone:.7, texture:'halftone', new:false },
    { id:'vintage', name:'Vintage', emoji:'📻', desc:'Faded sepia print, aged paper', cat:'Retro', colors:['#e9d8a6','#ca6702','#7f5539'], line:2, halftone:.3, texture:'grain', new:false },
    { id:'steampunk', name:'Steampunk', emoji:'⚙️', desc:'Brass, gears, gaslight fog', cat:'Retro', colors:['#b08968','#dda15e','#4a4e3d'], line:2.5, halftone:.18, texture:'grain', new:false },
    { id:'scifi', name:'Sci-Fi', emoji:'🚀', desc:'Clean futurism, cool metallic light', cat:'Sci-Fi', colors:['#48cae4','#0077b6','#03045e'], line:1.5, halftone:.05, texture:'clean', new:false },
    { id:'children', name:"Children's Book", emoji:'🧸', desc:'Friendly rounded shapes, soft pastels', cat:'Cute', colors:['#ffdac1','#e2f0cb','#ffb7b2'], line:2, halftone:0, texture:'soft', new:false },
    /* ---- New in Unlimited Edition ---- */
    { id:'comic-book-classic', name:'Silver Age Comic', emoji:'📚', desc:'Newsprint 4-colour registration offset', cat:'Comic', colors:['#e63946','#f1faee','#1d3557'], line:3, halftone:.55, texture:'halftone', new:true },
    { id:'manhwa', name:'Manhwa', emoji:'🌸', desc:'Korean full-colour glossy drama', cat:'Comic', colors:['#ffafcc','#bde0fe','#2b2d42'], line:1.5, halftone:.04, texture:'clean', new:true },
    { id:'gothic', name:'Gothic Horror', emoji:'🦇', desc:'Cold moonlight, heavy blacks', cat:'Noir', colors:['#22223b','#4a4e69','#c9ada7'], line:3, halftone:.25, texture:'grain', new:true },
    { id:'claymation', name:'Claymation', emoji:'🧱', desc:'Stop-motion clay, soft studio light', cat:'3D', colors:['#e5989b','#b5828c','#ffcdb2'], line:1, halftone:0, texture:'soft', new:true },
    { id:'lineart', name:'Clean Lineart', emoji:'〰️', desc:'Minimal vector linework on white', cat:'Painterly', colors:['#ffffff','#111827','#9ca3af'], line:2, halftone:0, texture:'clean', mono:true, new:true },
    { id:'neon-noir', name:'Neon Noir', emoji:'🌃', desc:'Rain-soaked neon, cinematic contrast', cat:'Sci-Fi', colors:['#f72585','#4cc9f0','#10002b'], line:2, halftone:.15, texture:'neon', new:true },
    { id:'flat-vector', name:'Flat Vector', emoji:'🔺', desc:'Geometric shapes, corporate flat art', cat:'3D', colors:['#ffbe0b','#3a86ff','#8338ec'], line:0, halftone:0, texture:'clean', new:true },
    { id:'ukiyoe', name:'Ukiyo-e', emoji:'🌊', desc:'Japanese woodblock, wave patterns', cat:'Painterly', colors:['#e9c46a','#2a628f','#f4f1de'], line:2.5, halftone:.2, texture:'ink', new:true }
  ];

  /* 9 layouts from the site + 7 new ones */
  const LAYOUTS = [
    { id:'auto', name:'Auto Smart', emoji:'✨', desc:'AI selects layout format', count:6, cols:2, new:false },
    { id:'comic-strip', name:'Comic Strip', emoji:'🎞️', desc:'Horizontal 3-panel strip', count:3, cols:3, new:false },
    { id:'webtoon', name:'Webtoon', emoji:'📜', desc:'Vertical scroll 6 panels', count:6, cols:1, new:false },
    { id:'instagram', name:'Instagram', emoji:'📸', desc:'10 square carousel tiles', count:10, cols:2, new:false },
    { id:'facebook', name:'Facebook', emoji:'🌐', desc:'4-panel social grid', count:4, cols:2, new:false },
    { id:'meme', name:'Meme', emoji:'🎭', desc:'2-panel reaction format', count:2, cols:1, new:false },
    { id:'story-book', name:'Story Book', emoji:'📖', desc:'Single full-page illustration', count:1, cols:1, new:false },
    { id:'kids-book', name:'Kids Book', emoji:'🎨', desc:'2 large picture panels', count:2, cols:2, new:false },
    { id:'newspaper', name:'Newspaper', emoji:'📰', desc:'Classic 4-panel daily strip', count:4, cols:2, new:false },
    { id:'manga-page', name:'Manga Page', emoji:'🎌', desc:'Traditional 6-panel Japanese page', count:6, cols:2, new:false },
    /* ---- New ---- */
    { id:'yonkoma', name:'4-Koma (Yonkoma)', emoji:'▦', desc:'Vertical 4-panel joke structure', count:4, cols:1, new:true },
    { id:'splash', name:'Splash Page', emoji:'🖼️', desc:'One dramatic full-bleed image', count:1, cols:1, new:true },
    { id:'grid-9', name:'3×3 Grid', emoji:'#️⃣', desc:'Nine equal panels', count:9, cols:3, new:true },
    { id:'widescreen', name:'Cinematic Wide', emoji:'🎬', desc:'2 ultra-wide cinematic panels', count:2, cols:1, new:true },
    { id:'dynamic', name:'Dynamic Mix', emoji:'🧩', desc:'Mixed sizes: hero shot + small beats', count:5, cols:6, new:true },
    { id:'double-spread', name:'Double Spread', emoji:'📔', desc:'Print-ready 8-panel spread', count:8, cols:4, new:true },
    { id:'custom', name:'Custom Canvas', emoji:'🛠️', desc:'Choose exact columns & panel count', count:6, cols:3, new:true }
  ];

  const GENRES = ['Adventure','Comedy','Fantasy','Sci-Fi','Mystery','Horror','Romance','Slice of Life','Superhero','Action','Drama','Educational','Fairy Tale','Cyberpunk','Western','Sports'];
  const TONES = ['Lighthearted','Dramatic','Dark','Whimsical','Suspenseful','Heartwarming','Satirical','Epic','Melancholic','Absurd'];
  const AUDIENCES = ['All Ages','Kids (6–10)','Teens','Young Adults','Adults','Classroom / Education','Professional'];
  const LANGUAGES = [
    { id:'en', name:'English' }, { id:'es', name:'Español' }, { id:'fr', name:'Français' },
    { id:'de', name:'Deutsch' }, { id:'ja', name:'日本語' }, { id:'ko', name:'한국어' },
    { id:'zh', name:'中文' }, { id:'pt', name:'Português' }
  ];
  const CAMERAS = ['Establishing Wide','Medium Shot','Close-Up','Extreme Close-Up','Low Angle','High Angle','Over-the-Shoulder','Bird\'s Eye','Dutch Angle','Two-Shot','Splash / Full Bleed'];
  const EXPRESSIONS = ['Neutral','Determined','Surprised','Angry','Joyful','Sad','Sly','Scared','Thinking','Shouting'];
  const BUBBLE_TYPES = ['Speech','Thought','Caption','SFX','Whisper','Shout','Narration'];

  const PROMPTS = [
    { emoji:'🐱', title:'Funny Cats', idea:'A group of cats running a secret detective agency in a big city', style:'cartoon', genre:'Mystery' },
    { emoji:'🧟', title:'Zombie School', idea:'High school students trying to pass exams while surviving a zombie apocalypse', style:'american-comic', genre:'Horror' },
    { emoji:'👽', title:'Alien Office', idea:'An ordinary human working in a corporate office where everyone else is an alien', style:'anime', genre:'Comedy' },
    { emoji:'🐉', title:'Dragon Cafe', idea:'A tiny dragon who opens a successful pastry cafe in a magical forest', style:'pixar', genre:'Fantasy' },
    { emoji:'🤖', title:'Robot Chef', idea:'A clumsy robot trying to win a prestigious cooking competition', style:'chibi', genre:'Comedy' },
    { emoji:'👻', title:'Ghost Hotel', idea:'A human inherits a luxury hotel that is exclusively for wealthy ghosts', style:'watercolor', genre:'Comedy' },
    { emoji:'🕵️', title:'Tiny Detective', idea:'A detective the size of a mouse solving crimes in a normal-sized house', style:'noir', genre:'Mystery' },
    { emoji:'🦸', title:'Superhero Family', idea:'A family of superheroes trying to hide their powers on a normal suburban vacation', style:'american-comic', genre:'Superhero' },
    { emoji:'🦸', title:'Rooftop Vigilante', idea:'A cyber-enhanced vigilante watches over a rain-drenched neon metropolis as an unexpected signal appears on a rooftop antenna.', style:'cyberpunk', genre:'Action' },
    { emoji:'🐉', title:'Dragon Bakery', idea:'A friendly baby dragon tries to run a small village bakery but keeps accidentally setting the fresh croissants on fire.', style:'pixar', genre:'Fantasy' },
    { emoji:'🚀', title:'Deep Space Cargo', idea:'Two mismatched space pilots transporting rare celestial crystals get ambushed by friendly alien scavengers looking for snacks.', style:'scifi', genre:'Sci-Fi' },
    { emoji:'🕵️', title:'1940s Rainy Sleuth', idea:'A cynical private investigator finds a glowing mysterious pocket watch left inside an empty telephone booth.', style:'noir', genre:'Mystery' },
    { emoji:'⚔️', title:'Spirit Blade Academy', idea:'A humble student unlocks an ancient forbidden guardian blade during the entrance tournament of the Sky Kingdom.', style:'manga', genre:'Action' },
    { emoji:'☕', title:'Ghost Barista', idea:'A vintage late-night coffee shop in an old alleyway where ghosts and tired city workers share quiet midnight stories.', style:'watercolor', genre:'Slice of Life' },
    { emoji:'👑', title:'Reborn as the Villainess', idea:'The reincarnated villainess decides to cancel her royal wedding and build a continent-spanning tea merchant empire.', style:'webtoon', genre:'Romance' },
    { emoji:'🗡️', title:'S-Rank Dungeon Glitch', idea:'A struggling low-tier scavenger awakens a hidden status window glitch inside an uncharted underground crystal gate.', style:'anime', genre:'Action' },
    { emoji:'🍜', title:'Midnight Ramen Tale', idea:'A cozy slice-of-life about a quiet ramen master whose secret recipe triggers long-forgotten childhood memories.', style:'manga', genre:'Slice of Life' },
    { emoji:'⏳', title:'24-Hour Murder Reset', idea:'A genius detective must prevent the heir to a mega-conglomerate from being poisoned, but time resets each time he fails.', style:'noir', genre:'Mystery' },
    { emoji:'💼', title:'Monday Morning Standup', idea:'A software engineer tries explaining a mysterious bug to their rubber duck, who begins providing actual code reviews.', style:'cartoon', genre:'Comedy' },
    { emoji:'🐱', title:'Cat Existential Logic', idea:'A philosopher cat looks out the window, philosophizing deeply about why the red laser dot always vanishes when touched.', style:'cartoon', genre:'Comedy' },
    { emoji:'🍕', title:'Mars Pizza Run', idea:'A delivery rider must get a still-warm pizza across a dust storm to a colony on Mars before the dome closes.', style:'scifi', genre:'Adventure' },
    { emoji:'🧙', title:'Clumsy Apprentice', idea:'An apprentice wizard keeps miscasting simple spells and accidentally turns the village into a giant board game.', style:'fantasy', genre:'Fantasy' }
  ];

  const FEATURED_CHARACTERS = [
    { name:'Luna the Unicorn', cat:'Fantasy Creatures', color:'#c9a7ff', hair:'#f7d6ff', role:'hero', traits:'Gentle, curious, star-magic' },
    { name:'Captain Cosmos', cat:'Superheroes', color:'#4a9bff', hair:'#2b2b45', role:'hero', traits:'Brave, cosmic shield' },
    { name:'Detective Cat', cat:'Animals', color:'#f5a524', hair:'#3a2f2a', role:'hero', traits:'Sharp, nocturnal, trench coat' },
    { name:'Tiny Dinosaur', cat:'Dinosaurs', color:'#4fd6a0', hair:'#2f6b4f', role:'supporting', traits:'Tiny but fearless' },
    { name:'Chibi Cat', cat:'Cute / Chibi', color:'#ffb6c1', hair:'#ff8fab', role:'supporting', traits:'Sleepy, snack-motivated' },
    { name:'Friendly Ghost', cat:'Monsters', color:'#dfe7ff', hair:'#aab8e8', role:'supporting', traits:'Polite, translucent' },
    { name:'ARIA', cat:'Robots & AI', color:'#59b8ff', hair:'#d9e9ff', role:'villain', traits:'Logical, glitchy empathy' },
    { name:'Chef Robot', cat:'Robots & AI', color:'#ffb45c', hair:'#8a6a3a', role:'supporting', traits:'Clumsy, perfectionist' }
  ];

  const COMMUNITY = {
    trending: [
      ['The Time-Traveling Hamster','Admin','1361'],
      ['Penguins on Vacation','Admin','243'],
      ['The Last Wizard School','Admin','224'],
      ['A luxury hotel welcomes monsters from around the world.','Admin','215'],
      ['Pirate Ducks','Johnson','169'],
      ['The Villain Who Quit','Admin','166'],
      ['The Castle That Moved at Night','Johnson','157'],
      ['Moonlight Thieves','Johnson','140'],
      ['The Moon Is Missing','Admin','140'],
      ['Snowball Saves Christmas','Admin','137']
    ],
    recent: [
      ['The World Inside the Machine','SUKHPREET SINGH','3'],
      ['The Farmer and the Maybe','Vartan Tashjian','19'],
      ['David and Goliath: The Little Shepherd\'s Courage','Gabriel Shirsat','34'],
      ['Operation Party Planner','Veronica Sommadossi','31']
    ],
    sampleDialogue: [
      'At last. The geometry of the universe is finally within my reach.',
      'Wait—no! The calibration isn\'t—',
      'A simple snack drop, and suddenly the history of art is a manifesto of chaos.',
      'If the hunter disappears, the house itself will lose its anchor. I have to fix this!',
      'The structural integrity of this reality is hemorrhaging. The timeline is fraying.',
      'Wake up, Leo. I\'m doing my best to ensure you wake up in a house, not a crater.',
      'Snip the paradox, reset the gear. Be a good hamster, save the world.',
      'Back to the sunflower seeds. Just another night as the galaxy\'s silent sentry.'
    ]
  };

  const LIMITS = [
    ['Credits / generations','50 welcome credits, ~8–10 per panel','∞ Unlimited, zero cost','Credits system removed entirely'],
    ['Pages per comic','1–8 pages max','1–50 pages (custom)','Extended page engine'],
    ['Panels per page','Fixed preset counts','1–24 panels, any layout','Custom Canvas + grid builder'],
    ['Art styles','7 basic on Free / 20+ on paid','28 built-in + unlimited custom','Custom Style Builder'],
    ['Characters','10 (Free) / 300 (Pro)','∞ Unlimited profiles','Local character library'],
    ['Watermark','Applied on Free tier','Never — off by default','Export engine rewritten'],
    ['Privacy','Public by default; private only on Studio','Private by default, local-only','No cloud, no account'],
    ['Commercial rights','Paid plans only','Full rights on everything you make','No licence gate'],
    ['Speed tiers','Normal / Fast / Turbo paywalled','Instant local rendering, 1×–3× quality','Offline render engine'],
    ['Sign-in / network','Account required, online only','No account, 100% offline','Desktop-first architecture'],
    ['API access','Studio tier only','Optional BYO endpoint, unlimited','Open AI provider settings'],
    ['AI Panel Editor','Planned (coming soon)','Shipped — full editor','Bubble drag, FX, regenerate single panel'],
    ['Export','PNG panels (HD on paid)','PNG / SVG / PDF / CBZ / JSON / WebP','Export Center'],
    ['Languages','8 languages','8 languages + switchable UI','Built-in i18n'],
    ['Webtoon slicer','30,000px height, 2MB/slice, 20MB episode','No height or size cap, ZIP/CBZ out','Native desktop slicer'],
    ['Data ownership','Stored on their servers','Stored on your machine, backup/restore','Local project store']
  ];

  const FILTERS = [
    { id:'none', name:'Original' }, { id:'halftone', name:'Halftone' }, { id:'screentone', name:'Screentone' },
    { id:'ink', name:'Ink Boost' }, { id:'noir', name:'Noir B/W' }, { id:'sepia', name:'Sepia' },
    { id:'vintage', name:'Vintage Fade' }, { id:'neon', name:'Neon Glow' }, { id:'pixel', name:'Pixelate' },
    { id:'grain', name:'Film Grain' }, { id:'vignette', name:'Vignette' }, { id:'posterize', name:'Posterize' },
    { id:'watercolor', name:'Watercolor' }, { id:'emboss', name:'Emboss' }, { id:'invert', name:'Invert' },
    { id:'saturate', name:'Hyper Colour' }
  ];

  const EXPORT_FORMATS = [
    { id:'png', name:'PNG Images', desc:'Each page composited at full resolution' },
    { id:'panels', name:'Individual Panels', desc:'Every panel as a separate PNG' },
    { id:'svg', name:'SVG Page', desc:'Vector page with embedded artwork' },
    { id:'pdf', name:'PDF / Print', desc:'Print-ready layout via system print dialog' },
    { id:'cbz', name:'CBZ Comic Archive', desc:'Standard comic-book ZIP with ComicInfo.xml' },
    { id:'json', name:'JSON Project', desc:'Editable project backup' },
    { id:'webp', name:'WebP', desc:'Compressed web-optimised pages' }
  ];

  /* Story engine word banks */
  const WORDS = {
    places: ['a rain-slick rooftop','a neon-lit alley','a forgotten library','a floating market','the edge of a crater','a quiet train carriage','an overgrown greenhouse','a clocktower balcony','a dusty workshop','a moonlit harbour','a bustling school corridor','a crystal cavern'],
    actions: ['discovers a strange signal','makes an impossible promise','accidentally breaks the rules','finds a hidden door','must choose between two paths','hears a voice from nowhere','uncovers the final clue','tries one last desperate plan','meets an unexpected ally','loses something important','turns the tables','learns the truth'],
    twists: ['but nothing is quite as it seems','and the whole city is watching','just as the lights go out','while time quietly runs backwards','with only seconds to spare','and someone else got there first','in front of a very confused crowd','as the ground begins to hum','under a sky full of paper stars','and the map starts rewriting itself'],
    lines: [
      'We can still fix this. Probably.',
      'That was NOT in the briefing.',
      'I had one job. One.',
      'Hold on — did you hear that?',
      'So this is what "impossible" feels like.',
      'Somebody please write this down.',
      'I knew the shortcut was a mistake.',
      'Again. From the top. But faster.',
      'You said it would be simple!',
      'Well. That escalated politely.',
      'Nobody panic. I am absolutely panicking.',
      'The plan is working. Technically.'
    ],
    captions: [
      'MOMENTS EARLIER…','MEANWHILE, ACROSS TOWN','THREE HOURS LATER','THE NEXT MORNING',
      'SOMEWHERE ABOVE THE CLOUDS','AND THEN, EVERYTHING CHANGED','BACK AT THE HIDEOUT','THE FINAL CHAPTER BEGINS'
    ],
    sfx: ['WHAM!','KRAAK','*click*','WHOOSH','THUD','ZAP!','…','FWOOSH','DING!','VRRRRM','SPLAT','boom'],
    cameras: ['Establishing Wide','Medium Shot','Close-Up','Low Angle','High Angle','Over-the-Shoulder','Bird\'s Eye','Dutch Angle','Two-Shot']
  };

  const I18N = {
    en: { dashboard:'Dashboard', create:'Create Studio', projects:'My Projects', editor:'Comic Editor', reader:'Reader', characters:'Characters', styles:'Style Lab', inspiration:'Inspiration', slicer:'Webtoon Slicer', filters:'Filters & FX', export:'Export Center', settings:'Settings', about:'About & Sources', workspace:'WORKSPACE', library:'LIBRARY', tools:'TOOLS', system:'SYSTEM', newComic:'New Comic', save:'Save', cancel:'Cancel', delete:'Delete', export2:'Export', generate:'Generate', search:'Search' },
    es: { dashboard:'Panel', create:'Estudio de creación', projects:'Mis proyectos', editor:'Editor de cómics', reader:'Lector', characters:'Personajes', styles:'Laboratorio de estilos', inspiration:'Inspiración', slicer:'Cortador Webtoon', filters:'Filtros y FX', export:'Centro de exportación', settings:'Ajustes', about:'Acerca de', workspace:'ESPACIO DE TRABAJO', library:'BIBLIOTECA', tools:'HERRAMIENTAS', system:'SISTEMA', newComic:'Nuevo cómic', save:'Guardar', cancel:'Cancelar', delete:'Eliminar', export2:'Exportar', generate:'Generar', search:'Buscar' },
    fr: { dashboard:'Tableau de bord', create:'Studio de création', projects:'Mes projets', editor:'Éditeur de BD', reader:'Lecteur', characters:'Personnages', styles:'Labo de styles', inspiration:'Inspiration', slicer:'Découpeur Webtoon', filters:'Filtres et FX', export:'Centre d\'export', settings:'Paramètres', about:'À propos', workspace:'ESPACE DE TRAVAIL', library:'BIBLIOTHÈQUE', tools:'OUTILS', system:'SYSTÈME', newComic:'Nouvelle BD', save:'Enregistrer', cancel:'Annuler', delete:'Supprimer', export2:'Exporter', generate:'Générer', search:'Rechercher' },
    de: { dashboard:'Übersicht', create:'Kreativ-Studio', projects:'Meine Projekte', editor:'Comic-Editor', reader:'Leser', characters:'Charaktere', styles:'Stil-Labor', inspiration:'Inspiration', slicer:'Webtoon-Slicer', filters:'Filter & FX', export:'Export-Center', settings:'Einstellungen', about:'Über & Quellen', workspace:'ARBEITSBEREICH', library:'BIBLIOTHEK', tools:'WERKZEUGE', system:'SYSTEM', newComic:'Neuer Comic', save:'Speichern', cancel:'Abbrechen', delete:'Löschen', export2:'Exportieren', generate:'Erzeugen', search:'Suchen' },
    ja: { dashboard:'ダッシュボード', create:'作成スタジオ', projects:'マイプロジェクト', editor:'コミックエディタ', reader:'リーダー', characters:'キャラクター', styles:'スタイルラボ', inspiration:'インスピレーション', slicer:'ウェブトゥーン分割', filters:'フィルター & FX', export:'エクスポート', settings:'設定', about:'概要と出典', workspace:'ワークスペース', library:'ライブラリ', tools:'ツール', system:'システム', newComic:'新規コミック', save:'保存', cancel:'キャンセル', delete:'削除', export2:'書き出し', generate:'生成', search:'検索' },
    ko: { dashboard:'대시보드', create:'제작 스튜디오', projects:'내 프로젝트', editor:'만화 편집기', reader:'리더', characters:'캐릭터', styles:'스타일 랩', inspiration:'영감', slicer:'웹툰 분할', filters:'필터 & FX', export:'내보내기', settings:'설정', about:'정보 및 출처', workspace:'워크스페이스', library:'라이브러리', tools:'도구', system:'시스템', newComic:'새 만화', save:'저장', cancel:'취소', delete:'삭제', export2:'내보내기', generate:'생성', search:'검색' },
    zh: { dashboard:'工作台', create:'创作工作室', projects:'我的项目', editor:'漫画编辑器', reader:'阅读器', characters:'角色库', styles:'风格实验室', inspiration:'灵感中心', slicer:'条漫切图', filters:'滤镜与特效', export:'导出中心', settings:'设置', about:'关于与来源', workspace:'工作区', library:'资料库', tools:'工具', system:'系统', newComic:'新建漫画', save:'保存', cancel:'取消', delete:'删除', export2:'导出', generate:'生成', search:'搜索' },
    pt: { dashboard:'Painel', create:'Estúdio de criação', projects:'Meus projetos', editor:'Editor de quadrinhos', reader:'Leitor', characters:'Personagens', styles:'Lab de estilos', inspiration:'Inspiração', slicer:'Cortador Webtoon', filters:'Filtros e FX', export:'Central de exportação', settings:'Configurações', about:'Sobre e fontes', workspace:'ESPAÇO DE TRABALHO', library:'BIBLIOTECA', tools:'FERRAMENTAS', system:'SISTEMA', newComic:'Novo quadrinho', save:'Salvar', cancel:'Cancelar', delete:'Excluir', export2:'Exportar', generate:'Gerar', search:'Pesquisar' }
  };

  return { GITHUB, SOURCES, STYLES, LAYOUTS, GENRES, TONES, AUDIENCES, LANGUAGES, CAMERAS, EXPRESSIONS, BUBBLE_TYPES, PROMPTS, FEATURED_CHARACTERS, COMMUNITY, LIMITS, FILTERS, EXPORT_FORMATS, WORDS, I18N };
})();
