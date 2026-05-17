export type FigureType = "economist";
export type FigureOrigin = "local" | "foreign";

export interface HistoricFigure {
  id: string;
  name: string;
  type: FigureType;
  origin: FigureOrigin;
  wikiSlug: string; 
  title?: string;
  bio?: string;
  achievements?: string[];
  imageUrl?: string;
  wikiUrl?: string;
}

export const historicFiguresRegistry: HistoricFigure[] = [
  // --- YERLİ / İSLAMİ EKONOMİSTLER (local) ---
  { id: "reg_l_1", name: "İbn-i Haldun", type: "economist", origin: "local", wikiSlug: "İbn-i_Haldun" },
  { id: "reg_l_2", name: "Gazzali", type: "economist", origin: "local", wikiSlug: "Gazzali" },
  { id: "reg_l_3", name: "Ahi Evran", type: "economist", origin: "local", wikiSlug: "Ahi_Evran" },
  { id: "reg_l_4", name: "Kemal Derviş", type: "economist", origin: "local", wikiSlug: "Kemal_Derviş" },
  { id: "reg_l_5", name: "Özgür Demirtaş", type: "economist", origin: "local", wikiSlug: "Özgür_Demirtaş" },
  { id: "reg_l_6", name: "Daron Acemoğlu", type: "economist", origin: "local", wikiSlug: "Daron_Acemoğlu" },
  { id: "reg_l_7", name: "Refet Gürkaynak", type: "economist", origin: "local", wikiSlug: "Refet_Gürkaynak" },
  { id: "reg_l_8", name: "Mahfi Eğilmez", type: "economist", origin: "local", wikiSlug: "Mahfi_Eğilmez" },
  { id: "reg_l_9", name: "Sabri Ülgener", type: "economist", origin: "local", wikiSlug: "Sabri_Ülgener" },
  { id: "reg_l_10", name: "İdris Küçükömer", type: "economist", origin: "local", wikiSlug: "İdris_Küçükömer" },
  { id: "reg_l_11", name: "Şevket Pamuk", type: "economist", origin: "local", wikiSlug: "Şevket_Pamuk" },
  { id: "reg_l_12", name: "Gülten Kazgan", type: "economist", origin: "local", wikiSlug: "Gülten_Kazgan" },
  { id: "reg_l_13", name: "Ahmet Cevdet Paşa", type: "economist", origin: "local", wikiSlug: "Ahmet_Cevdet_Paşa" },
  { id: "reg_l_14", name: "Ömer Lütfi Barkan", type: "economist", origin: "local", wikiSlug: "Ömer_Lütfi_Barkan" },
  { id: "reg_l_15", name: "Korkut Boratav", type: "economist", origin: "local", wikiSlug: "Korkut_Boratav" },
  { id: "reg_l_16", name: "Dani Rodrik", type: "economist", origin: "local", wikiSlug: "Dani_Rodrik" },
  { id: "reg_l_17", name: "Tansu Çiller", type: "economist", origin: "local", wikiSlug: "Tansu_Çiller" },
  { id: "reg_l_18", name: "Ayşe Buğra", type: "economist", origin: "local", wikiSlug: "Ayşe_Buğra" },
  { id: "reg_l_19", name: "Seyfettin Gürsel", type: "economist", origin: "local", wikiSlug: "Seyfettin_Gürsel" },
  { id: "reg_l_20", name: "Erinç Yeldan", type: "economist", origin: "local", wikiSlug: "Erinç_Yeldan" },
  { id: "reg_l_21", name: "Ege Cansen", type: "economist", origin: "local", wikiSlug: "Ege_Cansen" },
  { id: "reg_l_22", name: "Atilla Yeşilada", type: "economist", origin: "local", wikiSlug: "Atilla_Yeşilada" },
  { id: "reg_l_23", name: "Selva Demiralp", type: "economist", origin: "local", wikiSlug: "Selva_Demiralp" },

  // --- YABANCI EKONOMİSTLER (foreign) ---
  { id: "reg_f_1", name: "Adam Smith", type: "economist", origin: "foreign", wikiSlug: "Adam_Smith" },
  { id: "reg_f_2", name: "John Maynard Keynes", type: "economist", origin: "foreign", wikiSlug: "John_Maynard_Keynes" },
  { id: "reg_f_3", name: "Milton Friedman", type: "economist", origin: "foreign", wikiSlug: "Milton_Friedman" },
  { id: "reg_f_4", name: "David Ricardo", type: "economist", origin: "foreign", wikiSlug: "David_Ricardo" },
  { id: "reg_f_5", name: "Friedrich Hayek", type: "economist", origin: "foreign", wikiSlug: "Friedrich_Hayek" },
  { id: "reg_f_6", name: "Karl Marx", type: "economist", origin: "foreign", wikiSlug: "Karl_Marx" },
  { id: "reg_f_7", name: "Joseph Schumpeter", type: "economist", origin: "foreign", wikiSlug: "Joseph_Schumpeter" },
  { id: "reg_f_8", name: "Amartya Sen", type: "economist", origin: "foreign", wikiSlug: "Amartya_Sen" },
  { id: "reg_f_9", name: "Thomas Malthus", type: "economist", origin: "foreign", wikiSlug: "Thomas_Robert_Malthus" },
  { id: "reg_f_10", name: "Alfred Marshall", type: "economist", origin: "foreign", wikiSlug: "Alfred_Marshall" },
  { id: "reg_f_11", name: "Ludwig von Mises", type: "economist", origin: "foreign", wikiSlug: "Ludwig_von_Mises" },
  { id: "reg_f_12", name: "Paul Samuelson", type: "economist", origin: "foreign", wikiSlug: "Paul_Samuelson" },
  { id: "reg_f_13", name: "Robert Solow", type: "economist", origin: "foreign", wikiSlug: "Robert_Solow" },
  { id: "reg_f_14", name: "Gary Becker", type: "economist", origin: "foreign", wikiSlug: "Gary_Becker" },
  { id: "reg_f_15", name: "Joan Robinson", type: "economist", origin: "foreign", wikiSlug: "Joan_Robinson" },
  { id: "reg_f_16", name: "Thorstein Veblen", type: "economist", origin: "foreign", wikiSlug: "Thorstein_Veblen" },
  { id: "reg_f_17", name: "Elinor Ostrom", type: "economist", origin: "foreign", wikiSlug: "Elinor_Ostrom" },
  { id: "reg_f_18", name: "Janet Yellen", type: "economist", origin: "foreign", wikiSlug: "Janet_Yellen" },
  { id: "reg_f_19", name: "Christine Lagarde", type: "economist", origin: "foreign", wikiSlug: "Christine_Lagarde" },
  { id: "reg_f_20", name: "Thomas Piketty", type: "economist", origin: "foreign", wikiSlug: "Thomas_Piketty" },
  { id: "reg_f_21", name: "Nassim Taleb", type: "economist", origin: "foreign", wikiSlug: "Nassim_Nicholas_Taleb" },
  { id: "reg_f_22", name: "Daniel Kahneman", type: "economist", origin: "foreign", wikiSlug: "Daniel_Kahneman" },
  { id: "reg_f_23", name: "Joseph Stiglitz", type: "economist", origin: "foreign", wikiSlug: "Joseph_Stiglitz" },
  { id: "reg_f_24", name: "Paul Krugman", type: "economist", origin: "foreign", wikiSlug: "Paul_Krugman" },
  { id: "reg_f_25", name: "Ben Bernanke", type: "economist", origin: "foreign", wikiSlug: "Ben_Bernanke" },
  { id: "reg_f_26", name: "Claudia Goldin", type: "economist", origin: "foreign", wikiSlug: "Claudia_Goldin" },
  { id: "reg_f_27", name: "Esther Duflo", type: "economist", origin: "foreign", wikiSlug: "Esther_Duflo" },
  { id: "reg_f_28", name: "Jeffrey Sachs", type: "economist", origin: "foreign", wikiSlug: "Jeffrey_Sachs" },
  { id: "reg_f_29", name: "Hernando de Soto", type: "economist", origin: "foreign", wikiSlug: "Hernando_de_Soto_Polar" },
];

