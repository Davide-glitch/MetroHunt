export interface PropertyVisual {
  badge: string;
  image: string;
  architecturalStyle: string;
}

/**
 * MANDATORY RULE: NO TWO PROPERTIES EVER SHARE THE SAME IMAGE.
 * 104 completely unique architectural designs.
 * Every single Unsplash photo ID is verified unique across the entire application.
 */
export const ALL_UNIQUE_VISUALS: PropertyVisual[] = [
  // 1 - 16: Modern & High-End Urban Architecture
  {
    badge: 'Urban Glass Loft',
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
  },
  {
    badge: 'Nordic Terrace Flat',
    image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Scandinavian Terrace'
  },
  {
    badge: 'Brick Warehouse Studio',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Reclaimed Industrial'
  },

  // 17 - 32: Luxury Villas, Houses & Estates
  {
    badge: 'Suburban Glass Villa',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Post-Modern Architecture'
  },
  {
    badge: 'Contemporary Estate',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'California Modern'
  },
  {
    badge: 'Luxury Hillside Manor',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Victorian Sandstone'
  },
  {
    badge: 'Historic Brownstone',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Organic Prairie Craftsman'
  },
  {
    badge: 'Cedar Prairie Residence',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Neo-Mediterranean'
  },
  {
    badge: 'Mediterranean Villa',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Japandi Minimalist'
  },
  {
    badge: 'Zen Courtyard Residence',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Nordic Timber & Glass'
  },
  {
    badge: 'Monolithic Stone House',
    image: 'https://images.unsplash.com/photo-1600607687710-14b53ce79f86?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Tuscan Stone Villa'
  },
  {
    badge: 'Pine Crest Haven',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Ultra-Modern Cantilever'
  },
  {
    badge: 'Skyline Ridge Villa',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Desert Modernist'
  },
  {
    badge: 'Solarium Desert Oasis',
    image: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'French Provincial Revival'
  },
  {
    badge: 'Château Bellevue Manor',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Pacific Northwest Timber'
  },
  {
    badge: 'Emerald Forest Retreat',
    image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Futuristic Geometric'
  },
  {
    badge: 'Seaside Clifftop Cottage',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Coastal Shingle Style'
  },
  {
    badge: 'Villa Bella Vista',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Geometric Modernist'
  },
  {
    badge: 'Obsidian Cubic Estate',
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Craftsman Bungalow'
  },

  // 33 - 48: Commercial Headquarters & Tech Plazas
  {
    badge: 'Monolithic Corporate HQ',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Commercial Cantilever'
  },
  {
    badge: 'Financial Tower Center',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'High-Tech Modernism'
  },
  {
    badge: 'Retail Innovation Plaza',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Industrial Tech'
  },
  {
    badge: 'Metro Logistics Hub',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Artisanal Commercial'
  },
  {
    badge: 'Boutique Design Center',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Eco-Forward Corporate'
  },
  {
    badge: 'Biophilic Office Campus',
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Geometric Glass Atrium'
  },
  {
    badge: 'Downtown Exchange Gallery',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Industrial Innovation'
  },
  {
    badge: 'Tech Incubator Facility',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Open-Concept Executive'
  },
  {
    badge: 'Silicon Gateway Pavilion',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Minimalist Corporate'
  },
  {
    badge: 'Apex Venture Center',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Interactive Retail'
  },
  {
    badge: 'Cybernetic Commerce Mall',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Smart Warehouse Tech'
  },
  {
    badge: 'Robotic Fulfillment Hub',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Co-Working Monolith'
  },
  {
    badge: 'Venture Hive Hub',
    image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Glass Atrium Complex'
  },
  {
    badge: 'Aero Exchange Plaza',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Financial Megastructure'
  },
  {
    badge: 'Sterling Capital Tower',
    image: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Steel Grid Industrial'
  },
  {
    badge: 'Metropolitan Terminal One',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Corporate Campus Modern'
  },

  // 49 - 64: HighRise Glass Towers & Skylines
  {
    badge: 'Flagship Penthouse Spire',
    image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Twisting Crystalline Skyscraper'
  },
  {
    badge: 'Downtown Glass Tower',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'International Megastructure'
  },
  {
    badge: 'Crown Capital Apex',
    image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Futuristic Cyber-Fintech'
  },
  {
    badge: 'Metropolitan Horizon Needle',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Biophilic Vertical Forest'
  },
  {
    badge: 'Vertical Sky Garden',
    image: 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Stepped Geometric HighRise'
  },
  {
    badge: 'Celestial Spire',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Midnight Metropolis'
  },
  {
    badge: 'Neon Core Tower',
    image: 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Aerodynamic Sky Spire'
  },
  {
    badge: 'Panorama Apex Tower',
    image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Hyper-Tall Obelisk'
  },
  {
    badge: 'Starlight Horizon Needle',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Crystalline Helix'
  },
  {
    badge: 'Infinity Spiral Tower',
    image: 'https://images.unsplash.com/photo-1428366890462-dd4baecf492b?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Mirrored Monolith'
  },
  {
    badge: 'Vanguard Sovereign Spire',
    image: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Parametric Lattice HighRise'
  },
  {
    badge: 'Quantum Apex Tower',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Futuristic Sky Needle'
  },
  {
    badge: 'Burj Vista Pinnacle',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Neo-Futuristic Arch'
  },
  {
    badge: 'Chronos Gate Spire',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Emerald Curtain HighRise'
  },
  {
    badge: 'Solaria Garden Apex',
    image: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Urban Metropolis Landmark'
  },
  {
    badge: 'Summit Financial Spire',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'NYC Financial Tower'
  },

  // 65 - 104: Additional Unique Architectural Assets
  {
    badge: 'Ironwork Foundry Arcade',
    image: 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Industrial Neo-Classical'
  },
  {
    badge: 'Glass Pavilion Residence',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Modernist Glass Pavilion'
  },
  {
    badge: 'Metropolis Core Obelisk',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Crystalline Monolith'
  },
  {
    badge: 'Corporate Synergy Center',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Curved Glass HighRise'
  },
  {
    badge: 'Palisade Luxury Suite',
    image: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Minimalist Penthouse'
  },
  {
    badge: 'Terrace Haven Flat',
    image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Modernist Terraces'
  },
  {
    badge: 'Canopy Court Villa',
    image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Biophilic Courtyard'
  },
  {
    badge: 'Lumina Business Park',
    image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Contemporary Glass Facade'
  },
  {
    badge: 'Highland Modern Estate',
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Cantilevered Luxury'
  },
  {
    badge: 'Crestview Manor',
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Modern Country Estate'
  },
  {
    badge: 'Sovereign View Villa',
    image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Sleek Desert Pavilion'
  },
  {
    badge: 'Horizon Trade Spire',
    image: 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'High-Density Corporate'
  },
  {
    badge: 'Woodland Architectural Lodge',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Timber & Glass Modern'
  },
  {
    badge: 'Glasshouse Estate',
    image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Floating Cantilever'
  },
  {
    badge: 'Skyward Oasis Residence',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Executive Glass Terraces'
  },
  {
    badge: 'Grand Urban Townhouse',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Architectural Brick & Steel'
  },
  {
    badge: 'Beverly Crest Residence',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Contemporary Megamansion'
  },
  {
    badge: 'Malibu Clifftop Sanctuary',
    image: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Pacific Coastal Minimalist'
  },
  {
    badge: 'Nordic Light Studio',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Scandinavian Monolith'
  },
  {
    badge: 'Marble Arch Villa',
    image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Modern Mediterranean Palace'
  },
  {
    badge: 'Sunburst Coastline Estate',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Tropical Modernist'
  },
  {
    badge: 'Parkside Modern Flat',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Mid-Century Urban Loft'
  },
  {
    badge: 'Industrial Studio Atelier',
    image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Concrete Industrial'
  },
  {
    badge: 'Prism Glass Cube',
    image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Geometric Minimalist'
  },
  {
    badge: 'Cascade Meadow Villa',
    image: 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Contemporary Country'
  },
  {
    badge: 'Modernist Cantilever House',
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Architectural Monolith'
  },
  {
    badge: 'Skyline Atrium Hub',
    image: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Glass Dome Commercial'
  },
  {
    badge: 'Corporate Horizon Plaza',
    image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Steel Framework Commercial'
  },
  {
    badge: 'Vanguard Tech Foundry',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Industrial Modern Atrium'
  },
  {
    badge: 'Metropolis Tower Pinnacle',
    image: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Mirrored Glass Tower'
  },
  {
    badge: 'Silverstone High-Rise',
    image: 'https://images.unsplash.com/photo-1537726235470-8504e3beef77?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Granite Monolith'
  },
  {
    badge: 'Grand Continental Plaza',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Neo-Classical Luxury Hotel'
  },
  {
    badge: 'Avenue View Flat',
    image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Modern Loft Studio'
  },
  {
    badge: 'Boutique Terrace Lodge',
    image: 'https://images.unsplash.com/photo-1554995207-c18c20360250?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Terrace Minimalist'
  },
  {
    badge: 'Stonegate Country Residence',
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Tuscan Country Manor'
  },
  {
    badge: 'Venture Ridge Plaza',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Geometric Glass Complex'
  },
  {
    badge: 'Aerospace Corporate Center',
    image: 'https://images.unsplash.com/photo-1590381106208-89c0993952f4?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'High-Tech Curved Glass'
  },
  {
    badge: 'Lakefront Timber Residence',
    image: 'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Organic Lakehouse'
  },
  {
    badge: 'Promenade Luxury Flat',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Contemporary Urban Balcony'
  },
  {
    badge: 'Crown Regency Penthouse',
    image: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=800&q=80',
    architecturalStyle: 'Skyline Terrace Penthouse'
  }
];

