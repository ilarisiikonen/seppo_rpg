import type { AnimSet, Beer, Food, Weapon, EnemyTemplate, BossPhase, Upgrade, Player, LevelUpChoice, Relic, RelicRarity, GameEvent, EnemyTrait, CardRarity } from './types'

/* ── Enemy Trait Descriptions ──────────────────── */

export const TRAIT_INFO: Record<EnemyTrait, { name: string; icon: string; desc: string }> = {
  micro_manager:     { name: 'Micro Manager',     icon: 'assignment_late',       desc: 'Can apply Weak for 1-2 turns.' },
  helmet:            { name: 'Helmet',             icon: 'sports_motorsports',    desc: 'Extra high DEF. Helmet breaks at 50% HP, halving DEF.' },
  drink_steal:       { name: 'Drink Thief',        icon: 'liquor',                desc: 'Steals and uses one of your drinks.' },
  dark_scream:       { name: 'Dark Scream',        icon: 'record_voice_over',     desc: 'Can apply Weak.' },
  iron_body:         { name: 'Iron Body',          icon: 'fitness_center',        desc: 'You take 3 recoil damage every time you attack.' },
  holy_smite:        { name: 'Holy Smite',         icon: 'church',                desc: 'Can apply Vulnerable.' },
  slippery_floor:    { name: 'Slippery Floor',     icon: 'mop',                   desc: 'Can apply Frail.' },
  grave_chill:       { name: 'Grave Chill',        icon: 'deceased',              desc: 'Can apply Poison.' },
  self_sacrifice:    { name: 'Self Sacrifice',     icon: 'volunteer_activism',    desc: 'May sacrifice HP to heal the Cult Leader when boss is below 50%.' },
  tazer:             { name: 'Tazer',              icon: 'bolt',                  desc: 'Low chance to stun you for 1 turn.' },
  hellfire:          { name: 'Hellfire',            icon: 'whatshot',              desc: 'Can apply Alcohol Poisoning.' },
  bone_explosion:    { name: 'Bone Explosion',     icon: 'skull',                 desc: 'Explodes on death, dealing damage.' },
  boss_weak_frail:   { name: 'Power Play',         icon: 'business_center',       desc: 'Can apply Weak or Frail.' },
  boss_vulnerable:   { name: 'Tough Knuckles',     icon: 'front_hand',            desc: 'Can apply Vulnerable.' },
  satanist_rage:     { name: 'Satanic Rage',       icon: 'whatshot',              desc: 'Can apply Weak. Gains ATK when below 30% HP.' },
  bartender_poison:  { name: 'Spiked Drinks',      icon: 'local_bar',             desc: 'Can apply Alcohol Poisoning.' },
  high_priest_wrath: { name: 'Divine Wrath',       icon: 'auto_awesome',          desc: 'Can apply Weak or Vulnerable.' },
  cult_leader_drain: { name: 'Soul Drain',         icon: 'psychology',            desc: 'Heals when hitting you.' },
  karhu_fury:        { name: 'Bear Stance',        icon: 'pets',                  desc: 'Gains DEF when below 30% HP.' },
  mirror_self:       { name: 'Mirror Self',        icon: 'swap_horiz',            desc: 'Copies a random player buff at fight start.' },
  low_hp_atk_boost:  { name: 'Rage',               icon: 'mood_bad',              desc: 'Gains ATK when below 30% HP.' },
}

/* ── Animation Definitions ─────────────────────── */

function makeAnim(path: string, frames: number, fps: number, loop: boolean) {
  return { path, frames, fps, loop, images: [] as HTMLImageElement[] }
}

export const SEPPO_ANIMS_SOUTH: AnimSet = {
  idle:   makeAnim('assets/characters/seppo/animations/breathing-idle/south/', 4, 4, true),
  attack: makeAnim('assets/characters/seppo/animations/lead-jab/south/', 3, 10, false),
  kick:   makeAnim('assets/characters/seppo/animations/high-kick/south/', 7, 10, false),
  drink:  makeAnim('assets/characters/seppo/animations/drinking/south/', 6, 6, false),
  hit:    makeAnim('assets/characters/seppo/animations/taking-punch/south/', 6, 8, false),
  death:  makeAnim('assets/characters/seppo/animations/falling-back-death/south/', 7, 6, false),
}

export const SEPPO_ANIMS_EAST: AnimSet = {
  idle:   makeAnim('assets/characters/seppo/animations/breathing-idle/east/', 4, 4, true),
  attack: makeAnim('assets/characters/seppo/animations/lead-jab/east/', 3, 10, false),
  kick:   makeAnim('assets/characters/seppo/animations/high-kick/east/', 7, 10, false),
  drink:  makeAnim('assets/characters/seppo/animations/drinking/east/', 6, 6, false),
  hit:    makeAnim('assets/characters/seppo/animations/taking-punch/east/', 6, 8, false),
  death:  makeAnim('assets/characters/seppo/animations/falling-back-death/east/', 7, 6, false),
}

export const ISMO_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/ismo/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/ismo/animations/surprise-uppercut/west/', 7, 10, false),
  drink:  makeAnim('assets/characters/ismo/animations/drinking/south/', 6, 6, false),
  hit:    makeAnim('assets/characters/ismo/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/ismo/animations/falling-back-death/south/', 7, 6, false),
}

export const ANGRY_CYCLIST_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/angry_cyclist/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/angry_cyclist/animations/cross-punch/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/angry_cyclist/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/angry_cyclist/animations/falling-back-death/west/', 7, 6, false),
}

export const CONSULTANT_1_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/consultant_1/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/consultant_1/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/consultant_1/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/consultant_1/animations/falling-back-death/west/', 7, 6, false),
}

export const CONSULTANT_2_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/consultant_2/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/consultant_2/animations/high-kick/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/consultant_2/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/consultant_2/animations/falling-back-death/west/', 7, 6, false),
}

export const DRUNK_GUY_1_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/drunk_guy_1/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/drunk_guy_1/animations/surprise-uppercut/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/drunk_guy_1/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/drunk_guy_1/animations/falling-back-death/west/', 7, 6, false),
}

export const DRUNK_GUY_2_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/drunk_guy_2/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/drunk_guy_2/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/drunk_guy_2/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/drunk_guy_2/animations/falling-back-death/west/', 7, 6, false),
}

export const BLACK_METAL_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/black_metal_musician/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/black_metal_musician/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/black_metal_musician/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/black_metal_musician/animations/falling-back-death/west/', 7, 6, false),
}

export const BOUNCER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/bouncer/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/bouncer/animations/cross-punch/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/bouncer/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/bouncer/animations/falling-back-death/west/', 7, 6, false),
}

export const SHOPKEEPER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/shopkeeper/animations/breathing-idle/west/', 4, 5, true),
  attack: makeAnim('assets/characters/shopkeeper/animations/surprise-uppercut/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/shopkeeper/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/shopkeeper/animations/falling-back-death/west/', 7, 6, false),
}

export const BARTENDER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/bartender/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/bartender/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/bartender/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/bartender/animations/falling-back-death/west/', 7, 6, false),
}

export const PRIEST_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/Priest/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/Priest/animations/roundhouse-kick/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/Priest/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/Priest/animations/falling-back-death/west/', 7, 6, false),
}

export const JANITOR_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/janitor/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/janitor/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/janitor/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/janitor/animations/falling-back-death/west/', 7, 6, false),
}

export const GRAVEDIGGER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/Gravedigger/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/Gravedigger/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/Gravedigger/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/Gravedigger/animations/falling-back-death/west/', 7, 6, false),
}

export const CULT_MEMBER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/cult_member/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/cult_member/animations/roundhouse-kick/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/cult_member/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/cult_member/animations/falling-back-death/west/', 7, 6, false),
}

export const CULT_LEADER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/cult_leader/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/cult_leader/animations/hurricane-kick/west/', 4, 10, false),
  hit:    makeAnim('assets/characters/cult_leader/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/cult_leader/animations/falling-back-death/west/', 7, 6, false),
}

export const POLICE_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/police_man/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/police_man/animations/cross-punch/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/police_man/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/police_man/animations/falling-back-death/west/', 7, 6, false),
}

export const KARHU_OPERATOR_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/karhu_special_operator/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/karhu_special_operator/animations/roundhouse-kick/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/karhu_special_operator/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/karhu_special_operator/animations/falling-back-death/west/', 7, 6, false),
}

