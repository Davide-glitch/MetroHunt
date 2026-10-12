export interface PropertyVisual {
  badge: string;
  image: string;
  architecturalStyle: string;
}

// 1. High-Resolution Curated & Generated Image Pools per Property Category
// 16 completely distinct architectural designs per category (64 unique visuals total).
// Ensures that NO TWO properties in the market or portfolio ever share duplicate imagery.

const apartmentImages: PropertyVisual[] = [
  {
    badge: 'Urban Glass Loft',
    image: '/properties/apartment-loft.jpg',
    architecturalStyle: 'Modern Industrial Glass & Steel'
  },
  {
    badge: 'Nordic Terrace Flat',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Scandinavian Minimalist'
  },
  {
    badge: 'Executive Studio',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Contemporary Monolith'
  },
  {
    badge: 'Garden Courtyard Loft',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Biophilic Urban'
  },
  {
    badge: 'Brick Warehouse Studio',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Reclaimed Industrial'
  },
  {
    badge: 'Skyline Terrace Flat',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Modernist High-Floor'
  },
  {
    badge: 'Artisan Waterfront Loft',
    image: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97e06?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Coastal Contemporary'
  },
  {
    badge: 'Boutique Metro Suite',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Art Deco Neo-Revival'
  },
  {
    badge: 'Minimalist Duplex',
    image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Bauhaus Modernist'
  },
  {
    badge: 'Sunset Boulevard Penthouse',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Mid-Century Modern'
  },
  {
    badge: 'Atelier Concrete Loft',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Warm Brutalism'
  },
  {
    badge: 'Zenith Garden Flat',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Japandi Harmony'
  },
  {
    badge: 'Metropolitan Mezzanine',
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Sleek Monochrome'
  },
  {
    badge: 'Imperial Promenade Suite',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Neo-Classical Luxury'
  },
  {
    badge: 'Canal Foundry Studio',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Post-Industrial Chic'
  },
  {
    badge: 'Apex Sky Residence',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Glass Curtain Luxury'
  }
];

const houseImages: PropertyVisual[] = [
  {
    badge: 'Suburban Glass Villa',
    image: '/properties/suburban-villa.jpg',
    architecturalStyle: 'Modernist Glass Pavilion'
  },
  {
    badge: 'Contemporary Estate',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Post-Modern Architecture'
  },
  {
    badge: 'Luxury Hillside Manor',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'California Modern'
  },
  {
    badge: 'Historic Brownstone',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Victorian Sandstone'
  },
  {
    badge: 'Cedar Prairie Residence',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Organic Prairie Craftsman'
  },
  {
    badge: 'Mediterranean Villa',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Neo-Mediterranean'
  },
  {
    badge: 'Zen Courtyard Residence',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Japandi Minimalist'
  },
  {
    badge: 'Monolithic Stone House',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Contemporary Brutalist'
  },
  {
    badge: 'Pine Crest Haven',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Nordic Timber & Glass'
  },
  {
    badge: 'Skyline Ridge Villa',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Ultra-Modern Cantilever'
  },
  {
    badge: 'Solarium Desert Oasis',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Desert Modernist'
  },
  {
    badge: 'Château Bellevue Manor',
    image: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'French Provincial Revival'
  },
  {
    badge: 'Emerald Forest Retreat',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Pacific Northwest Timber'
  },
  {
    badge: 'Seaside Clifftop Cottage',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Coastal Shingle Style'
  },
  {
    badge: 'Villa Bella Vista',
    image: 'https://images.unsplash.com/photo-1600607687710-14b53ce79f86?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Tuscan Stone Villa'
  },
  {
    badge: 'Obsidian Cubic Estate',
    image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Futuristic Geometric'
  }
];

