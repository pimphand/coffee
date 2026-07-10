// Single-source-of-truth blog fallback data shared by /blog list and
// /blog/[slug]. Add or change posts here and they will appear on both
// pages. Localized via `localizeBlogPost()` from src/i18n/utils.ts so
// adding a new locale is a matter of adding `_xx` fields + extending
// the `Locale` type in src/i18n/ui.ts.
//
// All post images point at real Brew Haven coffee photos under
// home-coffee/ so the blog list and detail pages match the coffee-shop
// theme without any leftover generic innerpage placeholders.

export interface BlogPost {
  slug:      string;
  title_en:  string;
  title_id:  string;
  excerpt_en: string;
  excerpt_id: string;
  body_en:   string[];
  body_id:   string[];
  image:     string;
  author:    string;
  date:      string;
}

export const posts: BlogPost[] = [
  {
    slug:       'local-beans-global-dreams',
    title_en:   'Local Beans, Global Dreams',
    title_id:   'Biji Lokal, Mimpi Global',
    excerpt_en: 'Why sourcing our coffee from ethical farms around the world makes a difference every day.',
    excerpt_id: 'Mengapa kami mengambil biji kopi dari perkebunan etis di seluruh dunia dan bagaimana hal itu memberi dampak setiap hari.',
    image:      '/assets/images/home-coffee/blog/blog-img1.webp',
    author:     'John',
    date:       'May 19, 2025',
    body_en: [
      "When the temperatures rise, the last thing you want is a heavy, complicated meal. Our list of easy summer dishes is perfect for keeping you cool, refreshed, and satisfied all season long. From crisp salads and chilled soups to grilled favorites and fruity desserts, these recipes are light, flavorful, and quick to prepare. Whether you're hosting a backyard BBQ or enjoying a quiet lunch on the patio.",
      "As the summer heat kicks in, it's time to trade heavy comfort foods for meals that are light, refreshing, and full of flavor. Our collection of easy summer dishes is designed to keep you cool, energized, and satisfied without spending hours in a hot kitchen. Think fresh salads loaded with seasonal fruits and vegetables, cold pasta bowls tossed with herbs and light dressings, and grilled proteins that are both healthy and delicious. These recipes are perfect for quick lunches, casual dinners, and outdoor gatherings with friends and family."
    ],
    body_id: [
      "Saat suhu meningkat, hal terakhir yang Anda inginkan adalah makanan berat dan rumit. Daftar hidangan musim panas kami yang mudah sangat cocok untuk membuat Anda tetap sejuk, segar, dan puas sepanjang musim. Dari salad renyah dan sup dingin hingga hidangan panggang favorit dan dessert buah, resep-resep ini ringan, beraroma, dan cepat disiapkan. Baik Anda mengadakan BBQ di halaman belakang atau menikmati makan siang santai di teras.",
      "Saat panas musim panas tiba, saatnya mengganti makanan berat dengan hidangan yang ringan, menyegarkan, dan penuh rasa. Koleksi hidangan musim panas kami dirancang untuk membuat Anda tetap sejuk, berenergi, dan puas tanpa menghabiskan waktu berjam-jam di dapur yang panas. Bayangkan salad segar penuh dengan buah dan sayuran musiman, pasta dingin dengan rempah dan dressing ringan, serta protein panggang yang sehat dan lezat. Resep-resep ini sempurna untuk makan siang cepat, makan malam santai, dan kumpul-kumpul di luar ruangan bersama teman dan keluarga."
    ]
  },
  {
    slug:       'a-day-in-the-life-of-our-head-chef',
    title_en:   'A Day in the Life of Our Head Barista',
    title_id:   'Sehari Bersama Barista Kepala Kami',
    excerpt_en: 'From bean selection to the final pour, follow our head barista through a single Brew Haven shift.',
    excerpt_id: 'Dari pemilihan biji hingga tuangan terakhir, ikuti barista kepala kami dalam satu shift di Brew Haven.',
    image:      '/assets/images/home-coffee/about/about-img1.webp',
    author:     'John',
    date:       'May 19, 2025',
    body_en: [
      "Behind every great cup is a great story. Spend a day shadowing our head barista and you'll discover the rhythm, discipline, and creativity that turn an ordinary café kitchen into a place of craft and community.",
      "From the early morning bean selection to the final espresso pulled at dusk, our barista balances precision with warmth — making sure every guest walks away happy."
    ],
    body_id: [
      "Di balik setiap cangkir yang luar biasa ada cerita yang hebat. Habiskan sehari mengikuti barista kepala kami dan Anda akan menemukan ritme, disiplin, dan kreativitas yang mengubah dapur kafe biasa menjadi tempat penuh kerajinan dan kebersamaan.",
      "Dari pemilihan biji kopi di pagi hari hingga espresso terakhir yang diseduh saat senja, barista kami menyeimbangkan presisi dengan kehangatan — memastikan setiap tamu pulang dengan senyuman."
    ]
  },
  {
    slug:       'mediterranean-influence',
    title_en:   'The Mediterranean Influence Behind Our New Coffee Creations',
    title_id:   'Pengaruh Mediterania di Balik Kreasi Kopi Baru Kami',
    excerpt_en: "Bright herbs, citrus zest, and single-origin espresso — meet Brew Haven's new lineup.",
    excerpt_id: 'Rempah segar, kulit jeruk, dan espresso single-origin — temui jajaran baru Brew Haven.',
    image:      '/assets/images/home-coffee/gallery/enjoy-img2.webp',
    author:     'John',
    date:       'May 19, 2025',
    body_en: [
      "Our newest menu items draw inspiration from the sun-soaked coasts of the Mediterranean — bright herbs, fresh citrus, and olive oil pressed from the season's first harvest.",
      "The result is a lighter, brighter lineup that pairs perfectly with our signature coffee blends."
    ],
    body_id: [
      "Menu terbaru kami mengambil inspirasi dari pesisir Mediterania yang disinari matahari — rempah segar, jeruk segar, dan minyak zaitun dari panen pertama musim ini.",
      "Hasilnya adalah jajaran menu yang lebih ringan dan cerah, cocok dipadukan dengan racikan kopi khas kami."
    ]
  },
  {
    slug:       'farm-to-table',
    title_en:   'From Farm to Cup: Where Our Beans Come From',
    title_id:   'Dari Kebun ke Cangkir: Asal Biji Kopi Kami',
    excerpt_en: 'Every bean we serve can be traced back to a farm we have visited ourselves.',
    excerpt_id: 'Setiap biji yang kami sajikan dapat dilacak kembali ke perkebunan yang telah kami kunjungi sendiri.',
    image:      '/assets/images/home-coffee/blog/blog-img2.webp',
    author:     'John',
    date:       'May 19, 2025',
    body_en: [
      "Every bean we serve can be traced back to a farm we've visited ourselves. Our farm-to-cup philosophy means a shorter journey from soil to cup.",
      "We work with growers who share our commitment to quality and sustainability."
    ],
    body_id: [
      "Setiap biji yang kami sajikan dapat dilacak kembali ke perkebunan yang telah kami kunjungi sendiri. Filosofi dari kebun ke cangkir kami berarti perjalanan yang lebih pendek dari tanah ke cangkir Anda.",
      "Kami bekerja sama dengan petani yang berbagi komitmen kami terhadap kualitas dan keberlanjutan."
    ]
  },
  {
    slug:       'seasonal-specials',
    title_en:   "Seasonal Specials: What's Pouring This Month",
    title_id:   'Spesial Musiman: Yang Tersaji Bulan Ini',
    excerpt_en: "Bright florals and refreshing fruit notes — discover May's rotating specials at Brew Haven.",
    excerpt_id: 'Aroma bunga cerah dan nuansa buah menyegarkan — temukan spesial rotasi bulan Mei di Brew Haven.',
    image:      '/assets/images/home-coffee/gallery/cup.webp',
    author:     'John',
    date:       'May 19, 2025',
    body_en: [
      "Each season brings new ingredients — and new drinks to pair them with. May's specials highlight bright florals and refreshing fruit notes.",
      "Stop by this month to try our Honey Lavender Latte and the Watermelon Cold Brew."
    ],
    body_id: [
      "Setiap musim membawa bahan-bahan baru — dan minuman baru untuk dipadukan. Spesial bulan Mei menonjolkan aroma bunga cerah dan nuansa buah menyegarkan.",
      "Mampirlah bulan ini untuk mencoba Honey Lavender Latte dan Watermelon Cold Brew kami."
    ]
  },
  {
    slug:       'celebrating-with-us',
    title_en:   'Celebrating With Us: Hosting Events at Brew Haven',
    title_id:   'Rayakan Bersama Kami: Adakan Acara di Brew Haven',
    excerpt_en: 'From intimate birthdays to corporate gatherings — let Brew Haven host your next event.',
    excerpt_id: 'Dari ulang tahun intim hingga acara perusahaan — biarkan Brew Haven menjadi tuan rumah acara Anda berikutnya.',
    image:      '/assets/images/home-coffee/gallery/enjoy-img1.webp',
    author:     'John',
    date:       'May 19, 2025',
    body_en: [
      "Whether it's a birthday, an intimate wedding, or a corporate gathering, our team crafts a memorable experience every time.",
      "Tell us your vision — we'll bring it to life with food, drinks, and warm hospitality."
    ],
    body_id: [
      "Baik itu ulang tahun, pernikahan intim, atau acara perusahaan, tim kami selalu menciptakan pengalaman yang tak terlupakan setiap saat.",
      "Ceritakan visi Anda — kami akan mewujudkannya dengan makanan, minuman, dan keramahtamahan yang hangat."
    ]
  }
];
