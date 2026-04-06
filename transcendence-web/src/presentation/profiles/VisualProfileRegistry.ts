import type { VisualProfile } from './VisualProfile';

/**
 * Singleton rejestr profili wizualnych.
 * Profile rejestruje sie raz przy ladowaniu gry / systemu gwiezdnego.
 */
export class VisualProfileRegistry {
  private readonly profiles = new Map<string, VisualProfile>();

  /** Rejestruje profil. Rzuca blad, jesli profileId jest zduplikowane. */
  public register(profile: VisualProfile): void {
    if (this.profiles.has(profile.profileId)) {
      throw new Error(`Visual profile already registered: ${profile.profileId}`);
    }
    this.profiles.set(profile.profileId, profile);
  }

  /** Pobiera profil po id. */
  public get(profileId: string): VisualProfile | undefined {
    return this.profiles.get(profileId);
  }

  /** Czy profil istnieje. */
  public has(profileId: string): boolean {
    return this.profiles.has(profileId);
  }

  /** Wszystkie zarejestrowane profile. */
  public getAll(): ReadonlyArray<VisualProfile> {
    return Array.from(this.profiles.values());
  }
}