export const SATAN_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/satan/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/satan/animations/flying-kick/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/satan/animations/falling-back-death/west/', 7, 8, false),
  death:  makeAnim('assets/characters/satan/animations/falling-back-death/west/', 7, 6, false),
}

export const SKELETON_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/Skeleton_on_fire/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/Skeleton_on_fire/animations/flying-kick/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/Skeleton_on_fire/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/Skeleton_on_fire/animations/falling-back-death/west/', 7, 6, false),
}

export const SEPPO_ENEMY_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/seppo/animations/breathing-idle/east/', 4, 4, true),
  attack: makeAnim('assets/characters/seppo/animations/high-kick/east/', 7, 10, false),
  hit:    makeAnim('assets/characters/seppo/animations/taking-punch/east/', 6, 8, false),
  death:  makeAnim('assets/characters/seppo/animations/falling-back-death/east/', 7, 6, false),
}

export const ALL_ANIM_SETS: AnimSet[] = [
  SEPPO_ANIMS_SOUTH, SEPPO_ANIMS_EAST, ISMO_ANIMS,
  CONSULTANT_1_ANIMS, CONSULTANT_2_ANIMS,
  ANGRY_CYCLIST_ANIMS, DRUNK_GUY_1_ANIMS, DRUNK_GUY_2_ANIMS,
  BLACK_METAL_ANIMS, BOUNCER_ANIMS, SHOPKEEPER_ANIMS, BARTENDER_ANIMS,
  PRIEST_ANIMS, JANITOR_ANIMS, GRAVEDIGGER_ANIMS,
  CULT_MEMBER_ANIMS, CULT_LEADER_ANIMS,
  POLICE_ANIMS, KARHU_OPERATOR_ANIMS,
  SATAN_ANIMS, SKELETON_ANIMS, SEPPO_ENEMY_ANIMS,
]

export function preloadAllAnims() {
  for (const set of ALL_ANIM_SETS) {
    for (const key in set) {
      const a = set[key]
      a.images = []
      for (let i = 0; i < a.frames; i++) {
        const img = new Image()
        img.src = a.path + `frame_${String(i).padStart(3, '0')}.png`
        a.images.push(img)
      }
    }
  }
}

/* ── Game Data ─────────────────────────────────── */

export const BEERS: Beer[] = [
  /* ── Common ───────────────────── */
  { id: 'hoppy_ipa',  name: 'Hoppy IPA',  img: 'assets/cards/drinks/hoppy_ipa.png',  color: 'tertiary',  buff: 'atk',  val: 7,  duration: 3, tier: 2, desc: '+ATK — dangerously hoppy' },
  { id: 'pale_ale',   name: 'Pale Ale',   img: 'assets/cards/drinks/pale_ale.png',   color: 'secondary', buff: 'both', val: 4,  duration: 3, tier: 2, desc: '+ATK & DEF — balanced & bright' },
  { id: 'lager',      name: 'Lager',      img: 'assets/cards/drinks/lager.png',      color: 'primary',   buff: 'block', val: 8, duration: 3, tier: 1, desc: '+BLOCK — crisp & defensive' },
  { id: 'wheat_beer', name: 'Wheat Beer', img: 'assets/cards/drinks/wheat_beer.png', color: 'primary',   buff: 'crit', val: 22, duration: 3, tier: 2, desc: '+CRIT — cloudy luck' },
  { id: 'porter',     name: 'Porter',     img: 'assets/cards/drinks/porter.png',     color: 'secondary', buff: 'def',  val: 6,  duration: 3, tier: 1, desc: '+DEF — smooth & heavy' },
  { id: 'stout',      name: 'Stout',      img: 'assets/cards/drinks/stout.png',      color: 'tertiary',  buff: 'atk',  val: 5,  duration: 4, tier: 3, desc: '+ATK — dark power' },
  { id: 'olvi',       name: 'Olvi',       img: 'assets/cards/drinks/olvi.png',       color: 'green-400', buff: 'regen', val: 5, duration: 3, tier: 2, desc: 'REGEN — heals each turn' },
  { id: 'sour',       name: 'Sour',       img: 'assets/cards/drinks/sour.png',       color: 'tertiary',  buff: 'thorns', val: 4, duration: 3, tier: 2, desc: 'THORNS — hurts attackers' },
  { id: 'karjala',    name: 'Karjala',    img: 'assets/cards/drinks/karjala.png',     color: 'secondary', buff: 'cleanse', val: 0, duration: 0, tier: 2, desc: 'CLEANSE — purge all debuffs' },
  { id: 'pilsner',    name: 'Pilsner',    img: 'assets/cards/drinks/pilsner.png',     color: 'primary',   buff: 'actions', val: 2, duration: 0, tier: 3, desc: '+2 ACTIONS — liquid energy' },
  { id: 'karhu',      name: 'Karhu',      img: 'assets/cards/drinks/karhu.png',       color: 'amber-400', buff: 'triple', val: 3, duration: 0, tier: 3, desc: '×3 DMG — next attack hits like a bear' },
  /* ── Uncommon ─────────────────── */
  { id: 'hoppy_ipa_u',  name: 'Nitro IPA',      img: 'assets/cards/drinks/hoppy_ipa.png',  color: 'tertiary',  buff: 'atk',   val: 10, duration: 4, tier: 2, desc: '+ATK — nitrogen-infused fury', rarity: 'uncommon' },
  { id: 'pale_ale_u',   name: 'Session Ale',     img: 'assets/cards/drinks/pale_ale.png',   color: 'secondary', buff: 'both',  val: 6,  duration: 4, tier: 2, desc: '+ATK & DEF — sessionably strong', rarity: 'uncommon' },
  { id: 'lager_u',      name: 'Export Lager',    img: 'assets/cards/drinks/lager.png',      color: 'primary',   buff: 'block', val: 12, duration: 4, tier: 2, desc: '+BLOCK — imported toughness', rarity: 'uncommon' },
  { id: 'wheat_beer_u', name: 'Hefeweizen',      img: 'assets/cards/drinks/wheat_beer.png', color: 'primary',   buff: 'crit',  val: 30, duration: 4, tier: 2, desc: '+CRIT — Bavarian precision', rarity: 'uncommon' },
  { id: 'porter_u',     name: 'Robust Porter',   img: 'assets/cards/drinks/porter.png',     color: 'secondary', buff: 'def',   val: 9,  duration: 4, tier: 2, desc: '+DEF — extra body, extra armor', rarity: 'uncommon' },
  { id: 'stout_u',      name: 'Oatmeal Stout',   img: 'assets/cards/drinks/stout.png',      color: 'tertiary',  buff: 'atk',   val: 7,  duration: 5, tier: 3, desc: '+ATK — thick as anger', rarity: 'uncommon' },
  { id: 'olvi_u',       name: 'Olvi Export',     img: 'assets/cards/drinks/olvi.png',       color: 'green-400', buff: 'regen', val: 7,  duration: 4, tier: 2, desc: 'REGEN — steady recovery', rarity: 'uncommon' },
  { id: 'sour_u',       name: 'Gose',            img: 'assets/cards/drinks/sour.png',       color: 'tertiary',  buff: 'thorns', val: 6, duration: 4, tier: 2, desc: 'THORNS — salty revenge', rarity: 'uncommon' },
  { id: 'karjala_u',    name: 'Karjala Export',  img: 'assets/cards/drinks/karjala.png',     color: 'secondary', buff: 'cleanse', val: 0, duration: 0, tier: 2, desc: 'CLEANSE — purge + 1t immunity', rarity: 'uncommon' },
  { id: 'pilsner_u',    name: 'Czech Pils',      img: 'assets/cards/drinks/pilsner.png',     color: 'primary',   buff: 'actions', val: 2, duration: 0, tier: 3, desc: '+2 ACTIONS — Bohemian rush', rarity: 'uncommon' },
  { id: 'karhu_u',      name: 'Karhu A',         img: 'assets/cards/drinks/karhu.png',       color: 'amber-400', buff: 'triple', val: 3, duration: 0, tier: 3, desc: '×3 DMG — sharper claws', rarity: 'uncommon' },
  /* ── Rare ─────────────────────── */
  { id: 'hoppy_ipa_r',  name: 'Imperial IPA',    img: 'assets/cards/drinks/hoppy_ipa.png',  color: 'tertiary',  buff: 'atk',   val: 13, duration: 5, tier: 3, desc: '+ATK — weapons-grade hops', rarity: 'rare' },
  { id: 'pale_ale_r',   name: 'Double Ale',      img: 'assets/cards/drinks/pale_ale.png',   color: 'secondary', buff: 'both',  val: 8,  duration: 5, tier: 3, desc: '+ATK & DEF — twice the brew', rarity: 'rare' },
  { id: 'lager_r',      name: 'Doppelbock',      img: 'assets/cards/drinks/lager.png',      color: 'primary',   buff: 'block', val: 15, duration: 5, tier: 3, desc: '+BLOCK — monastic fortitude', rarity: 'rare' },
  { id: 'wheat_beer_r', name: 'Weizenbock',      img: 'assets/cards/drinks/wheat_beer.png', color: 'primary',   buff: 'crit',  val: 38, duration: 5, tier: 3, desc: '+CRIT — divine wheat luck', rarity: 'rare' },
  { id: 'porter_r',     name: 'Baltic Porter',   img: 'assets/cards/drinks/porter.png',     color: 'secondary', buff: 'def',   val: 12, duration: 5, tier: 3, desc: '+DEF — cold sea steel', rarity: 'rare' },
  { id: 'stout_r',      name: 'Imperial Stout',  img: 'assets/cards/drinks/stout.png',      color: 'tertiary',  buff: 'atk',   val: 10, duration: 6, tier: 3, desc: '+ATK — brewed in darkness', rarity: 'rare' },
  { id: 'olvi_r',       name: 'Olvi Tuplapukki', img: 'assets/cards/drinks/olvi.png',       color: 'green-400', buff: 'regen', val: 10, duration: 5, tier: 3, desc: 'REGEN — Christmas miracle healing', rarity: 'rare' },
  { id: 'sour_r',       name: 'Lambic',          img: 'assets/cards/drinks/sour.png',       color: 'tertiary',  buff: 'thorns', val: 8, duration: 5, tier: 3, desc: 'THORNS — Belgian pain', rarity: 'rare' },
  { id: 'karjala_r',    name: 'Karjala Reserve',  img: 'assets/cards/drinks/karjala.png',    color: 'secondary', buff: 'cleanse', val: 0, duration: 0, tier: 3, desc: 'CLEANSE — purge + 2t immunity', rarity: 'rare' },
  { id: 'pilsner_r',    name: 'Urquell',         img: 'assets/cards/drinks/pilsner.png',     color: 'primary',   buff: 'actions', val: 3, duration: 0, tier: 3, desc: '+3 ACTIONS — the original pilsner', rarity: 'rare' },
  { id: 'karhu_r',      name: 'Karhu III',       img: 'assets/cards/drinks/karhu.png',       color: 'amber-400', buff: 'triple', val: 3, duration: 0, tier: 3, desc: '×3 DMG — apex predator strike', rarity: 'rare' },
]

