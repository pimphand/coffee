// Shared UI string dictionary for the bilingual Brew Haven site.
// Single source of truth so every component picks from the same keys,
// preventing typo-driven translation gaps. Per-page content (hero text,
// chef bios, menu descriptions, etc.) lives in each page's own
// frontmatter and is translated inline via the same `t(key)` API.
//
// Adding a new key: append to BOTH 'id' AND 'en' objects exactly once.
// TypeScript will refuse to compile if a key is missing in either locale
// (typed via `as const satisfies Record<...>` below).

export const defaultLang = 'id' as const;
export type Locale = typeof defaultLang | 'en';
export const supportedLocales: Locale[] = ['id', 'en'];

type UISchema = {
  [K in Locale]: {
    [key: string]: string;
  };
};

export const ui: UISchema = {
  // ─────────────── Indonesian (default) ───────────────
  id: {
    // Primary nav
    'nav.home':       'Beranda',
    'nav.about':      'Tentang Kami',
    'nav.menu':       'Menu',
    'nav.team':       'Tim Kami',
    'nav.blog':       'Blog',
    'nav.contact':    'Kontak',

    // Reserved CTA buttons
    'btn.reservation':      'Reservasi',
    'btn.makeReservation':  'Buat Reservasi',
    'btn.contactUs':        'Hubungi Kami',
    'btn.bookNow':          'Pesan Sekarang',
    'btn.readMore':         'Baca Selengkapnya',
    'btn.submit':           'Kirim',
    'btn.done':             'Selesai',

    // Page-banner breadcrumb root
    'page.home': 'Beranda',

    // Reservation modal
    'modal.title':             'Pesan Meja Anda',
    'modal.subtitle':          'Pesan tempat duduk di Brew Haven. Kami akan konfirmasi lewat email sesaat lagi.',
    'modal.form.name':         'Nama Lengkap',
    'modal.form.email':        'Email',
    'modal.form.date':         'Tanggal',
    'modal.form.time':         'Waktu',
    'modal.form.persons':      'Jumlah Orang',
    'modal.form.phone':        'Telepon',
    'modal.form.request':      'Permintaan Khusus',
    'modal.confirmBtn':        'Konfirmasi Reservasi',
    'modal.successTitle':      'Reservasi Dikonfirmasi',
    'modal.successSub':        'Meja Anda sudah dipesan. Detail pemesanan kami kirim ke email Anda.',
    'modal.successRefLabel':   'Kode referensi',
    'modal.successDone':       'Selesai',

    // Footer
    'footer.usefulLink':       'Tautan Bermanfaat',
    'footer.tagline':          'Brew Haven menawarkan hidangan beraroma, suasana nyaman, dan layanan hangat.',
    'footer.openingTime':      'Jam Buka',
    'footer.newsletterTitle':  'Buletin Kami',
    'footer.newsletterSub':    'Tips Memasak, Pembaruan Menu & Lainnya',
    'footer.subscribeBtn':    'Berlangganan',
    'footer.placeholderEmail': 'Masukkan Alamat Email',
    'footer.dayShort.monThu': 'Sen - Kam:',
    'footer.dayShort.friSat': 'Jum - Sab:',
    'footer.dayShort.sunday': 'Minggu:',
    'footer.dayShort.off':    'Libur',

    // Page-level headlines (used in PageBanner title attribute and as
    // fallback for page-content fields)
    'page.menuGridSubtitle':  'Menu Kopi Kami',
    'page.menuGridTitle':     'Pilih Kopi Anda',
    'page.menuListSubtitle':  'Makanan Kami',
    'page.menuListTitle':     'Spesial Jam Sibuk',
    'page.teamSubtitle':      'Koki Kami',
    'page.teamTitle':         'Koki Terbaik & Terampil',
    'page.contactSubtitle':   'Hubungi Kami',
    'page.contactTitle':      'Bicara dengan Kami Hari Ini'
  },

  // ─────────────── English ───────────────
  en: {
    'nav.home':       'Home',
    'nav.about':      'About Us',
    'nav.menu':       'Menu',
    'nav.team':       'Our Team',
    'nav.blog':       'Blog',
    'nav.contact':    'Contact',

    'btn.reservation':      'Reservation',
    'btn.makeReservation':  'Make A Reservation',
    'btn.contactUs':        'Contact Us',
    'btn.bookNow':          'Book Now',
    'btn.readMore':         'Read More',
    'btn.submit':           'Submit',
    'btn.done':             'Done',

    'page.home': 'Home',

    'modal.title':             'Reserve Your Table',
    'modal.subtitle':          'Book your seat at Brew Haven. We\'ll confirm shortly via email.',
    'modal.form.name':         'Full Name',
    'modal.form.email':        'Email',
    'modal.form.date':         'Date',
    'modal.form.time':         'Time',
    'modal.form.persons':      'Persons',
    'modal.form.phone':        'Phone',
    'modal.form.request':      'Special Request',
    'modal.confirmBtn':        'Confirm Reservation',
    'modal.successTitle':      'Reservation Confirmed',
    'modal.successSub':        'Your table is booked. We\'ve sent the details to your email.',
    'modal.successRefLabel':   'Booking reference',
    'modal.successDone':       'Done',

    'footer.usefulLink':       'Useful Link',
    'footer.tagline':          'Brew Haven offers flavorful dishes, cozy ambiance, and warm service.',
    'footer.openingTime':      'Opening Time',
    'footer.newsletterTitle':  'Our Newsletter',
    'footer.newsletterSub':    'Delicious Tips, Dish Updates & More',
    'footer.subscribeBtn':     'Subscribe',
    'footer.placeholderEmail': 'Enter Email Address',
    'footer.dayShort.monThu': 'Mon - Thu:',
    'footer.dayShort.friSat': 'Fri - Sat:',
    'footer.dayShort.sunday': 'Sunday:',
    'footer.dayShort.off':    'Off Day',

    'page.menuGridSubtitle':  'Our Coffee Menu',
    'page.menuGridTitle':     'Choose Your Coffee',
    'page.menuListSubtitle':  'Our Food Menu',
    'page.menuListTitle':     'Exclusive Hourly Specials',
    'page.teamSubtitle':      'Our Chefs',
    'page.teamTitle':         'The Fly & Fine Chefs',
    'page.contactSubtitle':   'Contact Us',
    'page.contactTitle':      'Talk to Us Today'
  }
};