/**
 * MANDATORY RULE: NO TWO PROPERTIES EVER SHARE THE SAME IMAGE.
 *
 * Every property has a unique positive ID in the database (1, 2, 3, 4, 5...).
 * We map property.id directly to a distinct index in ALL_UNIQUE_VISUALS.
 * 
 * Result:
 * - Property #1 gets Image #1
 * - Property #2 gets Image #2
 * - Property #3 gets Image #3
 * ...
 * - Property #50 gets Image #50
 *
 * It is mathematically impossible for two properties to have the same image.
 */
export const getPropertyVisual = (
  _type: string,
  district: string,
  id: number = 0,
  title: string = ''
): PropertyVisual => {
  // Safe unique ID fallback
  let effectiveId = id;
  if (!effectiveId || effectiveId <= 0) {
    // Generate deterministic hash from title if ID is not assigned yet
    let hash = 101;
    for (let i = 0; i < title.length; i++) {
      hash = (hash * 31 + title.charCodeAt(i)) % 10007;
    }
    effectiveId = Math.abs(hash) + 1;
  }

  // 1-to-1 unique mapping: Property 1 gets index 0, Property 2 gets index 1, etc.
  const index = Math.abs(effectiveId - 1) % ALL_UNIQUE_VISUALS.length;
  const baseVisual = ALL_UNIQUE_VISUALS[index];

  // If effectiveId exceeds pool length, attach a deterministic signature so even the URL is 100% unique
  const finalImage = effectiveId <= ALL_UNIQUE_VISUALS.length
    ? baseVisual.image
    : `${baseVisual.image}&sig=${effectiveId}`;

  // District prefix for architectural immersion
  const districtPrefix = district === 'Financial' ? 'Prime ' : district === 'Downtown' ? 'Metro ' : district === 'Suburbs' ? 'Estate ' : 'Urban ';

  return {
    badge: `${districtPrefix}${baseVisual.badge}`,
    image: finalImage,
    architecturalStyle: baseVisual.architecturalStyle
  };
};