export const FOODS: Food[] = [
  /* ── Common ───────────────────── */
  { id: 'burger',         name: 'Burger',         img: 'assets/cards/food/burger.png',         color: 'primary', restore: 'hp',   val: 22, tier: 1, desc: 'Restore HP — greasy but effective' },
  { id: 'kebab',          name: 'Kebab',          img: 'assets/cards/food/kebab.png',          color: 'primary', restore: 'hp',   val: 35, tier: 2, desc: 'Restore HP — the 2am lifesaver' },
  { id: 'makkaraperunat', name: 'Makkaraperunat', img: 'assets/cards/food/makkaraperunat.png', color: 'primary', restore: 'both', val: 18, tier: 3, desc: 'Restore HP — Finnish street fuel' },
  /* ── Uncommon ─────────────────── */
  { id: 'burger_u',         name: 'Double Burger',    img: 'assets/cards/food/burger.png',         color: 'primary', restore: 'hp',   val: 32, tier: 2, desc: 'Restore HP — twice the grease', rarity: 'uncommon' },
  { id: 'kebab_u',          name: 'Iskender Kebab',   img: 'assets/cards/food/kebab.png',          color: 'primary', restore: 'hp',   val: 50, tier: 2, desc: 'Restore HP — a cut above', rarity: 'uncommon' },
  { id: 'makkaraperunat_u', name: 'Mega Perunat',     img: 'assets/cards/food/makkaraperunat.png', color: 'primary', restore: 'both', val: 26, tier: 3, desc: 'Restore HP — supersized portion', rarity: 'uncommon' },
  /* ── Rare ─────────────────────── */
  { id: 'burger_r',         name: 'Gourmet Burger',   img: 'assets/cards/food/burger.png',         color: 'primary', restore: 'hp',   val: 42, tier: 3, desc: 'Restore HP — truffle-infused', rarity: 'rare' },
  { id: 'kebab_r',          name: 'King Kebab',       img: 'assets/cards/food/kebab.png',          color: 'primary', restore: 'hp',   val: 65, tier: 3, desc: 'Restore HP — legendary street meat', rarity: 'rare' },
  { id: 'makkaraperunat_r', name: 'Jumbo Perunat',    img: 'assets/cards/food/makkaraperunat.png', color: 'primary', restore: 'both', val: 35, tier: 3, desc: 'Restore HP — absolute unit portion', rarity: 'rare' },
]

export const TIER_LABELS = ['?', '★', '★★', '★★★']
export const TIER_COLORS = ['on-surface-variant', 'primary', 'secondary', 'tertiary']

/** Coin cost per item tier for the shop */
export const SHOP_PRICES: Record<number, number> = { 1: 15, 2: 30, 3: 50 }
export const RELIC_SHOP_PRICES: Record<RelicRarity, number> = { common: 40, uncommon: 70, rare: 120 }
export const WEAPON_SHOP_PRICE = 60

/** Card rarity helpers */
export const RARITY_LABELS: Record<CardRarity, string> = { common: '', uncommon: 'Uncommon', rare: 'Rare' }
export const RARITY_SHOP_MULT: Record<CardRarity, number> = { common: 1, uncommon: 1.8, rare: 1 }
/** Returns the pixel-border CSS class for a given card rarity */
export function getCardBorderClass(rarity?: CardRarity): string {
  if (rarity === 'rare') return 'pixel-border-rare'
  if (rarity === 'uncommon') return 'pixel-border-uncommon'
  return 'pixel-border'
}
/** Special buff types — these beers only drop from elites/bosses or shops */
const SPECIAL_BUFFS = new Set(['regen', 'thorns', 'cleanse', 'actions', 'triple'])
/** Common-only items for backward-compat helpers */
export const BEERS_COMMON = BEERS.filter(b => (!b.rarity || b.rarity === 'common') && !SPECIAL_BUFFS.has(b.buff))
export const FOODS_COMMON = FOODS.filter(f => !f.rarity || f.rarity === 'common')
/** Normal drop pool (all rarities but excludes special beers) */
export const BEERS_NORMAL = BEERS.filter(b => !SPECIAL_BUFFS.has(b.buff))
/** Special beers only (for elite/boss drops) */
export const BEERS_SPECIAL = BEERS.filter(b => SPECIAL_BUFFS.has(b.buff))

/* ── Unlock Definitions ────────────────────── */

export type UnlockConditionType = 'bestLevel' | 'highScore' | 'totalWins'

export interface UnlockDef {
  id: string
  name: string
  desc: string
  icon: string
  conditionType: UnlockConditionType
  conditionValue: number
  /** IDs of items this unlock gates (relics, beers, weapons) */
  unlockIds: string[]
}

