export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingSection {
  heading: string;
  paragraphs: string[];
}

export interface LandingPageContent {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: LandingSection[];
  faqs: LandingFaq[];
}

export const landingPages: LandingPageContent[] = [
  {
    slug: 'marble-tiles-alwar',
    title: 'Marble & Tiles in Alwar | Shree Durga Tiles',
    description: 'Compare marble tiles, white marble and natural stone at Shree Durga Tiles in Naugaon, Alwar. Visit or request a project quote.',
    h1: 'Marble Tiles in Alwar for Homes and Projects',
    intro: 'Looking for marble tiles in Alwar or a marble shop near Naugaon? Shree Durga Tiles helps you compare natural marble, white marble and tile options for floors, walls and special spaces. अलवर में मार्बल और टाइल्स देखने के लिए हमारे शोरूम में आपका स्वागत है।',
    sections: [
      {
        heading: 'Choose marble for the way a room is used',
        paragraphs: [
          'Marble can bring natural variation and a calm, bright look to living rooms, entrances, bedrooms and prayer spaces. Each slab has its own pattern, so view the actual material before deciding how it will work with your light, furniture and wall colours. White marble Alwar customers consider for smaller or dim rooms may help reflect light, while warmer shades can suit a softer interior.',
          'For a floor, think about the traffic, the look you want and the time available for care. Wall applications can use a different finish from floors. Ask our team to help compare the stone surface and intended use rather than selecting by a photograph alone. For a mandir or pooja room, see our dedicated mandir marble page.',
        ],
      },
      {
        heading: 'Finishes, sizes and planning',
        paragraphs: [
          'Polished stone has a reflective surface and can make natural patterns more visible. Honed or matte finishes have a quieter appearance. The right option depends on the room, slip considerations, cleaning routine and the advice of your installer. Check slab or tile dimensions, thickness, edge details and installation requirements before confirming quantities.',
          'Measure the area carefully and include cut-outs, borders, steps and likely wastage in the discussion with your contractor. Bring room photos or a plan when visiting the showroom. We can help you compare available choices; {{TODO: confirm current marble and tile size availability}}. मार्बल टाइल्स अलवर में चुनते समय नमूना, फिनिश और जगह का उपयोग साथ देखकर फैसला करें।',
        ],
      },
      {
        heading: 'Care and getting a quote',
        paragraphs: [
          'Use a soft cloth or mop and a cleaner suitable for natural stone. Wipe spills promptly, avoid harsh acidic products unless the stone supplier confirms they are safe, and ask your installer whether sealing is recommended for the selected material. Regular dust removal helps reduce surface scratches from grit.',
          'Share your preferred colour, approximate area and intended use to request a quote. A visit lets you compare slabs and surfaces in person. We also help customers looking for Italian marble, granite, designer tiles, kitchen tops and outdoor stone. Delivery options can be discussed for projects outside Alwar, including supply across India.',
        ],
      },
    ],
    faqs: [
      { question: 'Where can I compare marble tiles in Alwar?', answer: 'Visit Shree Durga Tiles at Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.' },
      { question: 'How do I choose white marble for flooring?', answer: 'Compare actual samples, finish, room lighting, traffic and care needs, and review the installer’s advice before selecting.' },
      { question: 'Can I request a quote before visiting?', answer: 'Yes. Call or WhatsApp with the material, approximate area and project location to discuss a quote.' },
    ],
  },
  {
    slug: 'italian-marble-alwar',
    title: 'Italian Marble Alwar | Shree Durga Tiles',
    description: 'Explore Italian and imported marble options in Naugaon, Alwar. Compare patterns, finishes and care requirements before you choose.',
    h1: 'Italian Marble in Alwar: Compare Before You Choose',
    intro: 'Shree Durga Tiles helps you explore Italian marble in Alwar and compare imported marble with other natural stone choices. Bring your room plan, look at the actual surfaces and choose for your space—not only from a catalogue photograph. इटालियन मार्बल अलवर में देखने और समझने के लिए शोरूम आएँ।',
    sections: [
      {
        heading: 'What to consider with Italian marble',
        paragraphs: [
          'Italian marble is often selected for its distinctive veining, colour and polished appearance. Natural stone is not perfectly uniform: pattern, shade and movement can vary from one slab to another. If continuity matters across a large floor or feature wall, inspect multiple slabs together and confirm how pieces will be laid out before placing an order.',
          'Think about where the marble will be used. A formal living room, bedroom floor, staircase or feature wall may have different cleaning and wear expectations. Ask about the specific stone, its finish and recommended installation method. For a simpler comparison, bring photos of the room and any adjacent flooring or cabinetry to the showroom.',
        ],
      },
      {
        heading: 'Finishes, dimensions and installation',
        paragraphs: [
          'A polished finish brings out colour and reflection, while a honed finish can look more subdued. Finish availability depends on the selected stone. Confirm slab dimensions, thickness, edge treatment, calibration and whether the installer will need to make site cuts. Check that the selected finish matches the location and expected foot traffic.',
          'Plan quantities from measured room dimensions and allow your contractor to calculate cuts, borders and wastage. Natural marble needs careful handling and a suitable substrate. Ask the installer about joint widths, adhesives, levelling and sealing before work begins. {{TODO: confirm current Italian marble origins, slab sizes and finish availability}}. इटालियन मार्बल अलवर में खरीदने से पहले रंग और नसों का वास्तविक नमूना देखें।',
        ],
      },
      {
        heading: 'Care, comparison and a useful quote',
        paragraphs: [
          'For routine care, remove dust and use a soft mop with a product approved for natural stone. Clean spills promptly and avoid acidic household cleaners that may dull or etch the surface. Ask whether sealing is appropriate for the exact marble and follow the supplier’s and installer’s care instructions.',
          'Imported marble is not the only option for an elegant interior. Compare it with Indian marble, PGVT marble tiles and other surfaces by looking at pattern, maintenance, installation needs and the overall project plan. Share your location and area for a quote; no online rate is assumed here. Call or message Shree Durga Tiles to discuss availability and delivery.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I see Italian marble in person in Alwar?', answer: 'Visit the Shree Durga Tiles showroom in Naugaon to ask about current Italian and imported marble options.' },
      { question: 'Is Italian marble suitable for every room?', answer: 'Suitability depends on the stone, finish, room use and care expectations. Compare samples and consult your installer.' },
      { question: 'What should I bring when requesting a quote?', answer: 'Bring the approximate area, room photos or a plan, preferred colours and your project location.' },
    ],
  },
  {
    slug: 'granite-alwar',
    title: 'Granite in Alwar | Shree Durga Tiles',
    description: 'Find granite for kitchens, floors and projects at Shree Durga Tiles, Naugaon. Compare colour, finish, slab size and care.',
    h1: 'Granite in Alwar for Kitchens, Floors and Projects',
    intro: 'Looking for granite in Alwar or a granite dealer near Naugaon? Shree Durga Tiles helps homeowners, builders and contractors compare granite for kitchen counters, floors, stairs and other applications. रसोई और घर के लिए ग्रेनाइट चुनते समय नमूना और उपयोग दोनों देखें।',
    sections: [
      {
        heading: 'Selecting kitchen granite',
        paragraphs: [
          'Kitchen granite is chosen for its natural pattern and use as a work surface. Compare the colour against cabinet fronts, wall tiles and lighting. Dark and light stones create different visual effects, and every slab has its own pattern. Inspect the actual slab and mark areas with strong veins before the fabricator plans cuts around sinks, cooktops and corners.',
          'Ask the fabricator about thickness, edge profile, support, cut-outs and installation. The surface should be planned around how the kitchen is used, including the location of joins and the need for a suitable seal. A sample alone may not represent a full slab, so review the larger piece when possible. Share your counter dimensions and a rough kitchen plan when asking for guidance.',
        ],
      },
      {
        heading: 'Granite for floors and other uses',
        paragraphs: [
          'Granite can also be considered for floors, steps and selected exterior applications. The right finish matters: a polished surface differs from a textured or flamed surface in appearance and underfoot feel. Ask whether the chosen stone and finish are suitable for the intended location, especially where water or outdoor exposure is expected.',
          'Review slab size and thickness, then ask your installer to measure the site and confirm joint, support and edge details. For floors, consider the level of traffic and cleaning routine. For outdoor projects, check weather exposure and slip requirements with the installer. {{TODO: confirm current granite colours, finishes and slab dimensions}}. We can discuss project quantities and bulk supply based on your requirements.',
        ],
      },
      {
        heading: 'Cleaning, maintenance and quote details',
        paragraphs: [
          'Wipe kitchen spills soon after they happen, clean with a soft cloth and use a surface-safe cleaner recommended for the chosen granite. Avoid harsh chemicals unless the supplier confirms they are suitable. Ask the installer if periodic sealing is recommended and what cleaning products to avoid.',
          'To request a quote from a granite dealer in Alwar, share the application, measurements, preferred colour family and site location. A kitchen-top quote may need a drawing with sink and hob cut-outs; flooring needs the measured area and finish preference. Visit the Naugaon showroom to compare granite alongside quartz and marble.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I compare kitchen granite in Alwar?', answer: 'Yes. Visit Shree Durga Tiles in Naugaon and ask to compare granite options for kitchen counters.' },
      { question: 'What details are needed for a kitchen granite quote?', answer: 'Share counter measurements, sink and hob cut-outs, preferred edge and finish, and your installation location.' },
      { question: 'How should I clean granite?', answer: 'Use a soft cloth and a cleaner approved for the selected stone. Ask the supplier about sealing and products to avoid.' },
    ],
  },
  {
    slug: 'designer-tiles-alwar',
    title: 'Designer Tiles Alwar | Shree Durga Tiles',
    description: 'Browse designer, PGVT, floor and wall tiles in Naugaon, Alwar. Compare designs, sizes, finishes and room suitability.',
    h1: 'Designer Tiles in Alwar for Floors and Walls',
    intro: 'Explore designer tiles in Alwar at Shree Durga Tiles. Compare PGVT marble tiles, floor tiles and wall tiles for homes, shops and project spaces. Bring your room measurements and lighting details so you can assess how a tile will look beyond the sample. अलवर में डिजाइनर टाइल्स चुनने से पहले आकार और फिनिश की तुलना करें।',
    sections: [
      {
        heading: 'Match tile type to its application',
        paragraphs: [
          'PGVT tiles use a polished glazed surface and can create a marble-inspired look. They are one choice for living areas and other interiors, while wall tiles, kitchen backsplashes and bathroom products may have different requirements. Check the manufacturer’s intended application before choosing a tile for a floor or wall.',
          'For each room, consider foot traffic, water exposure, cleaning habits and the visual scale of the design. Large formats can reduce the number of grout lines but require a suitable flat base and experienced installation. Smaller tiles can help with detailing or slopes. Ask for the precise product specification rather than inferring performance from the pattern or finish.',
        ],
      },
      {
        heading: 'Sizes, surface finish and laying plan',
        paragraphs: [
          'Compare tile dimensions, thickness, surface finish, shade and batch. A glossy tile reflects more light; a matte or textured surface has a different look and may be preferred in some locations. Always confirm slip suitability with the supplier and installer, particularly in wet areas. View more than one tile from the batch to understand shade variation.',
          'Measure the room, note doorways and corners, and plan where cuts and borders will fall. The installer can estimate quantities including cuts and wastage. Confirm grout colour, joint width and cleaning steps before work starts. {{TODO: confirm current PGVT and designer tile sizes and finishes}}. Our showroom can help you compare floor tiles Alwar customers use for different interior styles.',
        ],
      },
      {
        heading: 'Care and project advice',
        paragraphs: [
          'Sweep or vacuum grit before mopping to reduce abrasion. Use a mild cleaner suitable for the tile and grout, rinse when required and dry standing water in frequently wet areas. Avoid abrasive pads that could affect the surface. Follow the product’s care guidance and let the installer explain the grout-curing time before cleaning.',
          'When requesting a tile quote, share the room, approximate square area, preferred design, tile size and project location. Bring photos of paint, cabinetry or fixtures to compare colours. Shree Durga Tiles also offers marble, granite, bathroom tiles, kitchen tops and outdoor stone, so you can coordinate related surfaces in one visit.',
        ],
      },
    ],
    faqs: [
      { question: 'What are PGVT marble tiles?', answer: 'PGVT is a polished glazed vitrified tile option with a smooth, reflective surface and marble-inspired designs. Confirm each product’s specifications.' },
      { question: 'Can designer tiles be used on walls and floors?', answer: 'Use each product only in the applications listed by its manufacturer and confirm suitability with your installer.' },
      { question: 'How do I estimate how many tiles I need?', answer: 'Measure the area and ask your installer to account for cuts, layout and wastage for the selected size.' },
    ],
  },
  {
    slug: 'bathroom-tiles-alwar',
    title: 'Bathroom Tiles Alwar | Shree Durga Tiles',
    description: 'Choose bathroom and anti-skid tiles in Naugaon, Alwar. Compare wet-area suitability, finish, size, cleaning and installation.',
    h1: 'Bathroom Tiles in Alwar: Safe, Practical Choices',
    intro: 'Planning a bathroom renovation? Shree Durga Tiles helps you compare bathroom tiles in Alwar for floors, shower areas and walls. Look at surface finish, water exposure, cleaning needs and product specifications together. बाथरूम टाइल्स अलवर में चुनते समय गीले फर्श की सुरक्षा और सफाई पर ध्यान दें।',
    sections: [
      {
        heading: 'Floor tiles and wet-area suitability',
        paragraphs: [
          'Bathroom floors are exposed to water, soap and frequent cleaning. Consider an anti-skid or textured surface designed for the location, and ask the tile supplier for the product’s slip-related information. A label or appearance alone is not enough to determine safety; the installer should also consider drainage, slope, grout and the shower layout.',
          'Think about who uses the bathroom and how water moves across the floor. A smaller tile can help installers form a slope toward a drain, while larger pieces may need a carefully planned layout. The selected tile must be suitable for the intended wet area. Test samples carefully and ask the installer about the substrate and waterproofing system.',
        ],
      },
      {
        heading: 'Wall tiles, sizes and finish',
        paragraphs: [
          'Wall tiles can make a bathroom feel brighter or add contrast behind a vanity or shower. Compare colour and finish under lighting similar to your bathroom. Glossy surfaces reflect light and can be easier to wipe, while matte finishes create a softer look. Confirm that the chosen product is intended for walls and that edges and trims are available for the design.',
          'Measure floor and wall areas separately, mark fixtures and niches, and decide where tile cuts will appear. Confirm dimensions, shade batch, grout colour and joint width before ordering. Ask your contractor to specify waterproofing and curing steps. {{TODO: confirm current anti-skid bathroom tile ranges and sizes}}. Bring photos or a simple plan to the Naugaon showroom.',
        ],
      },
      {
        heading: 'Cleaning and getting a quote',
        paragraphs: [
          'Regularly remove soap residue and keep grout lines clean with products recommended for the tile. Avoid harsh chemicals or abrasive tools unless the manufacturer confirms they are safe. Good ventilation and wiping standing water can help keep surfaces cleaner. Follow the tile and grout care instructions provided at installation.',
          'For a useful quote, share floor and wall measurements, shower dimensions, preferred styles and your location. Mention whether you need floor-only, wall-only or a coordinated set. We can help compare bathroom tiles with designer floor tiles, sanitaryware and other materials. Call or WhatsApp to discuss supply and delivery options.',
        ],
      },
    ],
    faqs: [
      { question: 'What should I look for in anti-skid bathroom tiles?', answer: 'Check the product’s wet-area and slip guidance, then discuss the finish, slope and drainage with your installer.' },
      { question: 'Can one tile be used on both bathroom walls and floors?', answer: 'Only if the manufacturer lists both uses. Confirm suitability for wet floors before selecting.' },
      { question: 'What measurements are needed for a bathroom quote?', answer: 'Measure floor and wall areas separately, including shower walls, niches and fixture openings.' },
    ],
  },
  {
    slug: 'kitchen-tops-alwar',
    title: 'Kitchen Tops Alwar | Granite & Quartz',
    description: 'Compare kitchen platform granite and quartz kitchen tops in Alwar. Plan colour, edges, cut-outs, measurements and care.',
    h1: 'Kitchen Tops in Alwar: Granite and Quartz Options',
    intro: 'A kitchen worktop must suit the layout, daily routine and cabinetry. At Shree Durga Tiles in Naugaon, compare kitchen platform granite and quartz kitchen top options before planning your fabrication. रसोई के काउंटर के लिए रंग, कटिंग और उपयोग की जरूरत साथ में देखें।',
    sections: [
      {
        heading: 'Granite or quartz for your kitchen',
        paragraphs: [
          'Granite is natural stone with variation in colour and pattern from slab to slab. Quartz surfaces have a manufactured composition and may offer a more consistent pattern, depending on the product. Compare actual samples and ask about each selected product’s heat, stain, scratch and cleaning guidance rather than assuming all surfaces behave alike.',
          'Consider your cooking habits, where appliances sit and how the worktop meets the backsplash. A sample helps with colour coordination, but the full slab or a large sample gives a better sense of pattern. Ask the fabricator about seams, support, sink cut-outs, hob openings, wall clearance and edge profiles. The exact material and supplier specifications should guide the final choice.',
        ],
      },
      {
        heading: 'Measure, finish and installation planning',
        paragraphs: [
          'Before requesting fabrication, share a plan with counter lengths, depth, corners and cut-outs. Confirm the finished thickness, edge detail and overhang. A professional should take final site measurements after cabinet installation, since small alignment differences can change the required cuts. Also confirm the substrate and support for the chosen surface.',
          'Polished granite gives a reflective look; other finishes may have a softer appearance. Quartz surface options vary, so review the specific sample and technical details. Keep the same batch or slab reference for planning. {{TODO: confirm current quartz brands, colours and kitchen top dimensions}}. We can discuss the material and connect your selection to the installation plan with your fabricator.',
        ],
      },
      {
        heading: 'Care and quote preparation',
        paragraphs: [
          'Use a soft cloth and cleaner recommended for your chosen worktop. Wipe spills promptly, use chopping boards and place hot cookware on a suitable trivet unless product guidance says otherwise. Ask whether the surface requires sealing, which cleaners to avoid and how to protect joins or edges during installation.',
          'For a quote, provide your kitchen layout, approximate dimensions, preferred colour, sink and hob details, and the delivery location. If cabinets are not yet installed, treat measurements as provisional and arrange a final check with the fabricator. Visit Shree Durga Tiles to compare granite, quartz, backsplash tiles and related surfaces.',
        ],
      },
    ],
    faqs: [
      { question: 'Should I choose granite or quartz for my kitchen top?', answer: 'Compare the specific products, care guidance, pattern, fabrication details and your kitchen use before deciding.' },
      { question: 'When should a kitchen worktop be measured?', answer: 'Use preliminary plans for discussion, then have the fabricator take final measurements after the cabinets are fitted.' },
      { question: 'What information is needed for a quote?', answer: 'Share counter dimensions, cut-outs, preferred material and finish, and your project location.' },
    ],
  },
  {
    slug: 'mandir-marble-alwar',
    title: 'Mandir Marble Alwar | Shree Durga Tiles',
    description: 'Explore white marble for mandir and pooja rooms in Naugaon, Alwar. Compare flooring, platforms, borders, finishes and care.',
    h1: 'Mandir Marble in Alwar for a Calm Pooja Space',
    intro: 'White marble is a considered choice for a mandir or pooja room. Shree Durga Tiles helps you compare stone for floors, platforms, steps and wall details in Naugaon, Alwar. मंदिर के लिए मार्बल चुनते समय जगह, सफाई और डिजाइन का ध्यान रखें।',
    sections: [
      {
        heading: 'Plan the complete prayer space',
        paragraphs: [
          'Start with the size and position of the room or niche, the location of the mandir platform and the amount of natural or artificial light. White marble can create a bright, quiet background, while a subtle border or a different stone can add definition. View samples beside the room’s paint and woodwork to understand their colour in context.',
          'Decide whether you need flooring, a platform top, steps, a wall panel or several coordinated pieces. The stone thickness, edge profile and support can differ by application. Discuss cut-outs, joints and borders with your mason or installer before selecting dimensions. If the area receives water or oil from daily rituals, ask about cleaning and sealing recommendations for the exact material.',
        ],
      },
      {
        heading: 'Finishes, sizes and installation',
        paragraphs: [
          'Polished marble reflects light and shows its natural pattern clearly; honed finishes have less reflection. For floors and steps, consider how the finish feels underfoot and consult your installer about slip safety. Ensure the material is suitable for the intended setting. Natural stone varies in shade and veining, so inspect the pieces planned for the platform and adjoining floor together.',
          'Measure the floor, platform and wall separately, and share a drawing with exact dimensions. Confirm thickness, edges, joints and installation sequence. A skilled installer can help plan the layout around corners and thresholds. {{TODO: confirm current white marble types and cut-to-size service}}. Visit the showroom to compare marble options with Italian marble and other natural stones.',
        ],
      },
      {
        heading: 'Care and an informed selection',
        paragraphs: [
          'Dust the area regularly and clean with a soft cloth and a stone-safe cleaner. Wipe oil, flower residue and liquids promptly. Avoid acidic or abrasive cleaners unless confirmed safe for the selected marble. Ask whether sealing is recommended and follow the installer’s advice about when the floor can be cleaned after fitting.',
          'When you ask for a quote, mention whether the requirement is for a home mandir, a full pooja room or a project with several units. Share a plan, photographs, preferred colour and approximate quantities. We can also discuss project supply and delivery. A visit lets you see the stone surface and variation in person before making a decision.',
        ],
      },
    ],
    faqs: [
      { question: 'Which marble is suitable for a pooja room?', answer: 'Compare the actual stone, finish, room conditions and care needs, and confirm suitability with your installer.' },
      { question: 'Can marble be cut for a mandir platform?', answer: 'Ask about current cut-to-size options and share exact dimensions for confirmation before ordering.' },
      { question: 'How should I clean white mandir marble?', answer: 'Use a soft cloth and stone-safe cleaner, wipe spills promptly and follow sealing advice for the selected stone.' },
    ],
  },
  {
    slug: 'outdoor-stone-alwar',
    title: 'Outdoor Stone Alwar | Shree Durga Tiles',
    description: 'Compare outdoor flooring stone, parking tiles and landscape surfaces in Naugaon, Alwar. Check finish, drainage and site needs.',
    h1: 'Outdoor Flooring Stone in Alwar for Open Spaces',
    intro: 'Outdoor surfaces need to work with the site, weather and way people move through it. Shree Durga Tiles helps compare outdoor flooring stone in Alwar for paths, parking areas, entrances and landscape details. बाहरी फर्श के लिए सतह, पानी की निकासी और उपयोग की जांच जरूरी है।',
    sections: [
      {
        heading: 'Select for traffic and exposure',
        paragraphs: [
          'Start by identifying the use: pedestrian path, driveway, parking bay, porch or garden feature. Vehicle movement needs a product and base designed for the expected load; a decorative paver should not be assumed suitable for every parking area. Ask the supplier and installer to confirm product specifications for the exact application.',
          'Outdoor stone experiences sunlight, rain, dust and temperature changes. Compare textured or natural finishes and discuss slip considerations when surfaces are wet. Check how the material looks in daylight, whether colour variation is expected and how the surface should be cleaned. For landscape use, consider how paving meets soil, planting beds, steps and drainage points.',
        ],
      },
      {
        heading: 'Sizes, layout and site preparation',
        paragraphs: [
          'Measure the full area, including edges, curves, drains and access points. A site plan helps the installer set levels and a fall for water movement. Ask whether the product needs a concrete base, compacted sub-base, mortar bed or another installation system. The chosen method depends on the stone, vehicle load, soil and site conditions.',
          'Review piece dimensions, thickness, joint material, edge restraints and cuts before ordering. Parking tiles and landscape stone can have different construction requirements, so use professional installation guidance. {{TODO: confirm current outdoor stone thicknesses, surface options and vehicle-load guidance}}. Share site photos and a simple plan when you contact the showroom.',
        ],
      },
      {
        heading: 'Maintenance and quote details',
        paragraphs: [
          'Sweep away leaves and grit regularly, clear drainage channels and wash surfaces using products appropriate to the selected stone. Avoid letting water pool near entrances. Ask whether sealing is recommended and how often the surface should be inspected, especially where vehicles turn or oil may spill.',
          'For a project quote, provide measurements, intended use, site condition, preferred finish and delivery location. Mention whether the material is for a walkway, parking space or landscape feature. Shree Durga Tiles can discuss bulk supply and delivery options, including requirements beyond Rajasthan. Confirm unloading and access arrangements with your site team.',
        ],
      },
    ],
    faqs: [
      { question: 'Can outdoor stone be used for parking?', answer: 'Only choose a product and installation system confirmed for the expected vehicle load by the supplier and installer.' },
      { question: 'What finish is best for outdoor flooring?', answer: 'Compare the product’s outdoor suitability and wet-surface slip guidance with the conditions at your site.' },
      { question: 'What should I send for an outdoor quote?', answer: 'Share the measured area, use, site photos, preferred finish and location.' },
    ],
  },
  {
    slug: 'tiles-shop-naugaon',
    title: 'Tiles Shop Naugaon | Shree Durga Tiles',
    description: 'Visit Shree Durga Tiles, a tiles shop in Naugaon, Alwar. Compare marble, granite, PGVT, bathroom and designer tiles.',
    h1: 'Tiles Shop in Naugaon, Alwar: Shree Durga Tiles',
    intro: 'Shree Durga Tiles is a local tiles shop in Naugaon, Alwar, where you can compare marble, granite, designer tiles and natural stone for home and project use. नौगांव टाइल्स की दुकान पर आकर नमूने देखें और अपने काम के बारे में बात करें।',
    sections: [
      {
        heading: 'A local place to compare materials',
        paragraphs: [
          'Choosing a surface is easier when you can see colour, texture and finish in person. At our Naugaon showroom, discuss where the material will be used and compare available marble, PGVT marble tiles, designer tiles, granite and bathroom options. Bring room photos, measurements or a plan so the selection fits the space rather than only the sample.',
          'We serve people planning new homes, renovations, shops and larger projects. Different rooms have different needs: a bathroom floor needs wet-area suitability, a kitchen counter needs a material and fabrication plan, and a living room may call for a particular colour or pattern. Ask about the selected product’s specification and installation guidance before confirming the order.',
        ],
      },
      {
        heading: 'How to prepare for your showroom visit',
        paragraphs: [
          'Note the area to cover, intended application and your preferred colour family. For tiles, record whether you need floor, wall or both; for granite or quartz, bring counter measurements and cut-out information. Photos of cabinets, paint, doors and existing surfaces make it easier to compare tones under different lighting.',
          'Check dimensions, finish, shade batch and care instructions before placing an order. Ask your installer to calculate quantities for cuts and wastage and confirm the base preparation. {{TODO: confirm showroom visiting directions and entrance landmark details}}. Shree Durga Tiles Naugaon can discuss quote requests, bulk supply and delivery across India.',
        ],
      },
      {
        heading: 'Care and service area',
        paragraphs: [
          'Care depends on the material. Use stone-safe cleaners for marble and granite; clean tiles and grout with products recommended for the selected surface. Remove grit before mopping and address spills promptly. Ask the supplier about sealing, cleaning methods and any product-specific precautions at the time you select the material.',
          'Our location on Delhi–Alwar Road, near Kapoor Dharamshala, is convenient for customers from Naugaon and Alwar. We also speak with customers from Rajgarh, Thanagazi, Tijara, Bhiwadi and Behror. Delivery planning can be discussed for projects across India. Call or WhatsApp with your requirement to start a conversation.',
        ],
      },
    ],
    faqs: [
      { question: 'Where is Shree Durga Tiles in Naugaon?', answer: 'We are at Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.' },
      { question: 'What can I see at the Naugaon tiles shop?', answer: 'Ask about marble, granite, designer and PGVT tiles, bathroom tiles, kitchen surfaces and outdoor stone.' },
      { question: 'Do you discuss delivery outside Naugaon?', answer: 'Yes. Contact us with your project location and material requirement to discuss delivery options.' },
    ],
  },
];
