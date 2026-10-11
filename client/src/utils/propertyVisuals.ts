export const getPropertyVisual = (type: string, district: string, _id?: number) => {
  // Curated architectural photography gradients & visual motifs for properties
  const visualDatabase: Record<string, { badge: string; image: string }> = {
    'Apartment-Downtown': {
      badge: 'Urban Loft',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
    },
    'Apartment-Suburbs': {
      badge: 'Garden Flat',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'
    },
    'Apartment-Financial': {
      badge: 'Executive Suite',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'
    },
    'Apartment-Industrial': {
      badge: 'Warehouse Loft',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
    },
    'House-Downtown': {
      badge: 'Historic Townhouse',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
    },
    'House-Suburbs': {
      badge: 'Suburban Villa',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'
    },
    'House-Financial': {
      badge: 'Luxury Mansion',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'
    },
    'House-Industrial': {
      badge: 'Artisan Residence',
      image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80'
    },
    'Commercial-Downtown': {
      badge: 'Retail Plaza',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
    },
    'Commercial-Financial': {
      badge: 'Corporate HQ',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
    },
    'Commercial-Industrial': {
      badge: 'Logistics Hub',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
    },
    'Commercial-Suburbs': {
      badge: 'Boutique Center',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'
    },
    'HighRise-Downtown': {
      badge: 'Glass Skyscraper',
      image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=600&q=80'
    },
    'HighRise-Financial': {
      badge: 'Crown Tower',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80'
    },
    'HighRise-Industrial': {
      badge: 'Tech Apex',
      image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=600&q=80'
    },
    'HighRise-Suburbs': {
      badge: 'Panorama Tower',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
    }
  };

  const key = `${type}-${district}`;
  if (visualDatabase[key]) {
    return visualDatabase[key];
  }

  // High quality fallbacks by type
  switch (type) {
    case 'HighRise':
      return {
        badge: 'Skyline Landmark',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80'
      };
    case 'Commercial':
      return {
        badge: 'Prime Commercial',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
      };
    case 'House':
      return {
        badge: 'Private Estate',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'
      };
    default:
      return {
        badge: 'Modern Apartment',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
      };
  }
};
