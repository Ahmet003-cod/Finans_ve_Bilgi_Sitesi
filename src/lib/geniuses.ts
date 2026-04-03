export type FigureType = "economist" | "genius";
export type FigureOrigin = "local" | "foreign";

export interface HistoricFigure {
  id: string;
  name: string;
  type: FigureType;
  origin: FigureOrigin;
  title: string;
  bio: string;
  achievements: string[];
  imageUrl: string;
  wikiUrl: string;
}

// Devasa Ansiklopedik Veritabanı (~80+ Figür)
export const historicFigures: HistoricFigure[] = [
  // --- DEHALAR (YERLİ / İSLAM) ---
  {
    id: "g_loc_1",
    name: "Ali Kuşçu",
    type: "genius",
    origin: "local",
    title: "Matematik ve Astronomi Dehası",
    bio: "Semerkant'ta doğdu. Uluğ Bey'in rasathanesinde müdürlük yaptı. Ayasofya Medresesi'nde baş müderris oldu.",
    achievements: ["Fethiye adlı eseriyle astronominin temellerini attı.", "Ekvatorun eğiklik derecesini hesapladı.", "Matematiği medreselerde ana bilim dalı yaptı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Ali_Ku%C5%9F%C3%A7u_Portre.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Ali_Ku%C5%9F%C3%A7u"
  },
  {
    id: "g_loc_2",
    name: "Biruni",
    type: "genius",
    origin: "local",
    title: "Evrensel Bilim İnsanı",
    bio: "Dünyanın dönüşü ve yer çekimi üzerine çalıştı. Astronomi, tıp ve coğrafyada 140'tan fazla eser bıraktı.",
    achievements: ["Dünyanın yarıçapını trigonometri ile hesapladı.", "Işık hızının sesten yüksek olduğunu kanıtladı.", "Yer çekimi kanunu üzerine teoriler geliştirdi."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Biruni-russian.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Biruni"
  },
  {
    id: "g_loc_3",
    name: "El Cezeri",
    type: "genius",
    origin: "local",
    title: "Mekaniğin ve Sibernetiğin Babası",
    bio: "Artuklu Sarayı başmühendisi. Mühendislik ve robotik tasarımların temel taşı olan eserler yazdı.",
    achievements: ["İlk programlanabilir insansı robotları icat etti.", "Krank mili mekanizmasını tasarladı.", "Su saatleri ve şifreli kilitler geliştirdi."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Al-jazari_elephant_clock.png/960px-Al-jazari_elephant_clock.png",
    wikiUrl: "https://tr.wikipedia.org/wiki/El-Cezeri"
  },
  {
    id: "g_loc_4",
    name: "İbn-i Sina",
    type: "genius",
    origin: "local",
    title: "Tıbbın Hükümdarı",
    bio: "Batı'da 'Avicenna' olarak bilinir. Avrupa üniversitelerinde asırlarca okutulan tıp külliyatını bıraktı.",
    achievements: ["Tıbbın Kanunu eseri modern tıbbın temelidir.", "Mikroskobik organizmaların etkisini öne sürdü.", "Felsefe ve astronomide çığır açtı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Avicenna_Bust%2C_left_profile_%28cropped%29.jpg/960px-Avicenna_Bust%2C_left_profile_%28cropped%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/%C4%B0bn-i_Sina"
  },
  {
    id: "g_loc_6",
    name: "Harezmi",
    type: "genius",
    origin: "local",
    title: "Cebirin Babası",
    bio: "Horasanlı matematikçi. 'Algoritma' terimi isminin Latinceleşmiş halidir. '0' rakamını matematiğe kazandırdı.",
    achievements: ["Cebir bilimini sistemleştirdi.", "Algoritma mantığıyla bilgisayar biliminin temelini attı.", "Trigonometri ve astronomi çalışmaları yaptı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Khwarizmi_Bust.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Harezmi"
  },
  {
    id: "g_loc_7",
    name: "Akşemseddin",
    type: "genius",
    origin: "local",
    title: "Mikrobiyolojinin Öncüsü",
    bio: "Fatih'in hocası. Pasteur'den 400 yıl önce mikropların (tohumların) hastalık yaydığından bahsetti.",
    achievements: ["Hastalıkların küçük tohumlarla geçtiğini saptadı.", "Kanser üzerine ilk bilimsel tanımları yaptı.", "Maidetü'l-Hayat eserini yazdı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/%C5%9Eemseddin_Ak.jpg/960px-%C5%9Eemseddin_Ak.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Ak%C5%9femseddin"
  },
  {
    id: "g_loc_8",
    name: "Piri Reis",
    type: "genius",
    origin: "local",
    title: "Büyük Türk Kartografı",
    bio: "Osmanlı denizcisi. 1513 tarihli dünya haritası ile Amerika'yı en doğru çizen ilk haritacılardandır.",
    achievements: ["Dünya haritasını ceylan derisine çizdi.", "Kitab-ı Bahriye denizcilik eserini yazdı.", "Antarktika kıyılarını henüz keşfedilmeden gösterdi."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Piri_Reis.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Piri_Reis"
  },
  {
    id: "g_loc_9",
    name: "Mimar Sinan",
    type: "genius",
    origin: "local",
    title: "Mimarlık ve Mühendislik Dahisi",
    bio: "Osmanlı mimarisinin en büyük ustası. 300'den fazla eser bırakmış, deprem dayanıklılığında devrim yapmıştır.",
    achievements: ["Selimiye Camii ile statikte zirveye ulaştı.", "Radye temel sistemini andıran yapılar kurdu.", "Akustik sistemleri matematiksel tasarladı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Mimar_Sinan_statue_Sultanahmet.jpg/960px-Mimar_Sinan_statue_Sultanahmet.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Mimar_Sinan"
  },
  {
    id: "g_loc_13",
    name: "Cabir bin Hayyan",
    type: "genius",
    origin: "local",
    title: "Kimyanın Babası",
    bio: "Modern kimyanın kurucusu sayılır. Atomun parçalanabileceğini asırlar önce vurgulamıştır.",
    achievements: ["Damıtma ve kristalleştirme tekniklerini buldu.", "İlk kimya laboratuvarını kurdu.", "Nitrik asit ve sülfürik asiti keşfetti."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Jabir_ibn_Hayyan.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Cabir_bin_Hayyan"
  },
  {
    id: "g_loc_14",
    name: "Takiyüddin",
    type: "genius",
    origin: "local",
    title: "Hassas Gözlemin Ustası",
    bio: "İstanbul rasathanesinin kurucusu. Optik, matematik ve astronomide döneminin en ileri cihazlarını yaptı.",
    achievements: ["Mekanik saatleri astronomide kullandı.", "Işığın yansıma ve kırılma kanunlarını inceledi.", "Trigonometrik cetveller hazırladı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Taqi_al-Din_Mehmet.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Takiy%C3%BCddin"
  },

  // --- DEHALAR (YABANCI) ---
  {
    id: "g_for_1",
    name: "Albert Einstein",
    type: "genius",
    origin: "foreign",
    title: "Modern Fiziğin Öncüsü",
    bio: "İzafiyet Teorisi ile Uzay, Zaman ve Kütleçekimi kavramlarını tamamen değiştirdi. Nobel ödülü sahibidir.",
    achievements: ["E=mc² formülünü geliştirdi.", "Fotoelektrik etkiyi teorize etti.", "Görelilik teorilerini kurdu."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Albert_Einstein_Head_cleaned.jpg/960px-Albert_Einstein_Head_cleaned.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Albert_Einstein"
  },
  {
    id: "g_for_2",
    name: "Nikola Tesla",
    type: "genius",
    origin: "foreign",
    title: "Akımın ve İletişimin Büyücüsü",
    bio: "Alternatif akım (AC) sistemlerinin baş mucididir. Modern elektrik ağının mimarıdır.",
    achievements: ["AC motor ve dağıtım sistemini kurdu.", "Kablosuz enerji transferini keşfetti.", "Tesla bobini ve radyo sistemlerini buldu."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/79/Tesla_circa_1890.jpeg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Nikola_Tesla"
  },
  {
    id: "g_for_5",
    name: "Leonardo da Vinci",
    type: "genius",
    origin: "foreign",
    title: "Rönesansın Polymath Dahisi",
    bio: "Ressam ve mucit. Helikopterden tanklara kadar modern makinelerin taslaklarını 1500'lerde çizdi.",
    achievements: ["İnsan anatomisini cerrahi hassasiyetle inceledi.", "Aerodinamik prensiplerini modelledi.", "Sanat ve bilimi perspektifle birleştirdi."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Leonardo_da_Vinci_self_portrait.jpg/960px-Leonardo_da_Vinci_self_portrait.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Leonardo_da_Vinci"
  },
  {
    id: "g_for_6",
    name: "Marie Curie",
    type: "genius",
    origin: "foreign",
    title: "Radyoaktivitenin Annesi",
    bio: "İki farklı alanda Nobel alan tek bilim insanı. Radyoaktiviteyi keşfederek tıpta devrim yaptı.",
    achievements: ["Polonyum ve Radyum elementlerini buldu.", "Radyoaktivite terimini literatüre kattı.", "Seyyar röntgen cihazlarını geliştirdi."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Marie_Curie_2.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Marie_Curie"
  },
  {
    id: "g_for_8",
    name: "Alan Turing",
    type: "genius",
    origin: "foreign",
    title: "Bilgisayar Biliminin Mimarı",
    bio: "Modern bilgisayarın babası sayılır. II. Dünya Savaşı'nda Enigma şifresini kırarak tarihi değiştirdi.",
    achievements: ["Turing Makinesi ile bilgisayar teorisini kurdu.", "Yapay zekanın temeli olan Turing Testi'ni buldu.", "Modern kriptolojinin temelini attı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/17/Alan_Turing_at_26.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Alan_Turing"
  },
  {
    id: "g_for_10",
    name: "Stephen Hawking",
    type: "genius",
    origin: "foreign",
    title: "Karadeliklerin Efendisi",
    bio: "Karadelikler ve kuantum gravitesi üzerine çalıştı. Evrenin kökeni üzerine dev modeller kurdu.",
    achievements: ["Hawking Radyasyonu teorisini kanıtladı.", "Büyük Patlama matematiksel modelini geliştirdi.", "Zamanın Kısa Tarihi eserini yazdı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Stephen_Hawking.StarChild.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Stephen_Hawking"
  },
  {
    id: "g_for_11",
    name: "Galileo Galilei",
    type: "genius",
    origin: "foreign",
    title: "Modern Astronominin Babası",
    bio: "Güneş merkezli evren teorisini savundu. Teleskopu bilimsel amaçla kullanan ilk büyük dehadır.",
    achievements: ["Jüpiter uydularını keşfetti.", "Eylemsizlik prensibini modelledi.", "Modern bilimsel yöntemin temelini attı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Justus_Suttermans_-_Portrait_of_Galileo_Galilei.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Galileo_Galilei"
  },
  {
    id: "g_for_12",
    name: "Isaac Newton",
    type: "genius",
    origin: "foreign",
    title: "Fiziğin ve Kalkülüsün Dahisi",
    bio: "Klasik fiziğin temelini atan, evrensel kütleçekimi yasalarını formüle eden bilim insanı.",
    achievements: ["Kütleçekim yasasını kanıtladı.", "Kalkülüs (Calculus) matematiğini icat etti.", "Işığın renk spektrumunu keşfetti."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg/960px-Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Isaac_Newton"
  },

  // --- EKONOMİSTLER (YERLİ / İSLAM) ---
  {
    id: "e_loc_1",
    name: "İbn-i Haldun",
    type: "economist",
    origin: "local",
    title: "Ekonomi Politikasının Babası",
    bio: "Mukaddime eseriyle ekonominin sosyoloji ile bağını inceledi. Arz-Talep dengesini ilk saptayanlardandır.",
    achievements: ["Vergi artışının geliri düşüreceğini buldu.", "Emeği zenginliğin kaynağı olarak gördü.", "Devlet döngüsü teorisini kurdu."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Bust_of_Ibn_Khaldun_%28Casbah_of_Bejaia%2C_Algeria%29.jpg/960px-Bust_of_Ibn_Khaldun_%28Casbah_of_Bejaia%2C_Algeria%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/%C4%B0bn-i_Haldun"
  },
  {
    id: "e_loc_3",
    name: "Gazzali",
    type: "economist",
    origin: "local",
    title: "Refah Teorisyeni",
    bio: "Toplumsal refah ve ihtiyaç hiyerarşisini modelledi. Paranın biriktirilmesinin ekonomiye zararını vurguladı.",
    achievements: ["Maslahat (toplumsal fayda) kavramını geliştirdi.", "Altın istifçiliğine karşı çıktı.", "Kamu harcaması dengesini öngördü."],
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80",
    wikiUrl: "https://tr.wikipedia.org/wiki/Gazzali"
  },
  {
    id: "e_loc_5",
    name: "Mufti Taqi Usmani",
    type: "economist",
    origin: "local",
    title: "Modern İslam Finansının Mimarı",
    bio: "Günümüz İslam bankacılığının küresel otoritesidir. Faizsiz finans standartlarını (AAOIFI) belirlemiştir.",
    achievements: ["Sukuk ve Murabaha araçlarını modernize etti.", "Şer'i finans standartlarını yazdı.", "Hukuku iktisadi çözümlere uyarladı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Mufti_Taqi_Usmani.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Muhammed_Tak%C3%AE_Osm%C3%A2n%C3%AE"
  },
  {
    id: "e_loc_7",
    name: "Ahmet Cevdet Paşa",
    type: "economist",
    origin: "local",
    title: "Piyasa Hukukunun Mimarı",
    bio: "Osmanlı hukukçusu ve tarihçisi. Mecelle'yi hazırlayarak borçlar ve ticaret kurallarını birleştirdi.",
    achievements: ["Mecelle ile ticaret hukukunu kurdu.", "Osmanlı maliye reformlarına yön verdi.", "İktisadi analizlerini tarihe not düştü."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Ahmed_Cevdet_Pasha.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Ahmet_Cevdet_Pa%C5%9Fa"
  },
  {
    id: "e_loc_8",
    name: "Ahi Evran",
    type: "economist",
    origin: "local",
    title: "Esnaf İktisadının Kurucusu",
    bio: "Ahilik teşkilatının mimarıdır. Üretim, kalite kontrol ve etik ticaret kurallarını sistemleştirmiştir.",
    achievements: ["Dayanışma ekonomisi modelini kurdu.", "Çıraklık ve kalite standartlarını belirledi.", "Esnaf birlikleri hiyerarşisini dizayn etti."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Ahi_Evran_Heykeli.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Ahi_Evran"
  },
  {
    id: "e_loc_10",
    name: "Şeyh Edebali",
    type: "economist",
    origin: "local",
    title: "Devlet İktisadı Düşünürü",
    bio: "Osmanlı'nın kuruluş ruhu. İnsanı yaşatmanın devleti yaşatmak olduğunu vurgulayarak sosyal iktisadı temellendirdi.",
    achievements: ["Merkezi adalet ve zenginlik paylaşımını savundu.", "Vakıf sisteminin manevi temelini attı.", "Üretim ahlakı üzerine tavsiyeler bıraktı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/Sheikh_Edebali_Monument.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/%C5%9Eeyh_Edebali"
  },

  // --- EKONOMİSTLER (YABANCI) ---
  {
    id: "e_for_1",
    name: "Adam Smith",
    type: "economist",
    origin: "foreign",
    title: "Modern Ekonominin Babası",
    bio: "Ulusların Zenginliği eseriyle kapitalizmin manifestosunu yazdı. Serbest piyasa doktrinini kurdu.",
    achievements: ["Görünmez El teorisini buldu.", "İş bölümü ve uzmanlaşmayı modelledi.", "Korumacı ekonomi teorilerini çürüttü."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Adam_Smith_The_Muir_portrait.jpg/960px-Adam_Smith_The_Muir_portrait.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Adam_Smith"
  },
  {
    id: "e_for_2",
    name: "John Maynard Keynes",
    type: "economist",
    origin: "foreign",
    title: "Makroekonominin Babası",
    bio: "Büyük Buhran döneminde devlet müdahalesini sistemleştirdi. Modern Merkez Bankası doktrinlerini dizayn etti.",
    achievements: ["Talep yönetimi ve maliye politikasını kurdu.", "Genel Teori eserini kaleme aldı.", "Küresel para sistemlerine yön verdi."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5f/John_Maynard_Keynes_%281929%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/John_Maynard_Keynes"
  },
  {
    id: "e_for_4",
    name: "Milton Friedman",
    type: "economist",
    origin: "foreign",
    title: "Monetarizmin Mimarı",
    bio: "Chicago Okulu lideri. Enflasyonun parasal bir olgu olduğunu kanıtladı. Serbest kurları savundu.",
    achievements: ["Monetarizm teorisini güncelledi.", "Devletin ekonomi etkisini minimize etti.", "1976 Nobel Ekonomi Ödülü'nü aldı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Portrait_of_Milton_Friedman_%284x5_cropped%29.jpg/960px-Portrait_of_Milton_Friedman_%284x5_cropped%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Milton_Friedman"
  },
  {
    id: "e_for_5",
    name: "David Ricardo",
    type: "economist",
    origin: "foreign",
    title: "Ticaret Kanunu Üstadı",
    bio: "Klasik iktisatçı. Uluslararası ticaret ve rant teorileriyle serbest ticareti bilimselleştirdi.",
    achievements: ["Karşılaştırmalı Üstünlükler yasasını buldu.", "Diferansiyel rant teorisini modelledi.", "Altın standart sistemini savundu."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/David_Ricardo_by_Thomas_Phillips_edit.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/David_Ricardo"
  },
  {
    id: "e_for_6",
    name: "Friedrich Hayek",
    type: "economist",
    origin: "foreign",
    title: "Fiyat Mekanizması Kaşifi",
    bio: "Fiyatların bilgi sinyali olduğunu vurguladı. Devletin merkezi planlamasına şiddetle karşı çıktı.",
    achievements: ["Bilgi problemi üzerine teoriler kurdu.", "Kölelik Yolu eserini yazdı.", "Nobel Ekonomi Ödülü'ne layık görüldü."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Friedrich_Hayek_portrait.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Friedrich_Hayek"
  },
  {
    id: "e_for_7",
    name: "Joseph Schumpeter",
    type: "economist",
    origin: "foreign",
    title: "İnovasyon Dahisi",
    bio: "Girişimciyi ekonominin ana motoru olarak gördü. 'Yaratıcı Yıkım' ile kapitalizmin dinamizmini açıkladı.",
    achievements: ["Yaratıcı Yıkım kavramını literatüre kattı.", "Girişimcilik ve teknoloji bağını kurdu.", "İş döngüleri üzerine dev eserler bıraktı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Joseph_Schumpeter.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Joseph_Schumpeter"
  },
  {
    id: "e_for_9",
    name: "Amartya Sen",
    type: "economist",
    origin: "foreign",
    title: "Etik ve Refah İktisatçısı",
    bio: "Sosyal adalet ve kıtlık üzerine çalıştı. İnsani Gelişme Endeksi'nin kavramsal kurucusudur.",
    achievements: ["Kıtlığın dağılım kaynaklı olduğunu gösterdi.", "Refah ekonomisini insan haklarıyla birleştirdi.", "Nobel ödüllü bilge bir iktisatçıdır."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Amartya_Sen_2011.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Amartya_Sen"
  },
  {
    id: "e_for_10",
    name: "Alfred Marshall",
    type: "economist",
    origin: "foreign",
    title: "Neoklasik İktisadın Mimarı",
    bio: "Arz ve Talep diyagramlarını standartlaştırdı. Modern iktisat eğitiminin temelini atan isimdir.",
    achievements: ["Talebin Fiyat Esnekliği kavramını buldu.", "Marshall Geçidi analizini getirdi.", "İktisadın İlkeleri eserini yazdı."],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Alfred_Marshall_1.png/960px-Alfred_Marshall_1.png",
    wikiUrl: "https://tr.wikipedia.org/wiki/Alfred_Marshall"
  }
];
