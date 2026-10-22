const MOUSE_GEOMETRY = {"01": [82, 182, 570, 532], "02": [459, 180, 1120, 698], "03": [615, 180, 962, 741], "04": [128, 232, 398, 736], "05": [68, 195, 531, 638], "06": [246, 315, 484, 722], "07": [218, 128, 542, 717], "08": [564, 134, 914, 738], "09": [202, 98, 548, 720], "10": [196, 69, 548, 687], "11": [454, 291, 704, 714], "12": [369, 243, 742, 758], "13": [296, 54, 900, 670], "14": [414, 112, 974, 740], "15": [530, 102, 948, 734], "16": [418, 33, 915, 735], "17": [580, 129, 933, 734], "18": [518, 81, 879, 729], "19": [260, 32, 681, 738], "20": [552, 62, 946, 722], "21": [136, 106, 698, 666], "22": [234, 68, 620, 747], "23": [537, 74, 912, 735], "24": [258, 22, 680, 724], "25": [318, 6, 816, 747], "26": [640, 120, 966, 708], "27": [212, 66, 560, 710], "28": [596, 96, 957, 706], "29": [308, 9, 840, 752], "30": [462, 141, 844, 758], "31": [213, 34, 986, 718], "32": [381, 8, 768, 738], "33": [424, 96, 818, 722], "34": [348, 9, 813, 752], "35": [478, 138, 846, 738], "36": [322, 24, 814, 730], "37": [333, 27, 813, 732], "38": [384, 24, 766, 741], "39": [393, 27, 758, 740]};
const MOUSE_HAS_CABLE = {"01": [true, true], "02": [true, true], "03": [true, true], "04": [true, true], "05": [true, true], "06": [true, true], "07": [true, true], "08": [true, true], "09": [true, true], "10": [true, true], "11": [true, true], "12": [true, true], "13": [true, true], "14": [true, true], "15": [true, true], "16": [true, true], "17": [true, true], "18": [true, true], "19": [true, true], "20": [true, true], "21": [true, true], "22": [true, true], "23": [true, true], "24": [true, true], "25": [false, false], "26": [true, true], "27": [true, true], "28": [true, true], "29": [false, false], "30": [true, true], "31": [false, false], "32": [false, false], "33": [true, true], "34": [false, false], "35": [true, true], "36": [false, false], "37": [false, false], "38": [false, false], "39": [false, false]};