export const UNLOCKS: UnlockDef[] = [
  // ── Level milestones ──
  {
    id: 'unlock_lv2', name: 'Street Veteran', desc: 'Reach Level 2',
    icon: 'military_tech', conditionType: 'bestLevel', conditionValue: 1,
    unlockIds: ['triple_beer', 'beer_dmg', 'beer_block', 'desperation', 'tenth_strike', 'sour', 'sour_u'],
  },
  {
    id: 'unlock_lv3', name: 'Bar Brawler', desc: 'Reach Level 3',
    icon: 'local_bar', conditionType: 'bestLevel', conditionValue: 2,
    unlockIds: ['karjala', 'karjala_u', 'bat', 'cone', 'tap'],
  },
  {
    id: 'unlock_lv4', name: 'Night Crawler', desc: 'Reach Level 4',
    icon: 'dark_mode', conditionType: 'bestLevel', conditionValue: 3,
    unlockIds: ['pilsner', 'pilsner_u', 'bonus_hp_unc', 'bonus_atk_unc', 'bonus_def_unc'],
  },
  {
    id: 'unlock_lv5', name: 'Hellraiser', desc: 'Reach Level 5',
    icon: 'whatshot', conditionType: 'bestLevel', conditionValue: 4,
    unlockIds: ['karhu', 'karhu_u', 'crowbar', 'axe', 'chain'],
  },
  // ── Score milestones ──
  {
    id: 'unlock_score_1k', name: 'Rising Star', desc: 'Score 1,000+ in a run',
    icon: 'star', conditionType: 'highScore', conditionValue: 1000,
    unlockIds: ['perma_beer', 'lifesteal'],
  },
  {
    id: 'unlock_score_3k', name: 'Legend', desc: 'Score 3,000+ in a run',
    icon: 'emoji_events', conditionType: 'highScore', conditionValue: 3000,
    unlockIds: ['overkill', 'glass_cannon', 'kegsword', 'pitchfork', 'chalice'],
  },
  {
    id: 'unlock_score_5k', name: 'Unstoppable', desc: 'Score 5,000+ in a run',
    icon: 'shield_with_heart', conditionType: 'highScore', conditionValue: 5000,
    unlockIds: ['debuff_immune', 'coin_power'],
  },
  // ── Win milestone ──
  {
    id: 'unlock_win', name: 'Champion', desc: 'Win your first run',
    icon: 'workspace_premium', conditionType: 'totalWins', conditionValue: 1,
    unlockIds: ['olvi_r', 'sour_r', 'karjala_r', 'pilsner_r', 'karhu_r'],
  },
]

/** Build a Set of all item IDs that require unlocking */
const ALL_LOCKED_IDS = new Set(UNLOCKS.flatMap(u => u.unlockIds))

/** Check which unlocks are earned given meta stats */
export function getEarnedUnlocks(meta: { bestLevel: number; highScore: number; totalWins: number }): Set<string> {
  const earned = new Set<string>()
  for (const u of UNLOCKS) {
    let met = false
    if (u.conditionType === 'bestLevel') met = meta.bestLevel >= u.conditionValue
    else if (u.conditionType === 'highScore') met = meta.highScore >= u.conditionValue
    else if (u.conditionType === 'totalWins') met = meta.totalWins >= u.conditionValue
    if (met) earned.add(u.id)
  }
  return earned
}

/** Get all unlocked item IDs from a set of earned unlock IDs */
export function getUnlockedItemIds(earnedUnlockIds: Set<string>): Set<string> {
  const items = new Set<string>()
  for (const u of UNLOCKS) {
    if (earnedUnlockIds.has(u.id)) {
      for (const id of u.unlockIds) items.add(id)
    }
  }
  return items
}

/** Check if an item ID is available (either not locked at all, or unlocked) */
export function isItemUnlocked(itemId: string, unlockedItems: Set<string>): boolean {
  if (!ALL_LOCKED_IDS.has(itemId)) return true // not gated
  return unlockedItems.has(itemId)
}

/** Reverse lookup: item ID → unlock definition that gates it (or undefined if not gated) */
export function getUnlockForItem(itemId: string): UnlockDef | undefined {
  return UNLOCKS.find(u => u.unlockIds.includes(itemId))
}

export const SHOPKEEPER_FIGHT_DATA = {
  name: 'Shopkeeper',
  portrait: 'assets/characters/shopkeeper/rotations/south.png',
  anims: SHOPKEEPER_ANIMS,
  lore: 'Behind that friendly smile is a man who\'s fought off a thousand five-finger discounts.',
  hp: 150, atk: 24, def: 12, xp: 0, loot: 0,
}

export const WEAPONS: Weapon[] = [
  { id: 'ashtray',    name: 'Pub Ashtray',      atk: 2,  lore: 'Still warm. Goes well with a pint.' },
  { id: 'glass',      name: 'Pint Glass',        atk: 4,  lore: 'Still has a finger of beer in it.' },
  { id: 'bottle',     name: 'Beer Bottle',       atk: 6,  lore: 'Heavier when full. Messier when not.' },
  { id: 'cue',        name: 'Pool Cue',          atk: 9,  lore: 'Borrowed from Table 4. Now overdue.' },
  { id: 'pipe',       name: 'Iron Pipe',         atk: 12, lore: 'Found in the pub cellar.' },
  { id: 'barstool',   name: 'Bar Stool',         atk: 15, lore: 'Three legs and zero chill.' },
  { id: 'bat',        name: 'Baseball Bat',      atk: 18, lore: 'Left behind after a match.' },
  { id: 'cone',       name: 'Traffic Cone',      atk: 21, lore: 'Liberated from a road works site.' },
  { id: 'tap',        name: 'Beer Tap Handle',   atk: 24, lore: 'Ripped from the bar itself.' },
  { id: 'crowbar',    name: 'Crowbar',           atk: 27, lore: 'Left by a plumber. His loss.' },
  { id: 'axe',        name: 'Fire Axe',          atk: 31, lore: 'From the fire cabinet. Technically borrowed.' },
  { id: 'chain',      name: 'Bike Chain',        atk: 35, lore: "Unhooked from a Jopo. Don't tell the owner." },
  { id: 'kegsword',   name: 'Keg Saber',         atk: 40, lore: 'Forged from pressurised steel. Legendary.' },
  { id: 'pitchfork',  name: 'Pitchfork',         atk: 46, lore: 'Still warm. Possibly infernal.' },
  { id: 'chalice',    name: 'Holy Chalice',      atk: 54, lore: 'Stolen from the altar. Fizzes strangely.' },
]

export const BLACK_METAL_NAMES = [
  'Abbath', 'Varg', 'Blargh', 'Lord Satanacchia', 'Euronymous',
  'Inferno Skull', 'Hellstorm', 'Voidwalker',
]

export const CONSULTANT_TITLES = [
  'Junior Data Analyst',
  'Data Engineer',
  'HR Manager',
  'Scrum Master',
  'Project Manager',
]

