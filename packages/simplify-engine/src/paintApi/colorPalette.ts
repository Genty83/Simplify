/**
 * @module simplify-engine/src/color/colorPalette
 * @version 1.0.0
 *
 * @description
 * Fluent‑inspired default color palette for SimplifyUI.
 *
 * This palette mirrors the tonal structure and accessibility philosophy of
 * Microsoft Fluent: soft neutrals, clear elevation, strong brand accents,
 * and predictable semantic colors.
 *
 * All values are authored using `mc()` to ensure full rectangularity across
 * light, dark, and high‑contrast modes.
 */

import type { SimplifyTheme } from "./types";
import { mc } from "./utils";

export const suiColor: SimplifyTheme = {
  layers: {
    base: {
      background: {
        default: mc("#ffffff", "#1b1a19", "#000000"),
        hover: mc("#f5f5f5", "#252423", "#000000"),
        pressed: mc("#eaeaea", "#2e2d2c", "#000000"),
        selected: mc("#e0e0e0", "#3a3938", "#000000"),
        disabled: mc("#f8f8f8", "#1b1a19", "#000000")
      },
      foreground: {
        default: mc("#201f1e", "#ffffff", "#ffffff"),
        hover: mc("#323130", "#ffffff", "#ffffff"),
        pressed: mc("#3b3a39", "#ffffff", "#ffffff"),
        selected: mc("#201f1e", "#ffffff", "#ffffff"),
        disabled: mc("#a19f9d", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#e1dfdd", "#3b3a39", "#ffffff"),
        hover: mc("#c8c6c4", "#484644", "#ffffff"),
        pressed: mc("#b3b0ad", "#605e5c", "#ffffff"),
        selected: mc("#a19f9d", "#8a8886", "#ffffff"),
        disabled: mc("#e1dfdd", "#3b3a39", "#ffffff")
      }
    },

    surface: {
      background: {
        default: mc("#faf9f8", "#252423", "#000000"),
        hover: mc("#f3f2f1", "#323130", "#000000"),
        pressed: mc("#edebe9", "#3b3a39", "#000000"),
        selected: mc("#e1dfdd", "#484644", "#000000"),
        disabled: mc("#faf9f8", "#252423", "#000000")
      },
      foreground: {
        default: mc("#201f1e", "#ffffff", "#ffffff"),
        hover: mc("#323130", "#ffffff", "#ffffff"),
        pressed: mc("#3b3a39", "#ffffff", "#ffffff"),
        selected: mc("#201f1e", "#ffffff", "#ffffff"),
        disabled: mc("#a19f9d", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#e1dfdd", "#3b3a39", "#ffffff"),
        hover: mc("#c8c6c4", "#484644", "#ffffff"),
        pressed: mc("#b3b0ad", "#605e5c", "#ffffff"),
        selected: mc("#a19f9d", "#8a8886", "#ffffff"),
        disabled: mc("#e1dfdd", "#3b3a39", "#ffffff")
      }
    },

    elevated: {
      background: {
        default: mc("#ffffff", "#323130", "#000000"),
        hover: mc("#faf9f8", "#3b3a39", "#000000"),
        pressed: mc("#f3f2f1", "#484644", "#000000"),
        selected: mc("#edebe9", "#605e5c", "#000000"),
        disabled: mc("#ffffff", "#323130", "#000000")
      },
      foreground: {
        default: mc("#201f1e", "#ffffff", "#ffffff"),
        hover: mc("#323130", "#ffffff", "#ffffff"),
        pressed: mc("#3b3a39", "#ffffff", "#ffffff"),
        selected: mc("#201f1e", "#ffffff", "#ffffff"),
        disabled: mc("#a19f9d", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#e1dfdd", "#484644", "#ffffff"),
        hover: mc("#c8c6c4", "#605e5c", "#ffffff"),
        pressed: mc("#b3b0ad", "#8a8886", "#ffffff"),
        selected: mc("#a19f9d", "#979593", "#ffffff"),
        disabled: mc("#e1dfdd", "#484644", "#ffffff")
      }
    },

    raised: {
      background: {
        default: mc("#ffffff", "#3b3a39", "#000000"),
        hover: mc("#faf9f8", "#484644", "#000000"),
        pressed: mc("#f3f2f1", "#605e5c", "#000000"),
        selected: mc("#edebe9", "#8a8886", "#000000"),
        disabled: mc("#ffffff", "#3b3a39", "#000000")
      },
      foreground: {
        default: mc("#201f1e", "#ffffff", "#ffffff"),
        hover: mc("#323130", "#ffffff", "#ffffff"),
        pressed: mc("#3b3a39", "#ffffff", "#ffffff"),
        selected: mc("#201f1e", "#ffffff", "#ffffff"),
        disabled: mc("#a19f9d", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#e1dfdd", "#605e5c", "#ffffff"),
        hover: mc("#c8c6c4", "#8a8886", "#ffffff"),
        pressed: mc("#b3b0ad", "#979593", "#ffffff"),
        selected: mc("#a19f9d", "#b3b0ad", "#ffffff"),
        disabled: mc("#e1dfdd", "#605e5c", "#ffffff")
      }
    },

    accent: {
      background: {
        default: mc("#0078d4", "#2899f5", "#0000ff"),
        hover: mc("#106ebe", "#3aa0f3", "#0000ff"),
        pressed: mc("#054b81", "#62b0f6", "#0000ff"),
        selected: mc("#004578", "#82c7fa", "#0000ff"),
        disabled: mc("#c7e0f4", "#1b1a19", "#0000ff")
      },
      foreground: {
        default: mc("#ffffff", "#ffffff", "#ffffff"),
        hover: mc("#ffffff", "#ffffff", "#ffffff"),
        pressed: mc("#ffffff", "#ffffff", "#ffffff"),
        selected: mc("#ffffff", "#ffffff", "#ffffff"),
        disabled: mc("#f3f2f1", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#005a9e", "#62b0f6", "#ffffff"),
        hover: mc("#004578", "#82c7fa", "#ffffff"),
        pressed: mc("#00345d", "#a6d9fc", "#ffffff"),
        selected: mc("#002c4a", "#c7eaff", "#ffffff"),
        disabled: mc("#c7e0f4", "#3b3a39", "#ffffff")
      }
    }
  },

  state: {
    danger: {
      background: {
        default: mc("#d13438", "#f1707b", "#ff0000"),
        hover: mc("#b32f32", "#f37c86", "#ff0000"),
        pressed: mc("#9a2a2d", "#f48992", "#ff0000"),
        selected: mc("#7f2427", "#f59aa3", "#ff0000"),
        disabled: mc("#f3d6d8", "#3b3a39", "#ff0000")
      },
      foreground: {
        default: mc("#ffffff", "#000000", "#ffffff"),
        hover: mc("#ffffff", "#000000", "#ffffff"),
        pressed: mc("#ffffff", "#000000", "#ffffff"),
        selected: mc("#ffffff", "#000000", "#ffffff"),
        disabled: mc("#a19f9d", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#a4262c", "#f1707b", "#ffffff"),
        hover: mc("#8e1f24", "#f48992", "#ffffff"),
        pressed: mc("#7a1a1f", "#f59aa3", "#ffffff"),
        selected: mc("#66161a", "#f7aeb7", "#ffffff"),
        disabled: mc("#f3d6d8", "#3b3a39", "#ffffff")
      }
    },

    warning: {
      background: {
        default: mc("#ffaa44", "#ffcc66", "#ffff00"),
        hover: mc("#e6993d", "#ffd27a", "#ffff00"),
        pressed: mc("#cc8836", "#ffd98f", "#ffff00"),
        selected: mc("#b3772f", "#ffe0a3", "#ffff00"),
        disabled: mc("#fcefdc", "#3b3a39", "#ffff00")
      },
      foreground: {
        default: mc("#000000", "#000000", "#000000"),
        hover: mc("#000000", "#000000", "#000000"),
        pressed: mc("#000000", "#000000", "#000000"),
        selected: mc("#000000", "#000000", "#000000"),
        disabled: mc("#a19f9d", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#e6993d", "#ffcc66", "#ffffff"),
        hover: mc("#cc8836", "#ffd27a", "#ffffff"),
        pressed: mc("#b3772f", "#ffd98f", "#ffffff"),
        selected: mc("#9a6628", "#ffe0a3", "#ffffff"),
        disabled: mc("#fcefdc", "#3b3a39", "#ffffff")
      }
    },

    success: {
      background: {
        default: mc("#107c10", "#54b054", "#00ff00"),
        hover: mc("#0e6e0e", "#62b862", "#00ff00"),
        pressed: mc("#0c600c", "#70c070", "#00ff00"),
        selected: mc("#0a520a", "#7ec87e", "#00ff00"),
        disabled: mc("#dff6df", "#3b3a39", "#00ff00")
      },
      foreground: {
        default: mc("#ffffff", "#000000", "#ffffff"),
        hover: mc("#ffffff", "#000000", "#ffffff"),
        pressed: mc("#ffffff", "#000000", "#ffffff"),
        selected: mc("#ffffff", "#000000", "#ffffff"),
        disabled: mc("#a19f9d", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#0e6e0e", "#54b054", "#ffffff"),
        hover: mc("#0c600c", "#62b862", "#ffffff"),
        pressed: mc("#0a520a", "#70c070", "#ffffff"),
        selected: mc("#084408", "#7ec87e", "#ffffff"),
        disabled: mc("#dff6df", "#3b3a39", "#ffffff")
      }
    },

    info: {
      background: {
        default: mc("#005fb8", "#3aa0f3", "#0000ff"),
        hover: mc("#004c94", "#62b0f6", "#0000ff"),
        pressed: mc("#003a70", "#82c7fa", "#0000ff"),
        selected: mc("#002c57", "#a6d9fc", "#0000ff"),
        disabled: mc("#d0e7f8", "#3b3a39", "#0000ff")
      },
      foreground: {
        default: mc("#ffffff", "#000000", "#ffffff"),
        hover: mc("#ffffff", "#000000", "#ffffff"),
        pressed: mc("#ffffff", "#000000", "#ffffff"),
        selected: mc("#ffffff", "#000000", "#ffffff"),
        disabled: mc("#a19f9d", "#605e5c", "#ffffff")
      },
      stroke: {
        default: mc("#004c94", "#3aa0f3", "#ffffff"),
        hover: mc("#003a70", "#62b0f6", "#ffffff"),
        pressed: mc("#002c57", "#82c7fa", "#ffffff"),
        selected: mc("#002040", "#a6d9fc", "#ffffff"),
        disabled: mc("#d0e7f8", "#3b3a39", "#ffffff")
      }
    }
  }
};