export const historicFigures: HistoricFigure[] = [
  {
    id: "g_loc_1",
    name: "İbn-i Haldun",
    type: "economist",
    origin: "local",
    title: "Modern Ekonomi ve Sosyolojinin Öncüsü",
    bio: "Mukaddime adlı eseriyle iktisadi düşüncenin temellerini atmış, arz-talep ve vergi teorileri üzerine çalışmıştır.",
    achievements: ["Mukaddime adlı eseri yazdı.", "Devletlerin ekonomik döngülerini teorize etti."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Ibn_Khaldun_monument_in_Tunis.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/İbn-i_Haldun",
    wikiSlug: "İbn-i_Haldun"
  },
  {
      id: "g_for_1",
      name: "Adam Smith",
      type: "economist",
      origin: "foreign",
      title: "Klasik Ekonominin Babası",
      bio: "Ulusların Zenginliği eseriyle modern ekonominin temel prensiplerini ve 'Görünmez El' kavramını ortaya koymuştur.",
      achievements: ["Ulusların Zenginliği'ni yazdı.", "Serbest piyasa ekonomisinin temellerini attı."],
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/AdamSmith.jpg",
      wikiUrl: "https://tr.wikipedia.org/wiki/Adam_Smith",
      wikiSlug: "Adam_Smith"
  }
];