export const LEVEL_ENEMIES: EnemyTemplate[][] = [
  /* Level 1 — Office */
  [
    { name: 'Consultant', portrait: 'assets/characters/consultant_1/rotations/south.png', anims: CONSULTANT_1_ANIMS, lore: 'Slides first. Questions later.', hp: 62, atk: 13, def: 4, xp: 20, loot: 0.24, randomNames: CONSULTANT_TITLES, traits: ['micro_manager'] },
    { name: 'Consultant', portrait: 'assets/characters/consultant_2/rotations/south.png', anims: CONSULTANT_2_ANIMS, lore: 'Booked this conflict as a recurring ceremony.', hp: 68, atk: 14, def: 5, xp: 24, loot: 0.26, randomNames: CONSULTANT_TITLES, traits: ['micro_manager'] },
  ],

  // Boss is always the first fight — spawned specially in useGameState
  /* Level 2 — Park */
  [
    { name: 'Cyclist', portrait: 'assets/characters/angry_cyclist/rotations/south.png', anims: ANGRY_CYCLIST_ANIMS, lore: 'Rings the bell like it is a battle cry.', hp: 96, atk: 21, def: 8, xp: 36, loot: 0.33, traits: ['helmet'] },
    { name: 'Drunk Guy', portrait: 'assets/characters/drunk_guy_1/rotations/south.png', anims: DRUNK_GUY_1_ANIMS, lore: 'Friendly until someone looks at his can.', hp: 109, atk: 23, def: 8, xp: 41, loot: 0.35, traits: ['drink_steal'] },
  ],
  /* Level 3 — Street */
  [
    { name: 'Drunk Guy', portrait: 'assets/characters/drunk_guy_2/rotations/south.png', anims: DRUNK_GUY_2_ANIMS, lore: 'Promises this is definitely his last one.', hp: 140, atk: 29, def: 11, xp: 54, loot: 0.39, traits: ['drink_steal'] },
    { name: '_BM_', portrait: 'assets/characters/black_metal_musician/rotations/south.png', anims: BLACK_METAL_ANIMS, lore: 'Screams in a key that doesn\'t exist.', hp: 153, atk: 31, def: 12, xp: 61, loot: 0.4, randomName: true, traits: ['dark_scream'] },
  ],
  /* Level 4 — Bar */
  [
    { name: '_BM_', portrait: 'assets/characters/black_metal_musician/rotations/south.png', anims: BLACK_METAL_ANIMS, lore: 'His warm-up vocal drill sounds like a chainsaw.', hp: 172, atk: 34, def: 13, xp: 70, loot: 0.42, randomName: true, traits: ['dark_scream'] },
    { name: 'Bouncer', portrait: 'assets/characters/bouncer/rotations/south.png', anims: BOUNCER_ANIMS, lore: 'Built like a fridge and equally conversational.', hp: 188, atk: 36, def: 15, xp: 78, loot: 0.45, traits: ['iron_body'] },
    { name: 'Consultant', portrait: 'assets/characters/consultant_2/rotations/south.png', anims: CONSULTANT_2_ANIMS, lore: 'Trying to retrospective this whole evening.', hp: 161, atk: 33, def: 14, xp: 68, loot: 0.41, randomNames: CONSULTANT_TITLES, traits: ['micro_manager'] },
  ],
  /* Level 5 — Church */
  [
    { name: 'Priest', portrait: 'assets/characters/Priest/rotations/south.png', anims: PRIEST_ANIMS, lore: 'Forgiveness is off the table. So is mercy.', hp: 210, atk: 40, def: 16, xp: 88, loot: 0.46, traits: ['holy_smite'] },
    { name: 'Janitor', portrait: 'assets/characters/janitor/rotations/south.png', anims: JANITOR_ANIMS, lore: 'Cleans up messes. Tonight, you\'re the mess.', hp: 195, atk: 38, def: 17, xp: 82, loot: 0.44, traits: ['slippery_floor'] },
    { name: 'Gravedigger', portrait: 'assets/characters/Gravedigger/rotations/south.png', anims: GRAVEDIGGER_ANIMS, lore: 'Already measured you for a plot.', hp: 225, atk: 42, def: 15, xp: 92, loot: 0.48, traits: ['grave_chill'] },
  ],
  /* Level 6 — Basement */
  [
    { name: 'Cult Member', portrait: 'assets/characters/cult_member/rotations/south.png', anims: CULT_MEMBER_ANIMS, lore: 'Chants something unholy. Kicks even harder.', hp: 250, atk: 46, def: 18, xp: 100, loot: 0.48, traits: ['self_sacrifice'] },
  ],
  /* Level 7 — Meadow */
  [
    { name: 'Police Officer', portrait: 'assets/characters/police_man/rotations/south.png', anims: POLICE_ANIMS, lore: 'Stop resisting. He hasn\'t even started yet.', hp: 280, atk: 50, def: 20, xp: 110, loot: 0.5, traits: ['tazer'] },
  ],
  /* Level 8 — Hell */
  [
    { name: 'Satan', portrait: 'assets/characters/satan/rotations/south.png', anims: SATAN_ANIMS, lore: 'The Prince of Darkness moonlights as a bouncer down here.', hp: 310, atk: 56, def: 22, xp: 125, loot: 0.52, traits: ['hellfire', 'low_hp_atk_boost'] },
    { name: 'Skeleton', portrait: 'assets/characters/Skeleton_on_fire/rotations/south.png', anims: SKELETON_ANIMS, lore: 'On fire and furious. Calcium-enriched rage.', hp: 270, atk: 52, def: 19, xp: 115, loot: 0.5, traits: ['bone_explosion'] },
  ],
]

export const LEVEL_NAMES = ['Office', 'Park', 'Street', 'Ravintola Kulma', 'Church', 'Basement', 'Meadow', 'Hell']
export const LEVEL_BGS = ['assets/levels/office.png', 'assets/levels/park.png', 'assets/levels/street.png', 'assets/levels/bar.png', 'assets/levels/cucrh.png', 'assets/levels/basement.png', 'assets/levels/meadow.png', 'assets/levels/hell.png']

/* ── Bestiary Data ─────────────────────────── */

export interface BestiaryEntry {
  name: string
  portrait: string
  lore: string
  hp: number
  atk: number
  def: number
  isBoss: boolean
  level: number
  traits: EnemyTrait[]
}

export const ROUNDS_PER_LEVEL = 5
export const PLAYER_ACTIONS = 3
export const ENEMY_ACTIONS = 2
export const NUM_ROUTES_PER_LEVEL = 3

/** Which levels end with a shared boss fight (index → boss type). */
export function levelBossType(lvIdx: number): 'boss_first' | 'boss' | null {
  if (lvIdx === 0) return 'boss_first'
  if (lvIdx >= 1 && lvIdx <= LEVEL_ENEMIES.length - 1) return 'boss'
  return null
}

/**
 * Generate random routes for all levels as a tree.
 * Each level has a shared start node (fight) and optionally a shared boss end node.
 * Routes contain only fights / rests — bosses are handled as shared endpoints.
 */
export function generateAllRoutes(): import('./types').LevelRoute[][] {
  const totalLevels = LEVEL_ENEMIES.length
  const allRoutes: import('./types').LevelRoute[][] = []

  for (let lvIdx = 0; lvIdx < totalLevels; lvIdx++) {
    const routes: import('./types').LevelRoute[] = []

    for (let r = 0; r < NUM_ROUTES_PER_LEVEL; r++) {
      const nodes: import('./types').MapNode[] = []
      // 5–7 nodes per route
      const routeLen = 5 + Math.floor(Math.random() * 3)

      // 50% chance of a rest stop, never at position 0
      const hasRest = Math.random() < 0.5
      const restIdx = hasRest ? 1 + Math.floor(Math.random() * (routeLen - 1)) : -1

      // ~30% chance of one elite fight, never at position 0 or rest slot
      const hasElite = Math.random() < 0.3
      let eliteIdx = -1
      if (hasElite) {
        const candidates = Array.from({ length: routeLen }, (_, i) => i).filter(i => i !== 0 && i !== restIdx)
        if (candidates.length) eliteIdx = candidates[Math.floor(Math.random() * candidates.length)]
      }

      // ~25% chance of a treasure node, never at position 0, rest, or elite slot
      const hasTreasure = Math.random() < 0.25
      let treasureIdx = -1
      if (hasTreasure) {
        const candidates = Array.from({ length: routeLen }, (_, i) => i).filter(i => i !== 0 && i !== restIdx && i !== eliteIdx)
        if (candidates.length) treasureIdx = candidates[Math.floor(Math.random() * candidates.length)]
      }

      // ~35% chance of a shop node, never at position 0 or taken slots
      const hasShop = Math.random() < 0.35
      let shopIdx = -1
      if (hasShop) {
        const candidates = Array.from({ length: routeLen }, (_, i) => i).filter(i => i !== 0 && i !== restIdx && i !== eliteIdx && i !== treasureIdx)
        if (candidates.length) shopIdx = candidates[Math.floor(Math.random() * candidates.length)]
      }

      // Mystery nodes — 1-2 per route, replace remaining fight slots
      const takenIdxs = new Set([0, restIdx, eliteIdx, treasureIdx, shopIdx].filter(i => i >= 0))
      const fightSlots = Array.from({ length: routeLen }, (_, i) => i).filter(i => !takenIdxs.has(i))
      const mysteryCount = Math.min(1 + Math.floor(Math.random() * 2), fightSlots.length)
      const mysteryIdxs = new Set<number>()
      const remaining = [...fightSlots]
      for (let m = 0; m < mysteryCount && remaining.length; m++) {
        const idx = Math.floor(Math.random() * remaining.length)
        mysteryIdxs.add(remaining.splice(idx, 1)[0])
      }

      for (let i = 0; i < routeLen; i++) {
        const type = i === restIdx ? 'rest' : i === eliteIdx ? 'elite' : i === treasureIdx ? 'treasure' : i === shopIdx ? 'shop' : mysteryIdxs.has(i) ? 'mystery' : 'fight'
        nodes.push({ type, done: false })
      }

      routes.push(nodes)
    }
    allRoutes.push(routes)
  }
  return allRoutes
}

export const ISMO_FIRST_FIGHT = {
  name: 'The Boss',
  portrait: 'assets/characters/ismo/rotations/south.png',
  anims: ISMO_ANIMS,
  lore: 'Called Seppo\'s feedback "insubordination" and hit print on the termination letter.',
  hp: 156, atk: 22, def: 9, xp: 60, loot: 0.35,
  traits: ['boss_weak_frail'] as EnemyTrait[],
}

export const PARK_BOSS_DATA = {
  name: 'Angry Blue-Collar Man',
  portrait: 'assets/characters/shopkeeper/rotations/south.png',
  anims: SHOPKEEPER_ANIMS,
  lore: 'Took one too many complaints. Now he\'s the one filing grievances — with his fists.',
  hp: 220, atk: 28, def: 12, xp: 120, loot: 0.4,
  traits: ['boss_vulnerable'] as EnemyTrait[],
}

