import {Emote} from "../models/emotes";
import {LayoutManager} from "./layout-manager";

export class ComboMatcher {
  private currentEmotes: Set<string> = new Set();
  private currentComboAmount = 0;
  private currentComboEmote: Emote | null = null;
  private layout = new LayoutManager();
  private lastComboTime = 0;

  public constructor(
    private comboCooldown: number,
    private minComboAmount: number,
  ) {}

  public static init(comboCooldown: number, minComboAmount: number) {
    return new ComboMatcher(comboCooldown * 1000, minComboAmount);
  }

  public handle(emotes: Emote[]) {
    const prevEmotes = this.currentEmotes;

    const currentEmotes = new Set<string>();
    for (const emote of emotes) {
      currentEmotes.add(emote.code);
    }
    this.currentEmotes = currentEmotes;

    if (this.currentComboEmote) {
      const hasEmote = emotes.find(
        (e) => e.code === this.currentComboEmote?.code,
      );
      if (hasEmote) {
        this.currentComboAmount++;
        if (this.currentComboAmount >= this.minComboAmount) {
          this.lastComboTime = Date.now();
          this.layout.handleCombo(
            this.currentComboEmote!,
            this.currentComboAmount,
          );
        }
      } else {
        this.endCombo();
      }
      return;
    }

    for (const emote of emotes) {
      if (prevEmotes.has(emote.code)) {
        // Has a combo!

        const now = Date.now();
        const delta = now - this.lastComboTime;

        const notCooldown =
          this.comboCooldown === 0 || delta > this.comboCooldown;

        if (notCooldown) {
          this.currentComboAmount = 2;
          this.currentComboEmote = emote;
        }
        return;
      }
    }
  }

  private endCombo() {
    this.lastComboTime = Date.now();

    this.currentComboAmount = 0;
    this.currentComboEmote = null;
  }
}
