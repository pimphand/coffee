// Single-source-of-truth blog data shared by /blog list and /blog/[slug].
// Add or change posts here and they will appear on both pages.
// All post images point at real Brew Haven coffee photos under
// home-coffee/ so the blog list and detail pages match the coffee-shop
// theme without any leftover generic innerpage placeholders.

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  body: string[]; // paragraphs
}

export const posts: BlogPost[] = [
  {
    slug: 'local-beans-global-dreams',
    title: 'Local Beans, Global Dreams',
    excerpt: 'Why sourcing our coffee from ethical farms around the world makes a difference every day.',
    image: '/assets/images/home-coffee/blog/blog-img1.jpg',          // roasted coffee beans
    author: 'John',
    date: 'May 19, 2025',
    body: [
      "When the temperatures rise, the last thing you want is a heavy, complicated meal. Our list of easy summer dishes is perfect for keeping you cool, refreshed, and satisfied all season long. From crisp salads and chilled soups to grilled favorites and fruity desserts, these recipes are light, flavorful, and quick to prepare. Whether you're hosting a backyard BBQ or enjoying a quiet lunch on the patio.",
      "As the summer heat kicks in, it's time to trade heavy comfort foods for meals that are light, refreshing, and full of flavor. Our collection of easy summer dishes is designed to keep you cool, energized, and satisfied without spending hours in a hot kitchen. Think fresh salads loaded with seasonal fruits and vegetables, cold pasta bowls tossed with herbs and light dressings, and grilled proteins that are both healthy and delicious. These recipes are perfect for quick lunches, casual dinners, and outdoor gatherings with friends and family."
    ]
  },
  {
    slug: 'a-day-in-the-life-of-our-head-chef',
    title: 'A Day in the Life of Our Head Barista',
    excerpt: 'From bean selection to the final pour, follow our head barista through a single Brew Haven shift.',
    image: '/assets/images/home-coffee/about/about-img1.jpg',        // barista latte art
    author: 'John',
    date: 'May 19, 2025',
    body: [
      "Behind every great cup is a great story. Spend a day shadowing our head barista and you'll discover the rhythm, discipline, and creativity that turn an ordinary café kitchen into a place of craft and community.",
      "From the early morning bean selection to the final espresso pulled at dusk, our barista balances precision with warmth — making sure every guest walks away happy."
    ]
  },
  {
    slug: 'mediterranean-influence',
    title: 'The Mediterranean Influence Behind Our New Coffee Creations',
    excerpt: 'Bright herbs, citrus zest, and single-origin espresso — meet Brew Haven\'s new lineup.',
    image: '/assets/images/home-coffee/gallery/enjoy-img2.png',      // cappuccino with latte art
    author: 'John',
    date: 'May 19, 2025',
    body: [
      "Our newest menu items draw inspiration from the sun-soaked coasts of the Mediterranean — bright herbs, fresh citrus, and olive oil pressed from the season's first harvest.",
      "The result is a lighter, brighter lineup that pairs perfectly with our signature coffee blends."
    ]
  },
  {
    slug: 'farm-to-table',
    title: 'From Farm to Cup: Where Our Beans Come From',
    excerpt: 'Every bean we serve can be traced back to a farm we have visited ourselves.',
    image: '/assets/images/home-coffee/blog/blog-img2.jpg',          // small cup of coffee
    author: 'John',
    date: 'May 19, 2025',
    body: [
      "Every bean we serve can be traced back to a farm we've visited ourselves. Our farm-to-cup philosophy means a shorter journey from soil to cup.",
      "We work with growers who share our commitment to quality and sustainability."
    ]
  },
  {
    slug: 'seasonal-specials',
    title: "Seasonal Specials: What's Pouring This Month",
    excerpt: 'Bright florals and refreshing fruit notes — discover May\'s rotating specials at Brew Haven.',
    image: '/assets/images/home-coffee/gallery/cup.png',             // rose latte art
    author: 'John',
    date: 'May 19, 2025',
    body: [
      "Each season brings new ingredients — and new drinks to pair them with. May's specials highlight bright florals and refreshing fruit notes.",
      "Stop by this month to try our Honey Lavender Latte and the Watermelon Cold Brew."
    ]
  },
  {
    slug: 'celebrating-with-us',
    title: 'Celebrating With Us: Hosting Events at Brew Haven',
    excerpt: 'From intimate birthdays to corporate gatherings — let Brew Haven host your next event.',
    image: '/assets/images/home-coffee/gallery/enjoy-img1.png',      // craft coffee art
    author: 'John',
    date: 'May 19, 2025',
    body: [
      "Whether it's a birthday, an intimate wedding, or a corporate gathering, our team crafts a memorable experience every time.",
      "Tell us your vision — we'll bring it to life with food, drinks, and warm hospitality."
    ]
  }
];
