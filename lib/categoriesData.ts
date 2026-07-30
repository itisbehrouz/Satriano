export interface SubcategoryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  fabricCount: string;
  leadTime: string;
  moq: string;
}

export interface CategoryItem {
  id: string;
  title: string;
  subDescription: string;
  itemCount: string;
  status: string;
  active: boolean;
  image: string;
  href: string;
  subcategories: SubcategoryItem[];
}

export const MANUFACTURING_CATEGORIES: CategoryItem[] = [
  {
    id: "tops",
    title: "Tops",
    subDescription: "Shirts, Polo Shirts, Sweaters",
    itemCount: "3 Subcategories",
    status: "Active Configurator",
    active: true,
    image: "/images/catalog/tops.png",
    href: "/categories/tops",
    subcategories: [
      {
        id: "shirts",
        title: "Dress & Casual Shirts",
        description: "Crisp Oxford, Fine Poplin & Breathable Linen Dress Shirts tailored for corporate and retail collections.",
        image: "/images/subcategories/tops-shirts.png",
        fabricCount: "4 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "polos",
        title: "Polo Shirts",
        description: "Classic Pique Cotton, Mercerized Jersey & Performance Blend Polo Shirts with custom collar & button details.",
        image: "/images/subcategories/tops-polos.png",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "sweaters",
        title: "Knitwear & Sweaters",
        description: "Fine Merino Wool, Cashmere Blend & Organic Cotton Crewneck Sweaters crafted for seasonal lines.",
        image: "/images/subcategories/tops-sweaters.png",
        fabricCount: "3 Fabric Options",
        leadTime: "18 Days",
        moq: "50 Units",
      },
    ],
  },
  {
    id: "bottoms",
    title: "Bottoms",
    subDescription: "Trousers, Skirts, Shorts",
    itemCount: "3 Subcategories",
    status: "Catalog Spec",
    active: false,
    image: "/images/catalog/bottoms.png",
    href: "/categories/bottoms",
    subcategories: [
      {
        id: "trousers",
        title: "Tailored Trousers & Pants",
        description: "Bespoke Pleated Dress Pants, Chinos & Flat-Front Wool Trousers with precision waistband construction.",
        image: "/images/subcategories/bottoms-trousers.png",
        fabricCount: "4 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "skirts",
        title: "Tailored Skirts",
        description: "Structured Wool Pencil Skirts & A-Line Linen Skirts engineered for corporate uniform & retail collections.",
        image: "/images/subcategories/bottoms-skirts.png",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "shorts",
        title: "Chino & Linen Shorts",
        description: "Custom Tailored Chino Shorts & Relaxed Linen Drawstring Shorts for spring/summer lines.",
        image: "/images/subcategories/bottoms-shorts.png",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
    ],
  },
  {
    id: "outerwear",
    title: "Outerwear",
    subDescription: "Jackets, Coats, Overcoats",
    itemCount: "3 Subcategories",
    status: "Catalog Spec",
    active: false,
    image: "/images/catalog/outerwear.png",
    href: "/categories/outerwear",
    subcategories: [
      {
        id: "jackets",
        title: "Casual & Leather Jackets",
        description: "Bespoke Softshell Zip Jackets, Grain Leather Bomber Jackets & Structured Field Shells.",
        image: "/images/catalog/outerwear.png",
        fabricCount: "3 Fabric Options",
        leadTime: "21 Days",
        moq: "50 Units",
      },
      {
        id: "coats",
        title: "Trench Coats",
        description: "Double-Breasted Wool & Weatherproof Cotton Trench Coats with belt detail and horn buttons.",
        image: "/images/subcategories/outerwear-coats.jpg",
        fabricCount: "3 Fabric Options",
        leadTime: "21 Days",
        moq: "50 Units",
      },
      {
        id: "overcoats",
        title: "Heavy Overcoats",
        description: "Virgin Wool & Cashmere Overcoats engineered for severe winter lines and tailored layering.",
        image: "/images/subcategories/outerwear-overcoats.jpg",
        fabricCount: "3 Fabric Options",
        leadTime: "21 Days",
        moq: "50 Units",
      },
    ],
  },
  {
    id: "formal-wear",
    title: "Formal Wear",
    subDescription: "Suits, Tuxedos, Blazers",
    itemCount: "3 Subcategories",
    status: "Catalog Spec",
    active: false,
    image: "/images/catalog/formal_wear.png",
    href: "/categories/formal-wear",
    subcategories: [
      {
        id: "suits",
        title: "Two-Piece & Three-Piece Suits",
        description: "Super 120s Virgin Wool Tailored Suit Sets for executive corporate programs and formal collections.",
        image: "/images/catalog/formal_wear.png",
        fabricCount: "4 Fabric Options",
        leadTime: "21 Days",
        moq: "50 Units",
      },
      {
        id: "tuxedos",
        title: "Eveningwear Tuxedos",
        description: "Black-Tie Satin Lapel Tuxedos with silk grosgrain piping and pleated formal shirting.",
        image: "/images/subcategories/formal-tuxedos.jpg",
        fabricCount: "3 Fabric Options",
        leadTime: "21 Days",
        moq: "50 Units",
      },
      {
        id: "blazers",
        title: "Standalone Blazers",
        description: "Structured Navy & Hopsack Wool Blazer Jackets with gold or horn button custom options.",
        image: "/images/subcategories/formal-blazers.jpg",
        fabricCount: "3 Fabric Options",
        leadTime: "18 Days",
        moq: "50 Units",
      },
    ],
  },
  {
    id: "sportswear",
    title: "Sportswear",
    subDescription: "Tracksuits, Performance Wear, Activewear",
    itemCount: "3 Subcategories",
    status: "Catalog Spec",
    active: false,
    image: "/images/catalog/sportswear.png",
    href: "/categories/sportswear",
    subcategories: [
      {
        id: "tracksuits",
        title: "Technical Tracksuits",
        description: "Performance Zip Jackets & Matching Track Pants crafted with bonded fleece & weather-barrier shells.",
        image: "/images/catalog/sportswear.png",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "performance",
        title: "Performance Tops & Compression",
        description: "Moisture-Wicking Athletic Shirts & Seamless Compression Tops engineered for high-active output.",
        image: "/images/subcategories/sportswear-performance.jpg",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "activewear",
        title: "Athletic Shorts & Leggings",
        description: "Four-way Stretch Athletic Shorts & Ergonomic Leggings with laser-cut ventilation seams.",
        image: "/images/subcategories/sportswear-activewear.jpg",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
    ],
  },
  {
    id: "lingerie-loungewear",
    title: "Lingerie & Loungewear",
    subDescription: "Sleepwear, Underwear, Loungewear",
    itemCount: "3 Subcategories",
    status: "Catalog Spec",
    active: false,
    image: "/images/catalog/loungewear.png",
    href: "/categories/lingerie-loungewear",
    subcategories: [
      {
        id: "sleepwear",
        title: "Luxury Pajamas & Robes",
        description: "Pure Mulberry Silk Pajama Sets, Cotton Robes & Nightwear crafted for premium hotel & retail lines.",
        image: "/images/subcategories/loungewear-sleepwear.jpg",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "underwear",
        title: "Fine Base Layers & Underwear",
        description: "Seamless Organic Cotton Briefs, Trunks & Micro-modal Intimates.",
        image: "/images/subcategories/loungewear-underwear.jpg",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "loungewear",
        title: "Fleece Sweats & Loungewear",
        description: "Heavyweight Heather Grey Sweatpants, Sweatshirts & Casual Hoodies.",
        image: "/images/catalog/loungewear.png",
        fabricCount: "3 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
    ],
  },
  {
    id: "accessories",
    title: "Accessories",
    subDescription: "Belts, Ties, Scarves",
    itemCount: "3 Subcategories",
    status: "Catalog Spec",
    active: false,
    image: "/images/catalog/accessories.png",
    href: "/categories/accessories",
    subcategories: [
      {
        id: "belts",
        title: "Bespoke Leather & Suede Belts",
        description: "Full-Grain Italian Calfskin & Suede Belts with custom brass or nickel buckle options.",
        image: "/images/catalog/accessories.png",
        fabricCount: "4 Material Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "ties",
        title: "Handmade Silk & Wool Ties",
        description: "Seven-Fold Silk Jacquard Ties, Knit Wool Ties & Bowties with bespoke tipping.",
        image: "/images/subcategories/accessories-ties.jpg",
        fabricCount: "5 Pattern Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
      {
        id: "scarves",
        title: "Cashmere & Silk Scarves",
        description: "Fine Wool-Cashmere Fringed Scarves & Printed Silk Pocket Squares for brand accessory lines.",
        image: "/images/subcategories/accessories-scarves.jpg",
        fabricCount: "4 Fabric Options",
        leadTime: "14 Days",
        moq: "50 Units",
      },
    ],
  },
];
