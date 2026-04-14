import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

import { getEarnedUnlocks } from './gameData'

const firebaseConfig = {
  apiKey: "AIzaSyDc5YYjR2CB2lrfzF6HgtdWVEjRzGrrM1Q",
  authDomain: "seppo-rpg.firebaseapp.com",
  projectId: "seppo-rpg",
  storageBucket: "seppo-rpg.firebasestorage.app",
  messagingSenderId: "1021625590075",
  appId: "1:1021625590075:web:138d0bd605047491ca171e",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

const googleProvider = new GoogleAuthProvider()

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function signOutUser() {
  return signOut(auth)
}

export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}

/* ── Meta Progression ────────────────────────── */

export interface MetaProfile {
  playerName: string
  totalRuns: number
  totalWins: number
  bestLevel: number
  totalKills: number
  totalDmgDealt: number
  totalBeersDrunk: number
  highScore: number
  unlockedIds: string[]
  defeatedEnemies: string[]
  runHistory: RunRecord[]
}

export interface RunRecord {
  date: string
  level: number
  won: boolean
  score: number
  kills: number
  elapsed: number
}

const MAX_HISTORY = 50

export function createDefaultMeta(): MetaProfile {
  return {
    playerName: '',
    totalRuns: 0,
    totalWins: 0,
    bestLevel: 0,
    totalKills: 0,
    totalDmgDealt: 0,
    totalBeersDrunk: 0,
    highScore: 0,
    unlockedIds: [],
    defeatedEnemies: [],
    runHistory: [],
  }
}

export async function loadMeta(uid: string): Promise<MetaProfile> {
  const snap = await getDoc(doc(db, 'users', uid, 'data', 'meta'))
  if (snap.exists()) {
    // Merge with defaults to fill any fields missing from old docs
    return { ...createDefaultMeta(), ...snap.data() as Partial<MetaProfile> }
  }
  return createDefaultMeta()
}

export async function saveMeta(uid: string, meta: MetaProfile): Promise<void> {
  // Keep history capped
  if (meta.runHistory.length > MAX_HISTORY) {
    meta.runHistory = meta.runHistory.slice(-MAX_HISTORY)
  }
  await setDoc(doc(db, 'users', uid, 'data', 'meta'), meta)
}

export function updateMetaAfterRun(
  meta: MetaProfile,
  run: { level: number; won: boolean; score: number; kills: number; elapsed: number; dmgDealt: number; beersDrunk: number; enemyNames?: string[] }
): { meta: MetaProfile; newUnlocks: string[] } {
  // Merge defeated enemies
  const prevDefeated = new Set(meta.defeatedEnemies ?? [])
  if (run.enemyNames) {
    for (const n of run.enemyNames) prevDefeated.add(n)
  }
  const updated: MetaProfile = {
    playerName: meta.playerName,
    totalRuns: meta.totalRuns + 1,
    totalWins: meta.totalWins + (run.won ? 1 : 0),
    bestLevel: Math.max(meta.bestLevel, run.level),
    totalKills: meta.totalKills + run.kills,
    totalDmgDealt: meta.totalDmgDealt + run.dmgDealt,
    totalBeersDrunk: meta.totalBeersDrunk + run.beersDrunk,
    highScore: Math.max(meta.highScore, run.score),
    unlockedIds: [...(meta.unlockedIds ?? [])],
    defeatedEnemies: [...prevDefeated],
    runHistory: [
      ...meta.runHistory,
      {
        date: new Date().toISOString(),
        level: run.level,
        won: run.won,
        score: run.score,
        kills: run.kills,
        elapsed: run.elapsed,
      },
    ],
  }
  // Check for new unlocks
  const earned = getEarnedUnlocks(updated)
  const prev = new Set(meta.unlockedIds)
  const newUnlocks: string[] = []
  for (const id of earned) {
    if (!prev.has(id)) {
      newUnlocks.push(id)
      updated.unlockedIds.push(id)
    }
  }
  return { meta: updated, newUnlocks }
}

/* ── Leaderboard ─────────────────────────────── */

export interface LeaderboardEntry {
  uid: string
  playerName: string
  highScore: number
  bestLevel: number
  totalWins: number
  totalRuns: number
  totalScore: number
  totalBeersDrunk: number
  totalPlayTime: number
  runHistory: RunRecord[]
}

/** Update the public leaderboard doc for this user (called after each run) */
export async function updateLeaderboardEntry(uid: string, meta: MetaProfile): Promise<void> {
  if (!meta.playerName) return // don't save anonymous entries
  const totalScore = meta.runHistory.reduce((s, r) => s + r.score, 0)
  const totalPlayTime = meta.runHistory.reduce((s, r) => s + r.elapsed, 0)
  const entry: LeaderboardEntry = {
    uid,
    playerName: meta.playerName,
    highScore: meta.highScore,
    bestLevel: meta.bestLevel,
    totalWins: meta.totalWins,
    totalRuns: meta.totalRuns,
    totalScore,
    totalBeersDrunk: meta.totalBeersDrunk,
    totalPlayTime,
    runHistory: meta.runHistory.slice(-20),
  }
  await setDoc(doc(db, 'leaderboard', uid), entry)
}

/** Fetch top N players by total score */
export async function fetchLeaderboard(count = 20): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'leaderboard'), orderBy('totalScore', 'desc'), limit(count))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as LeaderboardEntry)
}
