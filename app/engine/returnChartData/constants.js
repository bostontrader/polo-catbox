const startNend = {
  SNA: 0,
  SNB: 1,
  SNC: 2,
  SND: 3,
  // SNE: 4
}

module.exports = {
  startNend,

  startNend28: {
    SN00: {p: startNend.SNA, s: 0},
    SN01: {p: startNend.SNB, s: 1},
    SN02: {p: startNend.SNB, s: 2},
    SN03: {p: startNend.SNB, s: 3},
    SN04: {p: startNend.SNC, s: 4},
    SN05: {p: startNend.SNC, s: 5},
    SN06: {p: startNend.SNC, s: 6},
    SN07: {p: startNend.SNC, s: 7},
    SN08: {p: startNend.SNC, s: 8},
    SN09: {p: startNend.SNC, s: 9},
    SN10: {p: startNend.SND, s: 10},
    // SN11: 11,
    // SN12: 12,
    // SN13: 13,
    // SN14: 14,
    // SN15: 15,
    // SN16: 16,
    // SN17: 17,
    // SN18: 18,
    // SN19: 19,
    // SN20: 20,
    // SN21: 21,
    // SN22: 22,
    // SN23: 23,
    // SN24: 24,
    // SN25: 25,
    // SN26: 26,
    // SN27: 27,
    // SN28: 28
  },

  firstTradeTiming: {
    FT_BEFORE_FP: 0,
    FT_EQUAL_FP: 1,
    FT_WITHIN_FP: 2,
    FT_VERY_END_FP: 3,
    FT_AFTER_FP: 4
  },

  lastTradeTiming: {
    LT_BEFORE_LP: 0,
    LT_EQUAL_LP: 1,
    LT_WITHIN_LP: 2,
    LT_VERY_END_LP: 3,
    LT_AFTER_LP: 4
  },

  quanTrades: [0, 1, 2],
  periods: [900, 1800]
}
