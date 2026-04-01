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

// Ansiklopedik Veritabanı
export const historicFigures: HistoricFigure[] = [
  // --- DEHALAR (YERLİ / İSLAM) ---
  {
    id: "g_loc_1",
    name: "Ali Kuşçu",
    type: "genius",
    origin: "local",
    title: "Matematik ve Astronomi Dehası",
    bio: "Semerkant'ta doğdu. Uluğ Bey'in rasathanesinde müdürlük yaptı. Fatih Sultan Mehmet döneminde İstanbul'a gelerek Ayasofya Medresesi'nde baş müderris oldu.",
    achievements: [
      "Fethiye adlı eseriyle modern astronominin temellerini attı.",
      "Gezegenlerin hareketlerini ve ekvatorun eğiklik derecesini aslına en yakın şekilde hesapladı.",
      "Matematik ve astronomiyi medreselerde ana bilim dalı haline getirdi."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Ali_Ku%C5%9F%C3%A7u_Portre.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Ali_Ku%C5%9F%C3%A7u"
  },
  {
    id: "g_loc_2",
    name: "Biruni",
    type: "genius",
    origin: "local",
    title: "Evrensel Bilim İnsanı",
    bio: "Dünyanın dönüşü ve yer çekimi kanunları üzerine Newton'dan asırlar önce çalıştı. Astronomi, matematik, tıp, coğrafya ve tarih alanlarında 140'tan fazla eser bıraktı.",
    achievements: [
      "Dünyanın yarıçapını ilk kez aslına çok yakın bir değerde (Trigonometrik formüllerle) hesapladı.",
      "Işığın hızının sesin hızından daha yüksek olduğunu kanıtladı.",
      "Hint kültürünü ve bilimini İslam coğrafyasına tanıttı."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Biruni-russian.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Biruni"
  },
  {
    id: "g_loc_3",
    name: "El Cezeri",
    type: "genius",
    origin: "local",
    title: "Mekaniğin ve Sibernetiğin Babası",
    bio: "Artuklu Sarayı'nda başmühendis olarak çalıştı. Mühendislik ve mekanik (robotik) tasarımların temel taşı olan 'Mekanik Hareketlerden Mühendislikte Faydalanmayı İçeren Kitap' eserini yazdı.",
    achievements: [
      "Dünyadaki ilk programlanabilir insansı robotları icat etti.",
      "Kam mili ve krank mili mekanizmalarını tasarlayarak modern motor sistemlerinin atasını oluşturdu.",
      "Su saatleri ve şifreli kilit sistemlerini geliştirdi."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Al-jazari_elephant_clock.png/960px-Al-jazari_elephant_clock.png",
    wikiUrl: "https://tr.wikipedia.org/wiki/El-Cezeri"
  },
  {
    id: "g_loc_4",
    name: "İbn-i Sina",
    type: "genius",
    origin: "local",
    title: "Tıbbın Hükümdarı",
    bio: "Batı'da 'Avicenna' olarak bilinir. Sadece tıp değil, felsefe, astronomi ve kimya alanlarında da Avrupa üniversitelerinde asırlarca okutulan devasa bir külliyat bıraktı.",
    achievements: [
      "El-Kanun fi't-Tıb (Tıbbın Kanunu) eseri modern tıbbın temelini oluşturdu.",
      "Hastalıkların mikroskobik organizmalarla yayıldığı fikrini öne sürdü.",
      "Felsefede Aristoteles ve Platon sentezleri yaparak Avrupa Rönesansına etki etti."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Avicenna_Bust%2C_left_profile_%28cropped%29.jpg/960px-Avicenna_Bust%2C_left_profile_%28cropped%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/%C4%B0bn-i_Sina"
  },
  {
    id: "g_loc_5",
    name: "Farabi",
    type: "genius",
    origin: "local",
    title: "İkinci Öğretmen (Muallim-i Sani)",
    bio: "Aristoteles'ten sonra gelen en büyük mantık ve devlet felsefesi uzmanı olarak 'İkinci Öğretmen' unvanını aldı.",
    achievements: [
      "Müziğin fizikle bağlantısını formülize edip 'Musiki el-Kebir' eserini yazdı.",
      "Bilimleri sınıflandıran ilk kapsamlı metodolojiyi geliştirdi.",
      "Erdemli Şehir (El-Medinetü'l Fazıla) kitabıyla ütopyaların öncülüğünü yaptı."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Alpharabius_in_Liber_Chronicarum_1493_AD.png",
    wikiUrl: "https://tr.wikipedia.org/wiki/Farabi"
  },

  // --- DEHALAR (YABANCI) ---
  {
    id: "g_for_1",
    name: "Albert Einstein",
    type: "genius",
    origin: "foreign",
    title: "Modern Fiziğin Öncüsü",
    bio: "20. yüzyılın en büyük bilim insanı. İzafiyet Teorisi ile Uzay, Zaman ve Kütleçekim kavramlarını tamamen değiştirdi. Nobel Fizik Ödülü sahibidir.",
    achievements: [
      "E=mc² formülüyle madde ve enerjinin eşdeğer olduğunu formülize etti.",
      "Fotoelektrik etki teorisini kanıtladı (Kuantum Fiziği).",
      "Genel ve Özel Görelilik teorilerini geliştirdi."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Albert_Einstein_Head_cleaned.jpg/960px-Albert_Einstein_Head_cleaned.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Albert_Einstein"
  },
  {
    id: "g_for_2",
    name: "Nikola Tesla",
    type: "genius",
    origin: "foreign",
    title: "Akımın ve İletişimin Büyücüsü",
    bio: "Alternatif akım (AC) sistemlerinin baş mucidi ve günümüzdeki modern elektrik ağının mimarıdır. Yüzlerce patenti ve buluşu bulunur.",
    achievements: [
      "Alternatif akım (AC) motor ve dağıtım altyapısını geliştirdi.",
      "Kablosuz enerji transferi ve radyo iletiminin temel teorisini kurdu.",
      "Tesla bobini sayesinde yüksek dalga boyu enerjileri keşfetti."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/79/Tesla_circa_1890.jpeg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Nikola_Tesla"
  },
  {
    id: "g_for_3",
    name: "Thomas Edison",
    type: "genius",
    origin: "foreign",
    title: "İcatların Tüccarı",
    bio: "Binlerce patente sahip girişimci deha. Buluşları kendi adıyla ticarileştirmiş ve dünyanın aydınlatma, ses iletimi ve sinema tarihinde devrim yaratmıştır.",
    achievements: [
      "Pratik ve uzun ömürlü akkor flamanlı ampulü icat edip seri üretime geçirdi.",
      "Sesi kaydeden phonograph (fonograf) sistemini buldu.",
      "Kinetoskop geliştirerek sinema filmlerinin izlenmesini sağladı."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Thomas_Edison2.jpg/960px-Thomas_Edison2.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Thomas_Edison"
  },
  {
    id: "g_for_4",
    name: "Isaac Newton",
    type: "genius",
    origin: "foreign",
    title: "Yerçekimi ve Kalkülüsün Dahisi",
    bio: "Klasik fiziğin temelini atan, evrensel kütleçekimi ve hareketin 3 yasasını formülize eden doğa filozofu ve bilim insanı.",
    achievements: [
      "Evrensel Kütleçekimi yasasını kanıtladı.",
      "Diferansiyel ve integral hesaplamalarını (Calculus) icat etti.",
      "Işığın spektroskopik analizini yaptı ve prizma deneylerini gerçekleştirdi."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg/960px-Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Isaac_Newton"
  },

  // --- EKONOMİSTLER (YERLİ / İSLAM) ---
  {
    id: "e_loc_1",
    name: "İbn-i Haldun",
    type: "economist",
    origin: "local",
    title: "Sosyoloji ve Ekonomi Politikasının Babası",
    bio: "Ünlü eseri 'Mukaddime' ile ekonominin psikoloji ile bağlantısını modern ekonomistlerden asırlar önce incelemiştir. Devletlerin de doğup, büyüyüp, çöktüğü döngüsünü formülize etti.",
    achievements: [
      "Arz ve Talebin fiyatlara etkisini belirten ilk bilim insanıdır.",
      "Vergi artışlarının vergi gelirlerini düşüreceği teorisini (Laffer Eğrisi'nin temeli) asırlar önce buldu.",
      "Emeği zenginliğin kaynağı olarak gördü."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Bust_of_Ibn_Khaldun_%28Casbah_of_Bejaia%2C_Algeria%29.jpg/960px-Bust_of_Ibn_Khaldun_%28Casbah_of_Bejaia%2C_Algeria%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/%C4%B0bn-i_Haldun"
  },
  {
    id: "e_loc_2",
    name: "İbn Rüşd",
    type: "economist",
    origin: "local",
    title: "Para Teorisi ve Ticaret",
    bio: "Felsefeci, hekim ve fıkıh alimi olmasının yanı sıra para felsefesi ve iktisat politikaları üzerine büyük analizler bıraktı.",
    achievements: [
      "Paranın sadece bir ölçü / mübadele birimi olduğunu, kendi başına değer üretmediğini saptadı.",
      "Tekel (monopol) piyasaların tüketici aleyhine işlediği felsefesini kurdu.",
      "Ekonomik adaletin zenginlik dağıtımı ile sağlanacağını savundu."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Andrea_di_bonaiuto%2C_apotesosi_di_san_tommaso_d%27aquino%2C_11_averro%C3%A8.jpg/960px-Andrea_di_bonaiuto%2C_apotesosi_di_san_tommaso_d%27aquino%2C_11_averro%C3%A8.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/%C4%B0bn_R%C3%BC%C5%9Fd"
  },
  {
    id: "e_loc_3",
    name: "Gazzali",
    type: "economist",
    origin: "local",
    title: "Refah Fonksiyonu Teorisyeni",
    bio: "Büyük din bilgini ve düşünür. İhya u Ulumid-Din eserinde toplumsal refah ve ihtiyaç hiyerarşisini günümüzdeki Maslow'dan çok önce tasvir etmiştir.",
    achievements: [
      "Maslahat (toplumsal fayda) kavramı ile zenginliğin paylaşım mekanizmalarını modelledi.",
      "Altın ve gümüşün istiflenmesinin (tedavüle girmemesinin) ekonomiyi yok edeceğini savundu.",
      "Devletin kamu harcamalarını piyasayı dengelemek için kullanması gerektiğini öngördü."
    ],
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80",
    wikiUrl: "https://tr.wikipedia.org/wiki/Gazzali"
  },
  {
    id: "e_loc_4",
    name: "Tusi (Nasîrüddin Tûsî)",
    type: "economist",
    origin: "local",
    title: "Vergi ve Kamu Ekonomisti",
    bio: "Ahlak-ı Nasıri eserinde devlet ekonomisi, hanehalkı harcamaları ve kamu maliyesi denklemlerini matematiksel bir zemine oturtmuştur.",
    achievements: [
      "Bütçe açığı ve bütçe fazlası gibi konularda devlet felsefesi geliştirdi.",
      "İhtisaslaşmanın (işbölümü) üretkenliği ve zenginliği artıracağı kanununu ilk kez net olarak açıkladı."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/75/Nasir_al-Din_Tusi.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/N%C3%A2s%C4%B1r%C3%BCddin_T%C3%BBs%C3%AE"
  },

  // --- EKONOMİSTLER (YABANCI) ---
  {
    id: "e_for_1",
    name: "Adam Smith",
    type: "economist",
    origin: "foreign",
    title: "Klasik Ekonominin Kurucusu",
    bio: "Ulusların Zenginliği (1776) adlı dev eseriyle kapitalizmin ve serbest piyasa ekonomisinin manifestosunu yazdı.",
    achievements: [
      "Görünmez El teorisini ortaya atarak piyasanın kendini düzenleyeceğini kanıtladı.",
      "İş bölümü ve uzmanlaşmanın ekonomik makineleşmenin temeli olduğunu savundu.",
      "Merkantilist (korumacı altın birikimi) tezleri çürüttü."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Adam_Smith_The_Muir_portrait.jpg/960px-Adam_Smith_The_Muir_portrait.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Adam_Smith"
  },
  {
    id: "e_for_2",
    name: "John Maynard Keynes",
    type: "economist",
    origin: "foreign",
    title: "Makroekonominin Babası",
    bio: "1929 Büyük Buhranı sırasında piyasaların kendi haline bırakılmasının kurtuluş getirmediğini görüp devlet müdahalesini (Keynesyen Ekonomi) sistemleştirdi.",
    achievements: [
      "Devletin altyapı projeleri yaparak halka nakit enjekte etmesi gerektiğini (Talebi Canlandırma) buldu.",
      "İstihdam, Faiz Sınırı ve Para Genel Teorisi kitabını yazarak modern global Merkez Bankalarının doktrinini çizdi.",
      "Toplanmış tasarrufların ancak yatırıma dönüşürse ekonominin işleyeceğini kanıtladı."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5f/John_Maynard_Keynes_%281929%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/John_Maynard_Keynes"
  },
  {
    id: "e_for_3",
    name: "Karl Marx",
    type: "economist",
    origin: "foreign",
    title: "Ekonomi Politiğin Eleştirmeni",
    bio: "Das Kapital adlı eseriyle kapitalist ekonomik dizilişin sosyolojik analizini yaparak üretim araçlarının sınıf çatışmalarını modelleyen filozof ve iktisatçıdır.",
    achievements: [
      "Artı-değer (Surplus value) teorisi ile kârın, emeğin ödenmeyen değerinden doğduğunu savundu.",
      "Devrevi krizlerin kapitalizmin doğası gereği kaçınılmaz olduğunu formülize etti.",
      "Emek değer teorisini sosyolojiyle birleştirdi."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Karl_Marx_by_John_Jabez_Edwin_Mayall_1875_-_Restored_%26_Adjusted_%283x4_cropped_b%29.png/960px-Karl_Marx_by_John_Jabez_Edwin_Mayall_1875_-_Restored_%26_Adjusted_%283x4_cropped_b%29.png",
    wikiUrl: "https://tr.wikipedia.org/wiki/Karl_Marx"
  },
  {
    id: "e_for_4",
    name: "Milton Friedman",
    type: "economist",
    origin: "foreign",
    title: "Monetarizmin Mimarı",
    bio: "Chicago Okulu'nun lideri. Enflasyonun sadece ve sadece parasal bir olgu olduğunu, devlet müdahalelerinin ekonomiyi bozduğunu savunur.",
    achievements: [
      "Para Piyasası Teorisi'ni (Monetarism) güncelledi.",
      "Serbest kurları şiddetle savunarak dünyada serbest piyasa ekonomisinin canlanmasını sağladı.",
      "1976'da Nobel Ekonomi Ödülü'nü aldı."
    ],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Portrait_of_Milton_Friedman_%284x5_cropped%29.jpg/960px-Portrait_of_Milton_Friedman_%284x5_cropped%29.jpg",
    wikiUrl: "https://tr.wikipedia.org/wiki/Milton_Friedman"
  }
];