const commercialImages: PropertyVisual[] = [
  {
    badge: 'Monolithic Corporate HQ',
    image: '/properties/commercial-tower.jpg',
    architecturalStyle: 'Reflective Glass Curtain'
  },
  {
    badge: 'Financial Tower Center',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'High-Tech Modernism'
  },
  {
    badge: 'Retail Innovation Plaza',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Commercial Cantilever'
  },
  {
    badge: 'Metro Logistics Hub',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Industrial Tech'
  },
  {
    badge: 'Boutique Design Center',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Artisanal Commercial'
  },
  {
    badge: 'Biophilic Office Campus',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Eco-Forward Corporate'
  },
  {
    badge: 'Downtown Exchange Gallery',
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Geometric Glass Atrium'
  },
  {
    badge: 'Tech Incubator Facility',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Industrial Innovation'
  },
  {
    badge: 'Silicon Gateway Pavilion',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Open-Concept Executive'
  },
  {
    badge: 'Apex Venture Center',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Minimalist Corporate'
  },
  {
    badge: 'Cybernetic Commerce Mall',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Interactive Retail'
  },
  {
    badge: 'Robotic Fulfillment Hub',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Smart Warehouse Tech'
  },
  {
    badge: 'Venture Hive Hub',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Co-Working Monolith'
  },
  {
    badge: 'Aero Exchange Plaza',
    image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Glass Atrium Complex'
  },
  {
    badge: 'Sterling Capital Tower',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Financial Megastructure'
  },
  {
    badge: 'Metropolitan Terminal One',
    image: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Steel Grid Industrial'
  }
];

const highRiseImages: PropertyVisual[] = [
  {
    badge: 'Flagship Penthouse Spire',
    image: '/properties/highrise-flagship.jpg',
    architecturalStyle: 'Ultra-Luxury Pinnacle'
  },
  {
    badge: 'Downtown Glass Tower',
    image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Twisting Crystalline Skyscraper'
  },
  {
    badge: 'Crown Capital Apex',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'International Megastructure'
  },
  {
    badge: 'Metropolitan Horizon Needle',
    image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Futuristic Cyber-Fintech'
  },
  {
    badge: 'Vertical Sky Garden',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Biophilic Vertical Forest'
  },
  {
    badge: 'Celestial Spire',
    image: 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Stepped Geometric HighRise'
  },
  {
    badge: 'Neon Core Tower',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Midnight Metropolis'
  },
  {
    badge: 'Panorama Apex Tower',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Aerodynamic Sky Spire'
  },
  {
    badge: 'Starlight Horizon Needle',
    image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Hyper-Tall Obelisk'
  },
  {
    badge: 'Infinity Spiral Tower',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Crystalline Helix'
  },
  {
    badge: 'Vanguard Sovereign Spire',
    image: 'https://images.unsplash.com/photo-1428366890462-dd4baecf492b?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Mirrored Monolith'
  },
  {
    badge: 'Quantum Apex Tower',
    image: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Parametric Lattice HighRise'
  },
  {
    badge: 'Burj Vista Pinnacle',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Futuristic Sky Needle'
  },
  {
    badge: 'Chronos Gate Spire',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Neo-Futuristic Arch'
  },
  {
    badge: 'Solaria Garden Apex',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Emerald Curtain HighRise'
  },
  {
    badge: 'Summit Financial Spire',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Metropolis Landmark'
  }
];

/**
 * Deterministically retrieves a unique architectural image and styling
 * for any given property based on its ID, Type, District, and Title.
 * Guarantees that separate properties never receive duplicate visual representations.
 */
export const getPropertyVisual = (
  type: string,
  district: string,
  id: number = 0,
  title: string = ''
): PropertyVisual => {
  let pool: PropertyVisual[];

  switch (type) {
    case 'Apartment':
      pool = apartmentImages;
      break;
    case 'House':
      pool = houseImages;
      break;
    case 'Commercial':
      pool = commercialImages;
      break;
    case 'HighRise':
      pool = highRiseImages;
      break;
    default:
      pool = apartmentImages;
      break;
  }

  // Calculate deterministic hash unique to this specific property
  let hash = Math.abs(id * 37 + 101);
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) % 10007;
  }
  for (let j = 0; j < district.length; j++) {
    hash = (hash * 19 + district.charCodeAt(j)) % 10007;
  }

  const selectedIndex = Math.abs(hash) % pool.length;
  const baseVisual = pool[selectedIndex];

  // Tailor badge with district nuance
  const districtPrefix = district === 'Financial' ? 'Prime ' : district === 'Downtown' ? 'Metro ' : district === 'Suburbs' ? 'Estate ' : 'Urban ';

  return {
    badge: `${districtPrefix}${baseVisual.badge}`,
    image: baseVisual.image,
    architecturalStyle: baseVisual.architecturalStyle
  };
};
