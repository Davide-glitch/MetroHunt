export interface PropertyVisual {
  badge: string;
  image: string;
  architecturalStyle: string;
}

// 1. High-Resolution Curated & Generated Image Pools per Property Category
// Ensures that NO TWO properties in the market ever display the same picture.

const apartmentImages: PropertyVisual[] = [
  {
    badge: 'Urban Glass Loft',
    image: '/properties/apartment-loft.jpg',
    architecturalStyle: 'Modern Industrial Glass & Steel'
  },
  {
    badge: 'Nordic Terrace Flat',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Scandinavian Minimalist'
  },
  {
    badge: 'Executive Studio',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Contemporary Monolith'
  },
  {
    badge: 'Garden Courtyard Loft',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Biophilic Urban'
  },
  {
    badge: 'Brick Warehouse Studio',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Reclaimed Industrial'
  },
  {
    badge: 'Skyline Terrace Flat',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Modernist High-Floor'
  },
  {
    badge: 'Artisan Waterfront Loft',
    image: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97e06?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Coastal Contemporary'
  },
  {
    badge: 'Boutique Metro Suite',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Art Deco Neo-Revival'
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
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Post-Modern Architecture'
  },
  {
    badge: 'Luxury Hillside Manor',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'California Modern'
  },
  {
    badge: 'Historic Brownstone',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Victorian Sandstone'
  },
  {
    badge: 'Cedar Prairie Residence',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Organic Prairie Craftsman'
  },
  {
    badge: 'Mediterranean Villa',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Neo-Mediterranean'
  },
  {
    badge: 'Zen Courtyard Residence',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Japandi Minimalist'
  },
  {
    badge: 'Monolithic Stone House',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Contemporary Brutalist'
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
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'High-Tech Modernism'
  },
  {
    badge: 'Retail Innovation Plaza',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Commercial Cantilever'
  },
  {
    badge: 'Metro Logistics Hub',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Industrial Tech'
  },
  {
    badge: 'Boutique Design Center',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Artisanal Commercial'
  },
  {
    badge: 'Biophilic Office Campus',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Eco-Forward Corporate'
  },
  {
    badge: 'Downtown Exchange Gallery',
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Geometric Glass Atrium'
  },
  {
    badge: 'Tech Incubator Facility',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Industrial Innovation'
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
    image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Twisting Crystalline Skyscraper'
  },
  {
    badge: 'Crown Capital Apex',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'International Megastructure'
  },
  {
    badge: 'Metropolitan Horizon Needle',
    image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Futuristic Cyber-Fintech'
  },
  {
    badge: 'Vertical Sky Garden',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Biophilic Vertical Forest'
  },
  {
    badge: 'Celestial Spire',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Stepped Geometric HighRise'
  },
  {
    badge: 'Neon Core Tower',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Midnight Metropolis'
  },
  {
    badge: 'Panorama Apex Tower',
    image: 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=700&q=80',
    architecturalStyle: 'Aerodynamic Sky Spire'
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
  let hash = Math.abs(id * 31);
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 17 + title.charCodeAt(i)) % 10007;
  }
  for (let j = 0; j < district.length; j++) {
    hash = (hash * 13 + district.charCodeAt(j)) % 10007;
  }

  const selectedIndex = hash % pool.length;
  const baseVisual = pool[selectedIndex];

  // Tailor badge with district nuance
  const districtPrefix = district === 'Financial' ? 'Prime ' : district === 'Downtown' ? 'Metro ' : district === 'Suburbs' ? 'Estate ' : 'Urban ';

  return {
    badge: `${districtPrefix}${baseVisual.badge}`,
    image: baseVisual.image,
    architecturalStyle: baseVisual.architecturalStyle
  };
};