// ===== Data for the Mouse Graft System =====
// MOUSE_GEOMETRY: where the body sits inside each 1152x768 separated image.
// MOUSE_HAS_CABLE: [original, x-ray] whether the mouse has a cable.
// 39 mice. lane = form family on the lineage map. approx = the year is placed between neighbours because the mouse is not on the source list.
const LANES = ["Box", "Dome", "Trackball", "Drop", "Ergonomic", "Multi-button", "Flat"];
// Relative real size of each mouse (from the size-comparison sheet): screen px per image px. Never normalised, so a small mouse stays small.
const REAL_SIZE = {"01":0.2079,"02":0.1591,"03":0.1296,"04":0.1758,"05":0.1756,"06":0.1754,"07":0.1506,"08":0.1507,"09":0.1503,"10":0.1508,"11":0.2097,"12":0.1965,"13":0.1674,"14":0.1766,"15":0.1713,"16":0.1709,"17":0.1704,"18":0.1677,"19":0.1381,"20":0.1388,"21":0.1142,"22":0.1411,"23":0.1483,"24":0.1479,"25":0.1317,"26":0.1482,"27":0.1875,"28":0.1873,"29":0.1459,"30":0.1945,"31":0.1218,"32":0.152,"33":0.1519,"34":0.1551,"35":0.1977,"36":0.149,"37":0.1517,"38":0.1514,"39":0.1524};
const REAL_K = 0.9;
const WHEEL = ["20","22","24","25","27","29","30","33","34","35","36","37","38","39"];   // mice with a scroll wheel
const FREE_WHEEL = ["29","36","37"];                                                // wheels that can spin freely (no detent)
const MICE = {
  "10": { year: 1985, name: "C7", maker: "Logitech", lane: 0, trait: "Three buttons in a row" },
  "11": { year: 1986, name: "ADB Mouse", maker: "Apple", lane: 0, trait: "Coiled cable" },
  "12": { year: 1991, name: "Mouseman", maker: "Logitech", lane: 1, trait: "Asymmetric body" },
  "13": { year: 1991, approx: true, name: "Trackman (teal ball)", maker: "Logitech", lane: 2, trait: "Ball rises on top; not on the list" },
  "14": { year: 1992, name: "Expert Mouse", maker: "Kensington", lane: 2, trait: "Square frame, four corner buttons" },
  "15": { year: 1992, name: "SNES Mouse", maker: "Nintendo", lane: 3, trait: "Console connector" },
  "16": { year: 1992, approx: true, name: "Magellan 3D Mouse", maker: "Logitech", lane: 2, trait: "Crown of numeric buttons; not on the list" },
  "17": { year: 1993, name: "Mouse 2.0", maker: "Microsoft", lane: 3, trait: "Asymmetric, shaped to the palm" },
  "18": { year: 1993, name: "ADB Mouse II", maker: "Apple", lane: 3, trait: "Drop-shaped body" },
  "19": { year: 1995, name: "Trackman Marble", maker: "Logitech", lane: 2, trait: "Red ball on the side" },
  "20": { year: 1996, name: "IntelliMouse", maker: "Microsoft", lane: 3, trait: "The scroll wheel appears" },
  "21": { year: 1998, name: "USB Mouse (Hockey Puck)", maker: "Apple", lane: 1, trait: "A perfect circle, USB" },
  "22": { year: 1999, name: "Boomslang", maker: "Razer", lane: 5, trait: "The start of gaming, named for a snake" },
  "23": { year: 2000, name: "Pro Mouse", maker: "Apple", lane: 3, trait: "Buttons absorbed into the body" },
  "24": { year: 2002, name: "VerticalMouse", maker: "Evoluent", lane: 4, trait: "Held on its side" },
  "25": { year: 2004, name: "MX1000", maker: "Logitech", lane: 4, trait: "Cable shed, laser sensor" },
  "26": { year: 2005, name: "Mighty Mouse", maker: "Apple", lane: 3, trait: "Invisible buttons, ball wheel" },
  "27": { year: 2005, approx: true, name: "Blue Curved Mouse", maker: "Logitech", lane: 3, trait: "Droplet-patterned surface; not on the list" },
  "28": { year: 2005, approx: true, name: "Micropiano", maker: "Kurzweil", lane: 3, trait: "Keys attached to the body; not on the list" },
  "29": { year: 2006, name: "MX Revolution", maker: "Logitech", lane: 4, trait: "Thumb rest" },
  "30": { year: 2006, name: "DeathAdder", maker: "Razer", lane: 5, trait: "Named for a snake, right-hand curve" },
  "31": { year: 2008, name: "Arc Mouse", maker: "Microsoft", lane: 6, trait: "Folding bow shape" },
  "32": { year: 2009, name: "Magic Mouse", maker: "Apple", lane: 6, trait: "Touch surface, buttons gone" },
  "33": { year: 2009, name: "Naga", maker: "Razer", lane: 5, trait: "Twelve side buttons" },
  "34": { year: 2010, name: "G700s", maker: "Logitech", lane: 5, trait: "Wireless, many buttons" },
  "35": { year: 2012, name: "G600", maker: "Logitech", lane: 5, trait: "Grid of side buttons" },
  "36": { year: 2015, name: "MX Master", maker: "Logitech", lane: 4, trait: "Thumb wheel" },
  "37": { year: 2019, name: "MX Master 3", maker: "Logitech", lane: 4, trait: "Sculpted hand shape" },
  "38": { year: 2019, name: "Pebble M350", maker: "Logitech", lane: 6, trait: "Flat pebble" },
  "39": { year: 2020, name: "G Pro X Superlight", maker: "Logitech", lane: 5, trait: "Lightweight, wireless" },
  "01": { year: 1964, name: "The Bug", maker: "Engelbart & English (SRI)", lane: 0, trait: "Wooden box body, two wheels" },
  "02": { year: 1968, name: "Rollkugel", maker: "Telefunken", lane: 1, trait: "Hemispherical dome, rolling ball" },
  "03": { year: 1973, name: "Alto Mouse", maker: "Xerox PARC", lane: 0, trait: "Three buttons, cable ends in two strands" },
  "04": { year: 1981, name: "Star 8010 Mouse", maker: "Xerox", lane: 0, trait: "Two buttons" },
  "05": { year: 1982, name: "P4", maker: "Logitech", lane: 1, trait: "Clear hemisphere, the inside shows" },
  "06": { year: 1983, name: "Microsoft Mouse (Bus)", maker: "Microsoft", lane: 0, trait: "Two green buttons" },
  "07": { year: 1983, name: "Lisa Mouse", maker: "Apple", lane: 0, trait: "One button" },
  "08": { year: 1984, name: "Macintosh 128K Mouse M0100", maker: "Apple", lane: 0, trait: "One button (the image shows the ball raised)" },
  "09": { year: 1985, name: "Serial Mouse", maker: "Microsoft", lane: 3, trait: "The body begins to round" }
};

