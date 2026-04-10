import { useState } from 'react'
import type { Player, ShopInventory } from '../types'
import { BEERS, FOODS, WEAPONS, RELICS, SHOP_PRICES, RELIC_SHOP_PRICES, WEAPON_SHOP_PRICE, TIER_LABELS, TIER_COLORS, SHOPKEEPER_FIGHT_DATA, getPlayerAtk, getPlayerDef, getCritChance, getCardBorderClass, RARITY_LABELS, RARITY_SHOP_MULT } from '../gameData'

const RARITY_COLORS: Record<string, string> = { common: 'on-surface-variant', uncommon: 'secondary', rare: 'tertiary' }

interface Props {
  player: Player
  inventory: ShopInventory | null
  currentLevel: number
  currentRound: number
  onBuy: (itemId: string, type: 'beer' | 'food' | 'relic' | 'weapon') => void
  onLeave: () => void
  onFightShopkeeper: () => void
  onOpenMap: () => void
  onOpenRelics: () => void
}

export default function Shop({ player, inventory, currentLevel, currentRound, onBuy, onLeave, onFightShopkeeper, onOpenMap, onOpenRelics }: Props) {
  const [showFightPopup, setShowFightPopup] = useState(false)
  const shopBeers = BEERS.filter(b => inventory?.beers.includes(b.id))
  const shopFoods = FOODS.filter(f => inventory?.foods.includes(f.id))
  const shopRelics = RELICS.filter(r => inventory?.relics.includes(r.id))
  const boughtRelics = RELICS.filter(r => !inventory?.relics.includes(r.id) && inventory?._origRelics?.includes(r.id))
  const shopWeapon = inventory?.weapon ? WEAPONS.find(w => w.id === inventory.weapon) : null
  const boughtWeapon = !inventory?.weapon && inventory?._origWeapon ? WEAPONS.find(w => w.id === inventory._origWeapon) : null
  const prices = inventory?.prices ?? {}
  const getPrice = (id: string, fallback: number) => prices[id] ?? fallback

  return (
    <div className="fixed inset-0 z-[95] bg-surface flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="assets/levels/shop_menu_background.png" alt="" className="absolute inset-0 w-full h-full object-contain object-top opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-surface/40 to-surface/80" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#39342f 1px,transparent 1px)', backgroundSize: '6px 6px' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 shrink-0 py-2 px-3 sm:py-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="material-symbols-outlined text-amber-400 text-2xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          <div>
            <h2 className="font-headline text-lg sm:text-2xl text-primary uppercase tracking-wide leading-none">Kiosk</h2>
            <p className="font-label text-[10px] sm:text-xs text-on-surface-variant/60 italic">Dodgy prices. No refunds.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Player stats compact */}
          <div className="hidden sm:flex items-center gap-3 bg-surface-container/80 pixel-border px-3 py-1.5">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-error text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <span className="font-label text-sm font-bold text-error">{player.hp}/{player.maxHp}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
              <span className="font-label text-sm font-bold text-tertiary">{getPlayerAtk(player)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-on-surface-variant text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span className="font-label text-sm font-bold text-on-surface-variant">{getPlayerDef(player)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span className="font-label text-sm font-bold text-amber-400">{Math.round(getCritChance(player) * 100)}%</span>
            </div>
            {player.weapon && (
              <span className="font-label text-xs text-tertiary/80 truncate max-w-[120px]">{player.weapon.name}</span>
            )}
          </div>
          {/* Mobile stats */}
          <div className="sm:hidden flex items-center gap-1.5 bg-surface-container/80 pixel-border px-2 py-1">
            <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="font-label text-xs font-bold text-error">{player.hp}/{player.maxHp}</span>
            <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
            <span className="font-label text-xs font-bold text-tertiary">{getPlayerAtk(player)}</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-label text-xs font-bold text-on-surface-variant">{getPlayerDef(player)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container/80 pixel-border px-3 py-1.5">
            <span className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span className="font-headline text-lg sm:text-xl text-amber-400 tabular-nums">{player.coins}</span>
          </div>
          <button
            onClick={() => setShowFightPopup(true)}
            className="relative group w-auto sm:w-auto h-8 sm:h-11 bg-error/20 pixel-border border-error/40 border active:translate-y-0.5 transition-all overflow-hidden hover:bg-error/30 px-3 sm:px-4"
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-error text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
              <span className="font-headline text-xs sm:text-sm text-error tracking-widest uppercase">Fight the Shopkeeper</span>
            </div>
          </button>
          <button
            onClick={onLeave}
            className="relative group w-24 sm:w-32 h-8 sm:h-11 bg-surface-container-highest pixel-border border-on-surface-variant/30 border active:translate-y-0.5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-on-surface-variant text-sm sm:text-base">exit_to_app</span>
              <span className="font-headline text-xs sm:text-sm text-on-surface-variant tracking-widest uppercase">Leave</span>
            </div>
          </button>
        </div>
      </div>

      {/* All items in a single row at the bottom */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 sm:px-6 pb-4 flex flex-col justify-end">
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
          {/* Beers */}
          {shopBeers.map(beer => {
            const basePrice = SHOP_PRICES[beer.tier] ?? 30
            const rarityMult = RARITY_SHOP_MULT[beer.rarity || 'common']
            const price = getPrice(beer.id, Math.round(basePrice * rarityMult))
            const canAfford = player.coins >= price
            const owned = player.beers[beer.id] || 0
            return (
              <button key={`beer-${beer.id}`} onClick={() => canAfford && onBuy(beer.id, 'beer')} disabled={!canAfford}
                className={`relative flex flex-col items-center p-3 sm:p-4 ${getCardBorderClass(beer.rarity)} transition-all overflow-hidden w-32 sm:w-40 ${canAfford ? 'bg-surface-container-highest border border-secondary/30 hover:border-secondary active:translate-y-0.5 cursor-pointer' : 'bg-surface-container-highest/50 border border-on-surface-variant/10 opacity-50 cursor-not-allowed'}`}>
                {beer.rarity && beer.rarity !== 'common' && (
                  <span className={`absolute top-1 left-1 font-label text-[9px] uppercase px-1 ${beer.rarity === 'rare' ? 'text-amber-400' : 'text-green-400'}`}>{RARITY_LABELS[beer.rarity]}</span>
                )}
                <img src={beer.img} alt={beer.name} className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] object-contain sprite-canvas mb-1.5" />
                <span className="font-headline text-xs sm:text-sm text-on-surface uppercase tracking-wide leading-tight text-center">{beer.name}</span>
                <span className="font-body italic text-xs sm:text-sm text-on-surface-variant/70 leading-tight text-center mt-0.5">{beer.desc}</span>
                <div className="flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                  <span className={`font-headline text-base ${canAfford ? 'text-amber-400' : 'text-error'}`}>{price}</span>
                </div>
                {owned > 0 && <span className="absolute top-1 right-1 font-label text-[10px] text-on-surface-variant/60 bg-surface-container pixel-border px-1">×{owned}</span>}
              </button>
            )
          })}

          {/* Foods */}
          {shopFoods.map(food => {
            const basePrice = SHOP_PRICES[food.tier] ?? 30
            const rarityMult = RARITY_SHOP_MULT[food.rarity || 'common']
            const price = getPrice(food.id, Math.round(basePrice * rarityMult))
            const canAfford = player.coins >= price
            const owned = player.foods[food.id] || 0
            return (
              <button key={`food-${food.id}`} onClick={() => canAfford && onBuy(food.id, 'food')} disabled={!canAfford}
                className={`relative flex flex-col items-center p-3 sm:p-4 ${getCardBorderClass(food.rarity)} transition-all overflow-hidden w-32 sm:w-40 ${canAfford ? 'bg-surface-container-highest border border-secondary/30 hover:border-secondary active:translate-y-0.5 cursor-pointer' : 'bg-surface-container-highest/50 border border-on-surface-variant/10 opacity-50 cursor-not-allowed'}`}>
                {food.rarity && food.rarity !== 'common' && (
                  <span className={`absolute top-1 left-1 font-label text-[9px] uppercase px-1 ${food.rarity === 'rare' ? 'text-amber-400' : 'text-green-400'}`}>{RARITY_LABELS[food.rarity]}</span>
                )}
                <img src={food.img} alt={food.name} className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] object-contain sprite-canvas mb-1.5" />
                <span className="font-headline text-xs sm:text-sm text-on-surface uppercase tracking-wide leading-tight text-center">{food.name}</span>
                <span className="font-body italic text-xs sm:text-sm text-on-surface-variant/70 leading-tight text-center mt-0.5">{food.desc}</span>
                <div className="flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                  <span className={`font-headline text-base ${canAfford ? 'text-amber-400' : 'text-error'}`}>{price}</span>
                </div>
                {owned > 0 && <span className="absolute top-1 right-1 font-label text-[10px] text-on-surface-variant/60 bg-surface-container pixel-border px-1">×{owned}</span>}
              </button>
            )
          })}

          {/* Relics (available) */}
          {shopRelics.map(relic => {
            const price = getPrice(relic.id, RELIC_SHOP_PRICES[relic.rarity])
            const canAfford = player.coins >= price
            const alreadyOwned = player.relics.some(r => r.id === relic.id)
            return (
              <button key={`relic-${relic.id}`} onClick={() => canAfford && !alreadyOwned && onBuy(relic.id, 'relic')} disabled={!canAfford || alreadyOwned}
                className={`relative flex flex-col items-center p-3 sm:p-4 pixel-border transition-all overflow-hidden w-32 sm:w-40 ${canAfford && !alreadyOwned ? 'bg-surface-container-highest border border-primary/30 hover:border-primary active:translate-y-0.5 cursor-pointer' : 'bg-surface-container-highest/50 border border-on-surface-variant/10 opacity-50 cursor-not-allowed'}`}>
                <span className={`material-symbols-outlined text-${RARITY_COLORS[relic.rarity]} text-4xl sm:text-5xl mb-1.5`} style={{ fontVariationSettings: "'FILL' 1" }}>{relic.icon}</span>
                <span className="font-headline text-xs sm:text-sm text-on-surface uppercase tracking-wide leading-tight text-center">{relic.name}</span>
                <span className="font-body italic text-xs sm:text-sm text-on-surface-variant/70 leading-tight text-center mt-0.5">{relic.desc}</span>
                <div className="flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                  <span className={`font-headline text-base ${canAfford ? 'text-amber-400' : 'text-error'}`}>{price}</span>
                </div>
              </button>
            )
          })}

          {/* Relics (already bought this visit) */}
          {boughtRelics.map(relic => (
            <div key={`relic-sold-${relic.id}`}
              className="relative flex flex-col items-center p-3 sm:p-4 pixel-border overflow-hidden w-32 sm:w-40 bg-surface-container-highest/50 border border-on-surface-variant/10 opacity-40">
              <span className={`material-symbols-outlined text-${RARITY_COLORS[relic.rarity]} text-4xl sm:text-5xl mb-1.5`} style={{ fontVariationSettings: "'FILL' 1" }}>{relic.icon}</span>
              <span className="font-headline text-xs sm:text-sm text-on-surface uppercase tracking-wide leading-tight text-center">{relic.name}</span>
              <span className="font-body italic text-xs sm:text-sm text-on-surface-variant/70 leading-tight text-center mt-0.5">{relic.desc}</span>
              <span className="absolute top-1 right-1 font-label text-[10px] text-secondary bg-surface-container pixel-border px-1">Sold</span>
            </div>
          ))}

          {/* Weapon (available) */}
          {shopWeapon && (() => {
            const weaponPrice = getPrice(shopWeapon.id, WEAPON_SHOP_PRICE)
            const canAfford = player.coins >= weaponPrice
            const isDowngrade = player.weapon && shopWeapon.atk <= player.weapon.atk
            return (
              <button key={`weapon-${shopWeapon.id}`} onClick={() => canAfford && !isDowngrade && onBuy(shopWeapon.id, 'weapon')} disabled={!canAfford || !!isDowngrade}
                className={`relative flex flex-col items-center p-3 sm:p-4 pixel-border transition-all overflow-hidden w-32 sm:w-40 ${canAfford && !isDowngrade ? 'bg-surface-container-highest border border-tertiary/30 hover:border-tertiary active:translate-y-0.5 cursor-pointer' : 'bg-surface-container-highest/50 border border-on-surface-variant/10 opacity-50 cursor-not-allowed'}`}>
                <span className="material-symbols-outlined text-tertiary text-4xl sm:text-5xl mb-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                <span className="font-headline text-xs sm:text-sm text-on-surface uppercase tracking-wide leading-tight text-center">{shopWeapon.name}</span>
                <span className="font-label text-sm text-tertiary font-bold">+{shopWeapon.atk} ATK</span>
                <span className="font-body italic text-xs sm:text-sm text-on-surface-variant/70 leading-tight text-center mt-0.5">{shopWeapon.lore}</span>
                <div className="flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                  <span className={`font-headline text-base ${canAfford ? 'text-amber-400' : 'text-error'}`}>{weaponPrice}</span>
                </div>
                {isDowngrade && <span className="absolute top-1 right-1 font-label text-[10px] text-error bg-surface-container pixel-border px-1">Downgrade</span>}
              </button>
            )
          })()}

          {/* Weapon (already bought this visit) */}
          {boughtWeapon && (
            <div key={`weapon-sold-${boughtWeapon.id}`}
              className="relative flex flex-col items-center p-3 sm:p-4 pixel-border overflow-hidden w-32 sm:w-40 bg-surface-container-highest/50 border border-on-surface-variant/10 opacity-40">
              <span className="material-symbols-outlined text-tertiary text-4xl sm:text-5xl mb-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
              <span className="font-headline text-xs sm:text-sm text-on-surface uppercase tracking-wide leading-tight text-center">{boughtWeapon.name}</span>
              <span className="font-label text-sm text-tertiary font-bold">+{boughtWeapon.atk} ATK</span>
              <span className="absolute top-1 right-1 font-label text-[10px] text-secondary bg-surface-container pixel-border px-1">Sold</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Fight Shopkeeper Popup ── */}
      {showFightPopup && (() => {
        const sk = SHOPKEEPER_FIGHT_DATA
        const scale = 1 + (player.level - 1) * 0.12
        const eliteScale = 1.5
        const hp = Math.round(sk.hp * scale * eliteScale)
        const atk = Math.round(sk.atk * scale * eliteScale)
        const def = Math.round(sk.def * scale * eliteScale)
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" onClick={() => setShowFightPopup(false)}>
            <div className="bg-surface-container pixel-border border border-error/40 p-4 sm:p-6 max-w-sm w-[90vw] flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
              <h3 className="font-headline text-lg sm:text-xl text-error uppercase tracking-wide">Challenge Shopkeeper?</h3>
              <img src={sk.portrait} alt={sk.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain sprite-canvas" />
              <span className="font-headline text-sm sm:text-base text-on-surface">★ {sk.name}</span>
              <p className="font-body italic text-xs text-on-surface-variant/60 text-center">{sk.lore}</p>

              <div className="flex gap-4 text-sm font-label">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-error text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  <span className="text-on-surface">{hp}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                  <span className="text-on-surface">{atk}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                  <span className="text-on-surface">{def}</span>
                </div>
              </div>

              <div className="bg-surface-container-highest pixel-border p-3 w-full text-center space-y-1.5">
                <p className="font-label text-xs text-secondary"><span className="material-symbols-outlined text-secondary text-sm align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span> Win: get all spent coins back</p>
                <p className="font-label text-xs text-error"><span className="material-symbols-outlined text-error text-sm align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>skull</span> Lose: lose ALL coins (you won't die)</p>
              </div>

              <div className="flex gap-3 mt-1">
                <button onClick={() => setShowFightPopup(false)}
                  className="px-4 py-2 pixel-border bg-surface-container-highest border border-on-surface-variant/30 font-headline text-xs sm:text-sm text-on-surface-variant uppercase tracking-wide active:translate-y-0.5 transition-all">
                  Cancel
                </button>
                <button onClick={() => { setShowFightPopup(false); onFightShopkeeper() }}
                  className="px-4 py-2 pixel-border bg-error/20 border border-error/40 font-headline text-xs sm:text-sm text-error uppercase tracking-wide active:translate-y-0.5 transition-all hover:bg-error/30">
                  <span className="material-symbols-outlined text-error text-sm align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                  Fight!
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Bottom-right utility buttons ── */}
      <div className="fixed bottom-2 right-2 sm:bottom-5 sm:right-5 z-[100] flex flex-col gap-1 sm:gap-2">
        <button
          onClick={onOpenMap}
          className="w-7 h-7 sm:w-12 sm:h-12 bg-surface-container-highest pixel-border border border-primary/40 hover:border-primary active:translate-y-0.5 transition-all flex items-center justify-center"
          title="Open Map"
        >
          <span className="material-symbols-outlined text-primary text-base sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
        </button>
        {player.relics.length > 0 && (
          <button
            onClick={onOpenRelics}
            className="w-7 h-7 sm:w-12 sm:h-12 bg-surface-container-highest pixel-border border border-primary/40 hover:border-primary active:translate-y-0.5 transition-all flex items-center justify-center"
            title="View Relics"
          >
            <span className="material-symbols-outlined text-primary text-base sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
          </button>
        )}
      </div>
    </div>
  )
}