export const STREET_BOSS_DATA = {
  name: 'The Satanist',
  portrait: 'assets/characters/black_metal_musician/rotations/south.png',
  anims: BLACK_METAL_ANIMS,
  lore: 'He sold his soul for a killer riff — and killer fists.',
  hp: 320, atk: 35, def: 14, xp: 200, loot: 0.45,
  traits: ['satanist_rage'] as EnemyTrait[],
}
export const BAR_BOSS_DATA = {
  name: 'The Bartender',
  portrait: 'assets/characters/bartender/rotations/south.png',
  anims: BARTENDER_ANIMS,
  lore: 'Last call was an hour ago. Now he\'s calling the shots.',
  hp: 450, atk: 44, def: 18, xp: 350, loot: 0.5,
  traits: ['bartender_poison'] as EnemyTrait[],
}

export const CHURCH_BOSS_DATA = {
  name: 'The High Priest',
  portrait: 'assets/characters/Priest/rotations/south.png',
  anims: PRIEST_ANIMS,
  lore: 'His sermons hit different. Mostly your face.',
  hp: 520, atk: 48, def: 20, xp: 420, loot: 0.5,
  traits: ['high_priest_wrath'] as EnemyTrait[],
}

export const BASEMENT_BOSS_DATA = {
  name: 'The Cult Leader',
  portrait: 'assets/characters/cult_leader/rotations/south.png',
  anims: CULT_LEADER_ANIMS,
  lore: 'The ritual is complete. You are the final sacrifice.',
  hp: 600, atk: 54, def: 22, xp: 480, loot: 0.55,
  traits: ['cult_leader_drain'] as EnemyTrait[],
}

export const MEADOW_BOSS_DATA = {
  name: 'Karhu Special Operator',
  portrait: 'assets/characters/karhu_special_operator/rotations/south.png',
  anims: KARHU_OPERATOR_ANIMS,
  lore: 'Trained in the woods. Fights like a bear. Smells like one too.',
  hp: 700, atk: 60, def: 24, xp: 550, loot: 0.55,
  traits: ['karhu_fury'] as EnemyTrait[],
}

export const HELL_BOSS_DATA = {
  name: 'Seppo',
  portrait: 'assets/characters/seppo/rotations/south.png',
  anims: SEPPO_ENEMY_ANIMS,
  lore: 'You stare into the abyss and see… yourself. The final fight is with who you\'ve become.',
  hp: 800, atk: 65, def: 26, xp: 666, loot: 0.6,
  traits: ['mirror_self'] as EnemyTrait[],
}

const BOSS_BY_LEVEL = [
  ISMO_FIRST_FIGHT,
  PARK_BOSS_DATA,
  STREET_BOSS_DATA,
  BAR_BOSS_DATA,
  CHURCH_BOSS_DATA,
  BASEMENT_BOSS_DATA,
  MEADOW_BOSS_DATA,
  HELL_BOSS_DATA,
]

export const BESTIARY: BestiaryEntry[] = (() => {
  const entries: BestiaryEntry[] = []
  for (let lvIdx = 0; lvIdx < LEVEL_ENEMIES.length; lvIdx++) {
    for (const e of LEVEL_ENEMIES[lvIdx]) {
      const displayName = e.name === '_BM_' ? 'Black Metal Musician' : e.name
      if (!entries.some(x => x.name === displayName && x.level === lvIdx))
        entries.push({ name: displayName, portrait: e.portrait, lore: e.lore, hp: e.hp, atk: e.atk, def: e.def, isBoss: false, level: lvIdx, traits: e.traits ?? [] })
    }
    const boss = BOSS_BY_LEVEL[lvIdx]
    if (boss) entries.push({ name: boss.name, portrait: boss.portrait, lore: boss.lore, hp: boss.hp, atk: boss.atk, def: boss.def, isBoss: true, level: lvIdx, traits: (boss as { traits?: EnemyTrait[] }).traits ?? [] })
  }
  return entries
})()

export const BOSS_DATA = {
  name: 'THE BOSS',
  portrait: 'assets/characters/consultant_1/rotations/south.png',
  anims: CONSULTANT_1_ANIMS,
  lore: 'Seppo\'s boss. Fired him for calling the new processes stupid. Now he\'s back for round two.',
  hp: 585,
  atk: 50,
  def: 22,
  xp: 500,
  loot: 0,
  phases: [
    { threshold: 0.6, msg: 'Boss snaps: "You\'re still underperforming, Seppo!"', atkBonus: 0 } as BossPhase,
    { threshold: 0.3, msg: 'Boss screams: "THIS IS MY TEAM AND YOU ARE OFF THE PROJECT!"', atkBonus: 12 } as BossPhase,
  ],
}

export const UPGRADES: Upgrade[] = [
  { id: 'hp',    icon: 'favorite',              color: 'error',     label: '+15 Max HP',    desc: 'Toughen up. More health means more drinks.',  apply: (p) => { p.maxHp += 15; p.hp = Math.min(p.hp + 15, p.maxHp) } },
  { id: 'atk',   icon: 'swords',                color: 'tertiary',  label: '+5 ATK',        desc: 'Hit harder. Enough said.',                    apply: (p) => { p.baseAtk += 5 } },
  { id: 'def',   icon: 'shield',                color: 'secondary', label: '+4 DEF',        desc: 'Thicker skin from years of bar brawls.',      apply: (p) => { p.baseDef += 4 } },
  { id: 'crit',  icon: 'bolt',                  color: 'primary',   label: '+8% Crit',      desc: 'Sharper instincts. More devastating blows.',  apply: (p) => { p.critBonus = (p.critBonus || 0) + 8 } },
  { id: 'regen', icon: 'self_improvement',       color: 'primary',   label: '+3 HP Regen',   desc: 'Recover 3 HP after every fight.',             apply: (p) => { p.regenBonus = (p.regenBonus || 0) + 3 } },
  { id: 'fury',  icon: 'local_fire_department',  color: 'tertiary',  label: '+3 ATK & DEF',  desc: 'Balanced power. A veteran\'s choice.',        apply: (p) => { p.baseAtk += 3; p.baseDef += 3 } },
]

/* ── Relics ─────────────────────────────────────── */