// ===== 26 letters = 26 graft bodies =====
// origin: what the letter pictured in Phoenician / Greek.  graft: how that meaning moved into a mouse trait.
// parts: the first mouse gives the body (shell); the others give the inner machine (structure).
const LETTERS = {
  A: { origin: "Aleph, ox head", graft: "Two forked buttons rise like horns",
    parts: [{ m: "04", layer: "both" }, { m: "03", layer: "body" }] },
  B: { origin: "Beth, house", graft: "A box body stacked on another box body",
    parts: [{ m: "01", layer: "both" }, { m: "07", layer: "body" }] },
  C: { origin: "Gimel, camel or throwing stick", graft: "The body bends like a bow",
    parts: [{ m: "31", layer: "body" }, { m: "12", layer: "both" }] },
  D: { origin: "Daleth, door", graft: "A clear body opens inside a square frame",
    parts: [{ m: "14", layer: "both" }, { m: "23", layer: "body" }] },
  E: { origin: "He, a person with raised arms", graft: "A thumb rest grafted onto a body held upright",
    parts: [{ m: "24", layer: "both" }, { m: "37", layer: "body" }] },
  F: { origin: "Waw, hook", graft: "Cables of different eras hang from one body",
    parts: [{ m: "09", layer: "body" }, { m: "11", layer: "cable" }, { m: "06", layer: "cable" }] },
  G: { origin: "C with a stroke added", graft: "A thumb wheel added to the bent body",
    parts: [{ m: "31", layer: "body" }, { m: "36", layer: "body" }] },
  H: { origin: "Heth, fence", graft: "A row of buttons wraps around the body",
    parts: [{ m: "10", layer: "both" }, { m: "16", layer: "body" }, { m: "35", layer: "body" }] },
  I: { origin: "Yodh, hand and arm", graft: "A palm overlaps a body sculpted like a hand",
    parts: [{ m: "37", layer: "body" }, { m: "29", layer: "body" }] },
  J: { origin: "A letter with a tail split from I", graft: "The cable returns to a body that had lost it",
    parts: [{ m: "37", layer: "body" }, { m: "26", layer: "cable" }] },
  K: { origin: "Kaph, palm", graft: "Two palm-bearing bodies stacked",
    parts: [{ m: "25", layer: "body" }, { m: "29", layer: "body" }] },
  L: { origin: "Lamedh, ox goad", graft: "A scroll wheel pierces the body",
    parts: [{ m: "17", layer: "both" }, { m: "20", layer: "body" }, { m: "09", layer: "cable" }] },
  M: { origin: "Mem, water", graft: "A droplet-patterned surface spreads into a smooth water surface",
    parts: [{ m: "27", layer: "body" }, { m: "32", layer: "body" }] },
  N: { origin: "Nun, snake or fish", graft: "Two mice named for snakes become one body",
    parts: [{ m: "22", layer: "both" }, { m: "30", layer: "both" }] },
  O: { origin: "Ayin, eye", graft: "Ball, optical sensor and the object's eye gather in one place",
    parts: [{ m: "19", layer: "body" }, { m: "13", layer: "body" }, { m: "06", layer: "body" }] },
  P: { origin: "Pe, mouth", graft: "A drop-shaped body continues below a round opening",
    parts: [{ m: "21", layer: "both" }, { m: "18", layer: "body" }] },
  Q: { origin: "Qoph, eye of a needle", graft: "The oldest cable attaches as a tail to a round ball body",
    parts: [{ m: "13", layer: "body" }, { m: "02", layer: "cable" }] },
  R: { origin: "Resh, head", graft: "A dome on a dome becomes a head",
    parts: [{ m: "02", layer: "both" }, { m: "05", layer: "body" }, { m: "12", layer: "body" }] },
  S: { origin: "Shin, tooth", graft: "Side buttons and keys line up like teeth",
    parts: [{ m: "33", layer: "both" }, { m: "28", layer: "body" }] },
  T: { origin: "Taw, mark", graft: "The first body is marked with a two-strand cable and the first Macintosh",
    parts: [{ m: "01", layer: "body" }, { m: "08", layer: "body" }, { m: "03", layer: "cable" }] },
  U: { origin: "A letter split from V", graft: "Two bodies with the cable fully shed",
    parts: [{ m: "38", layer: "body" }, { m: "39", layer: "body" }] },
  V: { origin: "Waw, hook", graft: "A shell with the buttons absorbed into the body",
    parts: [{ m: "23", layer: "both" }, { m: "26", layer: "body" }] },
  W: { origin: "A letter made of V doubled", graft: "A buttonless surface folded twice",
    parts: [{ m: "23", layer: "body" }, { m: "26", layer: "body" }, { m: "32", layer: "body" }] },
  X: { origin: "Chi, cross", graft: "Two trackball bodies and two cables cross",
    parts: [{ m: "14", layer: "body" }, { m: "16", layer: "body" }, { m: "15", layer: "cable" }, { m: "17", layer: "cable" }] },
  Y: { origin: "Upsilon, fork", graft: "The cable splits in two and spreads like roots",
    parts: [{ m: "15", layer: "body" }, { m: "03", layer: "cable" }] },
  Z: { origin: "Zayin, weapon", graft: "Many buttons attach like weapons to a lightened body",
    parts: [{ m: "39", layer: "body" }, { m: "30", layer: "body" }, { m: "34", layer: "body" }] }
};