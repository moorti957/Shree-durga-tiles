import bathroomTiles from '@/assets/bathroom-tiles.jpg';
import marbleTiles from '@/assets/pure-white-marble.png';
import italianMarble from '@/assets/warm-ivory-stone.png';
import type { BlogPost } from '@/services/blogApi';

export const blogDrafts: BlogPost[] = [
  {
    id: 'starter-marble-tiles-price-alwar',
    slug: 'alwar-marble-tiles-rate',
    title: 'अलवर में मार्बल टाइल्स का रेट कितना है?',
    excerpt: 'मार्बल और टाइल्स का खर्च किस बात पर निर्भर करता है? जानें कि सही तुलना के लिए कौन-सी जानकारी लेकर शोरूम आएँ।',
    content: `<p>अलवर में मार्बल टाइल्स का एक ही रेट नहीं होता। सामग्री, रंग, मोटाई, फिनिश, आकार और उपलब्धता के अनुसार विकल्प बदलते हैं। इसलिए केवल एक फोटो या नाम देखकर पूरी लागत तय करना सही नहीं है।</p><p>कुल खर्च में सामग्री के साथ कटिंग, ट्रांसपोर्ट, इंस्टॉलेशन और साइट की तैयारी भी शामिल हो सकती है। अपने कमरे का माप, फोटो और उपयोग की जानकारी लेकर Shree Durga Tiles के Naugaon showroom आएँ। अलग-अलग नमूनों को साथ देखकर तुलना करें और लिखित quote में सामग्री और काम का दायरा स्पष्ट कराएँ।</p><h2>रेट पूछने से पहले क्या तैयार रखें?</h2><p>फर्श या दीवार का माप, पसंदीदा रंग, उपयोग का स्थान और अनुमानित मात्रा बताएं। इंस्टॉलर से कटिंग और wastage की मात्रा की पुष्टि करें। {{TODO: add verified local rate examples only after current supplier confirmation}}।</p><p>सही विकल्प चुनने के लिए वास्तविक सतह और specification देखें। जानकारी या quote के लिए showroom से संपर्क करें।</p>`,
    coverImage: marbleTiles.src,
    category: 'मार्बल और टाइल्स',
    author: 'Shree Durga Tiles',
    publishedAt: '',
    isDraft: true,
    readTime: 3,
    tags: [],
  },
  {
    id: 'starter-bathroom-tile-selection',
    slug: 'bathroom-ke-liye-kaunsi-tiles',
    title: 'बाथरूम के लिए कौन सी टाइल्स सही रहती हैं?',
    excerpt: 'गीले फर्श, दीवारों, सफाई और installation को ध्यान में रखकर बाथरूम टाइल्स कैसे चुनें।',
    content: `<p>बाथरूम में फर्श और दीवारों की जरूरत अलग-अलग होती है। फर्श के लिए ऐसी tile चुनें जिसकी निर्माता जानकारी उस wet area के उपयोग की पुष्टि करती हो। Anti-skid या textured finish के बारे में पूछें और फिसलन से जुड़ी सलाह installer से लें। केवल tile की चमक या दिखावट देखकर सुरक्षा का अनुमान न लगाएँ।</p><p>दीवारों के लिए रंग, रोशनी, आकार और सफाई को साथ देखकर चुनें। Shower area, niche और vanity के माप अलग नोट करें। टाइल की size और layout से cuts और joints बदल सकते हैं; installer से quantity और wastage की गणना कराएँ।</p><h2>सफाई और installation की योजना</h2><p>लेने से पहले shade batch, grout colour और care instructions पूछें। Waterproofing, drainage slope और curing का काम योग्य installer से करवाएँ। चुनी हुई tile के लिए निर्माता द्वारा बताए गए cleaner का ही उपयोग करें और standing water साफ रखें।</p><p>बाथरूम की floor और wall measurements के साथ Naugaon showroom आएँ। Shree Durga Tiles पर उपलब्ध विकल्पों और specifications के बारे में पूछें।</p>`,
    coverImage: bathroomTiles.src,
    category: 'Bathroom Tiles',
    author: 'Shree Durga Tiles',
    publishedAt: '',
    isDraft: true,
    readTime: 3,
    tags: [],
  },
  {
    id: 'starter-italian-vs-indian-marble',
    slug: 'italian-marble-vs-indian-marble',
    title: 'Italian marble vs Indian marble: which to choose?',
    excerpt: 'Compare natural variation, finish, maintenance and installation before choosing Italian or Indian marble for your space.',
    content: `<p>Italian and Indian marble can both be considered for floors, walls and feature areas. The best choice depends on the particular stone, its pattern, finish, dimensions, budget and intended use—not only on where it comes from. Natural marble varies, so inspect the actual slab or pieces planned for your room.</p><p>Compare the colour and veining beside your room’s lighting, furniture and adjoining surfaces. Ask about thickness, finish, installation details and whether sealing is recommended. For a large continuous floor, review several pieces together and plan the layout with your installer before ordering.</p><h2>Care and project planning</h2><p>Marble generally benefits from prompt spill cleanup and a cleaner approved for natural stone. Avoid harsh acidic products unless the supplier confirms they are suitable. Ask your installer about substrate preparation, joints and when the surface can be used after fitting.</p><p>Bring room measurements or a plan to Shree Durga Tiles in Naugaon, Alwar, to compare available options in person. {{TODO: add verified comparison of stocked Italian and Indian marble varieties}}. Request a quote based on the exact material and measured area.</p>`,
    coverImage: italianMarble.src,
    category: 'Marble Guide',
    author: 'Shree Durga Tiles',
    publishedAt: '',
    isDraft: true,
    readTime: 4,
    tags: [],
  },
];
