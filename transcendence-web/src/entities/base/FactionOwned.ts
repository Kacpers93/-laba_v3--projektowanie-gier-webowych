/** Byt posiadajacy przynaleznosc frakcyjna. */
export interface FactionOwned {
  /** ID frakcji. null = neutralny / niezrzeszony. */
  factionId: string | null;
}