export const RELICS: Relic[] = [
  // Common
  { id: 'auto_block',      name: 'Stone Skin Amulet',   rarity: 'common',   icon: 'shield_with_heart', desc: 'End turn without blocking → gain 6 block.' },
  { id: 'beer_start',      name: 'Lucky Flask',         rarity: 'common',   icon: 'liquor',            desc: 'Start each combat with +1 random Beer effect.' },
  { id: 'beer_def',        name: 'Liquid Armor',        rarity: 'common',   icon: 'local_drink',       desc: '+1 DEF each time you drink a Beer (per fight).' },
  { id: 'bonus_hp',        name: 'Tough Hide',          rarity: 'common',   icon: 'favorite',          desc: '+10 Max HP.' },
  { id: 'bonus_atk',       name: 'Iron Knuckles',       rarity: 'common',   icon: 'swords',            desc: '+5 ATK.' },
  { id: 'bonus_def',       name: 'Padded Jacket',       rarity: 'common',   icon: 'shield',            desc: '+5 DEF.' },
  { id: 'treasure_heal',   name: 'Scavenger\'s Charm',  rarity: 'common',   icon: 'health_and_safety', desc: 'Gain 10 HP when opening a treasure.' },
  { id: 'first_strike',    name: 'Sucker Punch',        rarity: 'common',   icon: 'back_hand',         desc: 'First attack each combat deals +10 bonus damage.' },
  { id: 'tough_start',     name: 'Taped Fists',         rarity: 'common',   icon: 'sports_mma',        desc: 'Start each combat with 10 block.' },
  { id: 'food_bonus',      name: 'Lead Belly',          rarity: 'common',   icon: 'restaurant',        desc: 'Food items restore 5 extra HP.' },
  { id: 'rest_bonus',      name: 'Power Nap',           rarity: 'common',   icon: 'bed',               desc: 'Rest heals an extra 15% max HP.' },
  { id: 'crit_ring',       name: 'Lucky Ring',          rarity: 'common',   icon: 'circle',            desc: '+5% crit chance.' },
  // Uncommon
  { id: 'triple_beer',     name: 'Brewer\'s Blessing',  rarity: 'uncommon', icon: 'sports_bar',        desc: 'Every 3rd Beer gives double effect.' },
  { id: 'beer_dmg',        name: 'Drunken Fist',        rarity: 'uncommon', icon: 'local_fire_department', desc: '+3 ATK per Beer consumed this fight.' },
  { id: 'beer_block',      name: 'Hop Shield',          rarity: 'uncommon', icon: 'verified_user',     desc: 'Gain block equal to 50% of Beer stat bonuses.' },
  { id: 'desperation',     name: 'Cornered Rat',        rarity: 'uncommon', icon: 'crisis_alert',      desc: 'HP < 30% → 4 actions per turn.' },
  { id: 'bonus_hp_unc',    name: 'Bear Gut',            rarity: 'uncommon', icon: 'favorite',          desc: '+15 Max HP.' },
  { id: 'bonus_atk_unc',   name: 'Brass Knuckles',      rarity: 'uncommon', icon: 'swords',            desc: '+10 ATK.' },
  { id: 'bonus_def_unc',   name: 'Riot Vest',           rarity: 'uncommon', icon: 'shield',            desc: '+10 DEF.' },
  { id: 'tenth_strike',    name: 'Momentum',            rarity: 'uncommon', icon: 'speed',             desc: 'Every 10th attack deals double damage.' },
  // Rare
  { id: 'perma_beer',      name: 'Eternal Buzz',        rarity: 'rare',     icon: 'all_inclusive',     desc: 'Beer effects are 50% strength but permanent for the run.' },
  { id: 'lifesteal',       name: 'Vampiric Grip',       rarity: 'rare',     icon: 'bloodtype',         desc: 'Heal 10% of damage dealt.' },
  { id: 'debuff_immune',   name: 'Finnish Sisu',        rarity: 'rare',     icon: 'local_police',      desc: 'Immune to debuffs.' },
  { id: 'overkill',        name: 'Overkill',            rarity: 'rare',     icon: 'whatshot',          desc: 'Excess damage from killing an enemy carries to the next fight as bonus ATK.' },
  { id: 'coin_power',      name: 'Greed is Good',       rarity: 'rare',     icon: 'paid',             desc: '+1 ATK for every 20 coins held.' },
  { id: 'glass_cannon',    name: 'Glass Cannon',        rarity: 'rare',     icon: 'bolt',             desc: '+25 ATK but -30% max HP.' },
]

export function hasRelic(p: Player, id: string): boolean {
  return p.relics.some(r => r.id === id)
}

/* ── Events ──────────────────────────────────── */

export const GAME_EVENTS: GameEvent[] = [
  // ── TRADE-OFFS (must pick A or B) ──
  {
    id: 'shady_dealer',
    name: 'Shady Dealer',
    desc: 'A suspicious figure in a trench coat opens his jacket, revealing flasks and coin pouches.',
    icon: 'person_alert',
    bg: 'assets/event_bg/shady_dealer_bg.png',
    category: 'tradeoff',
    choices: [
      { label: '3 Random Beers', desc: 'Lose 50 coins', icon: 'sports_bar', color: 'primary' },
      { label: '80 Coins', desc: 'Take 15 damage', icon: 'paid', color: 'tertiary' },
    ],
  },
  {
    id: 'back_alley_gym',
    name: 'Back Alley Gym',
    desc: 'A makeshift gym with rusty weights and a punching bag. A grizzled trainer offers his services.',
    icon: 'fitness_center',
    bg: 'assets/event_bg/back_alley_gym_bg.png',
    category: 'tradeoff',
    choices: [
      { label: '+15 Max HP', desc: 'Lose all buffs', icon: 'favorite', color: 'error' },
      { label: '+5 ATK & +5 DEF', desc: 'Take 20 damage', icon: 'swords', color: 'tertiary' },
    ],
  },
  {
    id: 'fork_in_alley',
    name: 'Fork in the Alley',
    desc: 'Two paths diverge behind a dumpster. One smells of hops, the other glints with something shiny.',
    icon: 'fork_right',
    bg: 'assets/event_bg/for_in_the_alley_bg.png',
    category: 'tradeoff',
    choices: [
      { label: 'Random Relic', desc: 'Lose 3 beers', icon: 'diamond', color: 'secondary' },
      { label: '5 Random Beers', desc: 'Lose a relic', icon: 'sports_bar', color: 'primary' },
    ],
  },
  {
    id: 'street_musician',
    name: "Street Musician's Deal",
    desc: 'A busker with a battered guitar offers you a deal. His eyes gleam with mischief.',
    icon: 'music_note',
    bg: 'assets/event_bg/street_musicans_deal_bg.png',
    category: 'tradeoff',
    choices: [
      { label: 'Clear Debuffs + Immunity', desc: 'Lose 25 coins', icon: 'local_police', color: 'secondary' },
      { label: 'Guitar Weapon (+20 ATK)', desc: 'Lose 30 max HP', icon: 'swords', color: 'tertiary' },
    ],
  },
  // ── FREE UPGRADES (both good, pick one) ──
  {
    id: 'abandoned_backpack',
    name: 'Abandoned Backpack',
    desc: 'A dusty backpack sits against a wall. It\'s still zipped shut. Could be anything inside.',
    icon: 'backpack',
    bg: 'assets/event_bg/abandoned_backpack_bg.png',
    category: 'upgrade',
    choices: [
      { label: '2 Foods + 1 Beer', desc: 'A packed lunch', icon: 'restaurant', color: 'primary' },
      { label: '40 Coins', desc: 'Cold hard cash', icon: 'paid', color: 'tertiary' },
    ],
  },
  {
    id: 'old_sauna',
    name: 'Old Sauna',
    desc: 'Steam billows from a half-collapsed sauna. The heat feels... restorative.',
    icon: 'hot_tub',
    bg: 'assets/event_bg/olda_sauna_bg.png',
    category: 'upgrade',
    choices: [
      { label: 'Heal to Full HP', desc: 'A proper Finnish löyly', icon: 'favorite', color: 'error' },
      { label: '+3 DEF Permanently', desc: 'Skin hardened by heat', icon: 'shield', color: 'secondary' },
    ],
  },
  {
    id: 'lucky_find',
    name: 'Lucky Find',
    desc: 'Something shiny catches Seppo\'s eye under a bench. Today might be his lucky day.',
    icon: 'stars',
    bg: 'assets/event_bg/lucky_find_bg.png',
    category: 'upgrade',
    choices: [
      { label: 'Random Common Relic', desc: 'A mysterious trinket', icon: 'diamond', color: 'secondary' },
      { label: 'Random Weapon Upgrade', desc: 'A discarded weapon', icon: 'swords', color: 'tertiary' },
    ],
  },
  // ── OPTIONAL (A, B, or Skip) ──
  {
    id: 'cursed_pint',
    name: 'Cursed Pint',
    desc: 'A glowing pint glass sits on a park bench. It hums with strange energy.',
    icon: 'local_bar',
    bg: 'assets/event_bg/cursed_pint_bg.png',
    category: 'optional',
    choices: [
      { label: '+12 ATK', desc: 'Alcohol poison next fight', icon: 'bolt', color: 'tertiary' },
      { label: 'Heal 40% HP', desc: 'Drink the safe half', icon: 'favorite', color: 'error' },
      { label: 'Walk Away', desc: 'Better safe than sorry', icon: 'directions_walk', color: 'secondary' },
    ],
  },
  {
    id: 'suspicious_vending',
    name: 'Suspicious Vending Machine',
    desc: 'A vending machine flickers in a dark alley. The buttons are labeled with skulls and stars.',
    icon: 'redeem',
    bg: 'assets/event_bg/vending_machine_bg.png',
    category: 'optional',
    choices: [
      { label: 'Press the Skull Button', desc: '50% rare relic / 50% take 30 dmg', icon: 'casino', color: 'tertiary' },
      { label: 'Press the Star Button', desc: 'Lose 40 coins, gain 3 foods', icon: 'restaurant', color: 'primary' },
      { label: 'Walk Away', desc: 'Machines can\'t be trusted', icon: 'directions_walk', color: 'secondary' },
    ],
  },
  {
    id: 'drunk_philosopher',
    name: 'Drunk Philosopher',
    desc: 'A man in a toga stumbles toward you, mumbling about the meaning of strength.',
    icon: 'psychology',
    bg: 'assets/event_bg/drunk_philosopher_bg.png',
    category: 'optional',
    choices: [
      { label: '+8 ATK', desc: 'Lose 25% max HP', icon: 'swords', color: 'tertiary' },
      { label: '2 Foods', desc: 'Lose 30 coins', icon: 'restaurant', color: 'primary' },
      { label: 'Ignore Him', desc: 'Not worth the risk', icon: 'directions_walk', color: 'secondary' },
    ],
  },
  {
    id: 'lottery_booth',
    name: 'Lottery Booth',
    desc: 'A rickety booth with a spinning wheel. The prizes look suspicious but tempting.',
    icon: 'confirmation_number',
    bg: 'assets/event_bg/lottery_booth_bg.png',
    category: 'optional',
    choices: [
      { label: 'Spin the Wheel', desc: 'Lose 20 coins — 33% gain 150 / 67% nothing', icon: 'casino', color: 'tertiary' },
      { label: 'Sell Your Blood', desc: '60 coins, take 25 damage', icon: 'paid', color: 'error' },
      { label: 'Walk Past', desc: 'Gambling is for fools', icon: 'directions_walk', color: 'secondary' },
    ],
  },
  {
    id: 'risky_backpack',
    name: 'Abandoned Backpack (Risky)',
    desc: 'Another backpack — but this one is locked with a strange clasp. It feels heavier.',
    icon: 'backpack',
    bg: 'assets/event_bg/abandoned_backpack_risky_bg.png',
    category: 'optional',
    choices: [
      { label: 'Force It Open', desc: 'Uncommon relic, lose 20 max HP', icon: 'diamond', color: 'tertiary' },
      { label: 'Check the Pockets', desc: '60 coins', icon: 'paid', color: 'primary' },
      { label: 'Leave It', desc: 'Could be a trap', icon: 'directions_walk', color: 'secondary' },
    ],
  },
]

export function pickRelics(count: number, rarity?: Relic['rarity'], fromPool?: Relic[]): Relic[] {
  const base = fromPool ?? RELICS
  const pool = rarity ? base.filter(r => r.rarity === rarity) : [...base]
  const picks: Relic[] = []
  const remaining = [...pool]
  while (picks.length < count && remaining.length) {
    const idx = Math.floor(Math.random() * remaining.length)
    picks.push(remaining.splice(idx, 1)[0])
  }
  return picks
}

export function pickRelicsByRarity(count: number, fromPool?: Relic[]): Relic[] {
  const pool = fromPool ? [...fromPool] : [...RELICS]
  const picks: Relic[] = []
  const remaining = [...pool]
  while (picks.length < count && remaining.length) {
    const idx = Math.floor(Math.random() * remaining.length)
    picks.push(remaining.splice(idx, 1)[0])
  }
  return picks
}

/* ── Helper Functions ──────────────────────────── */

export function getPlayerAtk(p: Player): number {
  let a = p.baseAtk + (p.weapon ? p.weapon.atk : 0) + p.rageBonus
  for (const b of p.buffs) {
    if (b.turns > 0 && (b.type === 'atk' || b.type === 'both')) a += b.val
  }
  // coin_power relic: +1 ATK per 20 coins
  if (p.relics.some(r => r.id === 'coin_power')) a += Math.floor(p.coins / 20)
  // overkill relic: bonus from previous kill
  a += p.overkillBonus || 0
  return a
}

export function getPlayerDef(p: Player): number {
  let d = p.baseDef
  for (const b of p.buffs) {
    if (b.turns > 0 && (b.type === 'def' || b.type === 'both')) d += b.val
  }
  return d
}

export function getPlayerBlock(p: Player): number {
  let b = p.baseDef + (p.blockBonus || 0)
  for (const buf of p.buffs) {
    if (buf.turns > 0 && buf.type === 'block') b += buf.val
  }
  return b
}

export function getCritChance(p: Player): number {
  let c = 0.1 + (p.critBonus || 0) / 100
  for (const b of p.buffs) {
    if (b.turns > 0 && b.type === 'crit') c += b.val / 100
  }
  if (p.relics.some(r => r.id === 'crit_ring')) c += 0.05
  return c
}

export function calcDmg(atk: number, def: number, critChance: number, pctModifiers: number[] = []): { dmg: number; crit: boolean } {
  const base = Math.max(1, atk - def)
  // ±15% natural variance
  const variance = 0.85 + Math.random() * 0.3
  let modified = base * variance
  // Apply percent modifiers (buffs/debuffs)
  for (const pct of pctModifiers) modified *= (1 + pct)
  const crit = Math.random() < critChance
  return { dmg: Math.max(1, Math.round(modified * (crit ? 1.5 : 1))), crit }
}

export function buffSummary(p: Player): string {
  const parts: string[] = []
  for (const b of p.buffs) {
    if (b.turns > 0) parts.push(`${b.name} (${b.turns}t)`)
  }
  if (p.rageBonus > 0) parts.push(`Beer Rage +${p.rageBonus}`)
  if (p.pilsnerTurns > 0) parts.push(`Sahti ×2 (${p.pilsnerTurns}t)`)
  const block = getPlayerBlock(p)
  if (block > 0) parts.push(`Block +${block}`)
  return parts.length ? parts.join(' · ') : 'Sober — no buff'
}

export function getStatLabel(c: Beer, currentLevel: number, playerLevel: number): string {
  const lvScale = 1 + (currentLevel * 0.3) + (playerLevel - 1) * 0.1
  const v = Math.round(c.val * lvScale)
  switch (c.buff) {
    case 'atk':     return `+${v} ATK ${c.duration}t`
    case 'def':     return `+${v} DEF ${c.duration}t`
    case 'crit':    return `+${c.val}% CRIT ${c.duration}t`
    case 'both':    return `+${v} ATK/DEF ${c.duration}t`
    case 'spd':     return `×2 HIT ${c.duration}t`
    case 'block':   return `+${v} BLOCK ${c.duration}t`
    case 'regen':   return `+${v} HP/turn ${c.duration}t`
    case 'thorns':  return `${v} THORNS ${c.duration}t`
    case 'cleanse': return 'CLEANSE'
    case 'actions': return `+${c.val} ACTIONS`
    case 'triple':  return '×3 NEXT ATK'
    default:        return c.desc.split('—')[0].trim()
  }
}

export function getFoodLabel(f: Food, currentLevel: number): string {
  const lvScale = 1 + currentLevel * 0.4
  const v = Math.round(f.val * lvScale)
  if (f.restore === 'hp' || f.restore === 'both') return `+${v} HP`
  return f.desc.split('—')[0].trim()
}

export function scaledLevelUpChoices(playerLevel: number): LevelUpChoice[] {
  const s = Math.max(1, playerLevel - 1)
  return [
    { id: 'lhp',  icon: 'favorite',              color: 'error',      label: `+${8 + s * 3} Max HP`,       desc: 'Extra padding for the road ahead.', apply: (p: Player) => { const v = 8 + s * 3; p.maxHp += v; p.hp = Math.min(p.hp + v, p.maxHp) } },
    { id: 'latk', icon: 'swords',                color: 'tertiary',   label: `+${2 + Math.floor(s * 0.7)} ATK`, desc: 'Heavier fists.', apply: (p: Player) => { p.baseAtk += 2 + Math.floor(s * 0.7) } },
    { id: 'ldef', icon: 'shield',                color: 'secondary',  label: `+${2 + Math.floor(s * 0.7)} DEF`, desc: 'Thicker hide.', apply: (p: Player) => { p.baseDef += 2 + Math.floor(s * 0.7) } },
    { id: 'lcrit',icon: 'bolt',                  color: 'amber-400',  label: `+${5 + s}% Crit`,            desc: 'Sharper aim.', apply: (p: Player) => { p.critBonus = (p.critBonus || 0) + 5 + s } },
    { id: 'lreg', icon: 'self_improvement',       color: 'primary',    label: `+${2 + s} HP Regen`,     desc: 'Heal after every fight.', apply: (p: Player) => { p.regenBonus = (p.regenBonus || 0) + 2 + s } },
    { id: 'lmix', icon: 'local_fire_department',  color: 'tertiary',   label: `+${1 + Math.floor(s * 0.4)} ATK & DEF`, desc: 'A little of everything.', apply: (p: Player) => { const v = 1 + Math.floor(s * 0.4); p.baseAtk += v; p.baseDef += v } },
  ]
}
