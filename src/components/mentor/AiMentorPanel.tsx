import React, { useState } from 'react';
import { CircuitGate, QuantumState, SupportedLanguage } from '../../quantum/types';
import { SUPPORTED_LANGUAGES } from '../../quantum/telemetry';
import { GATE_REGISTRY } from '../../quantum/gates';
import { sounds } from '../../utils/audio';
import {
  Bot,
  Send,
  Sparkles,
  Globe2,
  Brain,
  Cpu,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface AiMentorPanelProps {
  currentStepIndex: number;
  gates: CircuitGate[];
  currentState: QuantumState;
  numQubits: number;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: string;
  mathFormula?: string;
  topicTag?: string;
}

interface CategoryPromptItem {
  label: string;
  query: string;
}

const CATEGORY_PROMPTS_I18N: Record<SupportedLanguage, Record<string, CategoryPromptItem[]>> = {
  en: {
    foundations: [
      { label: '⚛️ What is a Qubit?', query: 'Explain what a qubit is and how superposition works.' },
      { label: '🔗 Explain Entanglement', query: 'How does quantum entanglement and Bell states work?' },
      { label: '📏 Born Rule & Measurement', query: 'Explain measurement collapse and the Born rule.' },
      { label: '📜 No-Cloning Theorem', query: 'What is the No-Cloning Theorem and why does it matter?' }
    ],
    gates: [
      { label: '🌀 Hadamard Gate', query: 'How does the Hadamard gate physically rotate the state?' },
      { label: '⚡ Pauli Operators (X, Y, Z)', query: 'Explain the Pauli X, Y, and Z gates with their matrices.' },
      { label: '↩️ Phase Kickback', query: 'How does phase kickback work in controlled gates?' },
      { label: '📐 Phase Gates (S & T)', query: 'What do the S and T phase gates do?' }
    ],
    algorithms: [
      { label: "🔑 Shor's Factoring", query: "How does Shor's algorithm break RSA encryption?" },
      { label: "🔍 Grover's Search", query: "How does Grover's search achieve quadratic speedup?" },
      { label: '🌌 Quantum Teleportation', query: 'Walk me through the Quantum Teleportation protocol step by step.' },
      { label: '⚖️ Deutsch-Jozsa Algorithm', query: 'How does the Deutsch-Jozsa algorithm test a function in 1 query?' }
    ],
    hardware: [
      { label: '🧊 Transmon Superconducting', query: 'How do IBM superconducting transmon qubits work?' },
      { label: '🧲 Trapped Ion Qubits', query: 'Explain trapped ion quantum computing architectures.' },
      { label: '🛡️ Surface Code Error Correction', query: 'How does the surface code protect logical qubits from noise?' },
      { label: '🌡️ Decoherence & T1/T2 Times', query: 'What causes quantum decoherence and phase decay?' }
    ]
  },
  hi: {
    foundations: [
      { label: '⚛️ क्युबिट क्या है?', query: 'क्युबिट (Qubit) क्या है और सुपरपोजिशन कैसे काम करता है?' },
      { label: '🔗 क्वांटम एंटैंगलमेंट', query: 'क्वांटम एंटैंगलमेंट और बेल स्टेट (Bell state) क्या है?' },
      { label: '📏 मापन और बोर्न नियम', query: 'क्वांटम मापन और बोर्न का नियम (Born Rule) समझाइए।' },
      { label: '📜 नो-क्लोनिंग प्रमेय', query: 'नो-क्लोनिंग प्रमेय (No-Cloning Theorem) क्या है?' }
    ],
    gates: [
      { label: '🌀 हैडामार्ड गेट (H)', query: 'हैडामार्ड गेट (Hadamard Gate) क्युबिट को कैसे घुमाता है?' },
      { label: '⚡ पॉली गेट्स (X, Y, Z)', query: 'पॉली X, Y और Z गेट्स के कार्य और मैट्रिक्स क्या हैं?' },
      { label: '↩️ फेज़ किकबैक', query: 'कंट्रोल्ड गेट्स में फेज़ किकबैक (Phase Kickback) कैसे होता है?' },
      { label: '📐 S और T गेट्स', query: 'S और T फेज़ गेट्स का क्या महत्व है?' }
    ],
    algorithms: [
      { label: "🔑 शोर का एल्गोरिदम", query: "शोर का एल्गोरिदम (Shor's Algorithm) RSA को कैसे तोड़ता है?" },
      { label: "🔍 ग्रोवर की खोज", query: "ग्रोवर सर्च (Grover's Search) द्विघात गति (Quadratic speedup) कैसे देता है?" },
      { label: '🌌 क्वांटम टेलीपोर्टेशन', query: 'क्वांटम टेलीपोर्टेशन प्रोटोकॉल के चरण समझाइए।' },
      { label: '⚖️ डॉयच-जोज़ा एल्गोरिदम', query: 'डॉयच-जोज़ा एल्गोरिदम 1 ही क्वेरी में फंक्शन कैसे परखता है?' }
    ],
    hardware: [
      { label: '🧊 ट्रांसमॉन सुपरकंडक्टिंग', query: 'सुपरकंडक्टिंग ट्रांसमॉन क्युबिट कैसे बनते हैं?' },
      { label: '🧲 ट्रैप्ड आयन कंप्यूटर', query: 'ट्रैप्ड आयन क्वांटम कंप्यूटर कैसे काम करता है?' },
      { label: '🛡️ सरफेस कोड त्रुटि सुधार', query: 'सरफेस कोड (Surface Code) से क्वांटम त्रुटि सुधार कैसे होता है?' },
      { label: '🌡️ डिकोहेरेंस (T1/T2)', query: 'क्वांटम डिकोहेरेंस और T1/T2 समय क्या है?' }
    ]
  },
  ta: {
    foundations: [
      { label: '⚛️ கியூபிட் என்றால் என்ன?', query: 'கியூபிட் (Qubit) மற்றும் மேற்பொருந்துதல் (Superposition) எப்படி செயல்படுகிறது?' },
      { label: '🔗 குவாண்டம் பிணைப்பு', query: 'குவாண்டம் பிணைப்பு (Entanglement) மற்றும் பெல் நிலை (Bell state) விளக்குக.' },
      { label: '📏 அளவீடு & போர்ன் விதி', query: 'குவாண்டம் அளவீடு மற்றும் போர்ன் விதி (Born Rule) விளக்குக.' },
      { label: '📜 நகலெடுக்காமை தேற்றம்', query: 'நோ-குளோனிங் தேற்றம் (No-Cloning Theorem) என்றால் என்ன?' }
    ],
    gates: [
      { label: '🌀 ஹடமார்ட் வாயில் (H)', query: 'ஹடமார்ட் வாயில் (Hadamard Gate) எப்படி சுழற்சி செய்கிறது?' },
      { label: '⚡ பாலி வாயில்கள் (X, Y, Z)', query: 'பாலி X, Y, Z வாயில்களின் அணிகள் (Matrices) என்ன?' },
      { label: '↩️ கட்ட உதைப்பு (Phase Kickback)', query: 'ஃபேஸ் கிக்பேக் (Phase Kickback) தத்துவம் என்ன?' },
      { label: '📐 S மற்றும் T வாயில்கள்', query: 'S மற்றும் T கட்ட வாயில்கள் (Phase gates) என்ன செய்கின்றன?' }
    ],
    algorithms: [
      { label: "🔑 ஷோர் அல்காரிதம்", query: "ஷோரின் அல்காரிதம் (Shor's Algorithm) எப்படி காரணியாக்குகிறது?" },
      { label: "🔍 குரோவர் தேடல்", query: "குரோவர் தேடல் (Grover's Search) எப்படி விரைவுபடுத்துகிறது?" },
      { label: '🌌 குவாண்டம் தொலைநகர்வு', query: 'குவாண்டம் டெலிபோர்ட்டேஷன் (Teleportation) நிலைகளை விளக்குக.' },
      { label: '⚖️ டாய்ச்-ஜோசா அல்காரிதம்', query: 'டாய்ச்-ஜோசா அல்காரிதம் எப்படி செயல்படுகிறது?' }
    ],
    hardware: [
      { label: '🧊 டிரான்ஸ்மான் கியூபிட்', query: 'ஐபிஎம் சூபர்கண்டக்டிங் டிரான்ஸ்மான் கியூபிட் எப்படி இயங்குகிறது?' },
      { label: '🧲 சிக்கிய அயனி கம்ப்யூட்டர்', query: 'டிராப்ட் அயான் (Trapped Ion) தொழில்நுட்பம் விளக்குக.' },
      { label: '🛡️ பிழை திருத்தம் (Surface Code)', query: 'குவாண்டம் பிழை திருத்தம் (Error Correction) எப்படி செயல்படுகிறது?' },
      { label: '🌡️ கட்ட இழப்பு (Decoherence)', query: 'டிகோஹரன்ஸ் மற்றும் T1/T2 நேரங்கள் என்றால் என்ன?' }
    ]
  },
  te: {
    foundations: [
      { label: '⚛️ క్యూబిట్ అంటే ఏమిటి?', query: 'క్యూబిట్ (Qubit) మరియు సూపర్ పొజిషన్ ఎలా పనిచేస్తాయి?' },
      { label: '🔗 క్వాంటమ్ ఎంటాంగిల్‌మెంట్', query: 'క్వాంటమ్ ఎంటాంగిల్‌మెంట్ మరియు బెల్ స్టేట్ గురించి చెప్పండి.' },
      { label: '📏 కొలత & బోర్న్ నియమం', query: 'క్వాంటమ్ మెజర్‌మెంట్ మరియు బోర్న్ నియమం (Born Rule) వివరించండి.' },
      { label: '📜 నో-క్లోనింగ్ సిద్ధాంతం', query: 'నో-క్లోనింగ్ సిద్ధాంతం (No-Cloning Theorem) అంటే ఏమిటి?' }
    ],
    gates: [
      { label: '🌀 హడమర్డ్ గేట్ (H)', query: 'హడమర్డ్ గేట్ (Hadamard) క్యూబిట్‌ను ఎలా మారుస్తుంది?' },
      { label: '⚡ పౌలీ గేట్లు (X, Y, Z)', query: 'పౌలీ X, Y, Z గేట్ల మ్యాట్రిక్స్ మరియు విధులు ఏమిటి?' },
      { label: '↩️ ఫేజ్ కిక్‌బ్యాక్', query: 'కంట్రోల్డ్ గేట్లలో ఫేజ్ కిక్‌బ్యాక్ (Phase Kickback) ఎలా పనిచేస్తుంది?' },
      { label: '📐 S మరియు T గేట్లు', query: 'S మరియు T ఫేజ్ గేట్లు ఏమి చేస్తాయి?' }
    ],
    algorithms: [
      { label: "🔑 షోర్ అల్గోరిథం", query: "షోర్ అల్గోరిథం (Shor's Algorithm) RSAని ఎలా ఛేదిస్తుంది?" },
      { label: "🔍 గ్రోవర్ సెర్చ్", query: "గ్రోవర్ సెర్చ్ (Grover's Search) వేగాన్ని ఎలా పెంచుతుంది?" },
      { label: '🌌 క్వాంటమ్ టెలిపోర్టేషన్', query: 'క్వాంటమ్ టెలిపోర్టేషన్ ప్రోటోకాల్ వివరించండి.' },
      { label: '⚖️ డ్యూచ్-జోజ్సా అల్గోరిథం', query: 'డ్యూచ్-జోజ్సా అల్గోరిథం 1 క్వెరీతో ఫంక్షన్‌ను ఎలా గుర్తిస్తుంది?' }
    ],
    hardware: [
      { label: '🧊 ట్రాన్స్‌మోన్ క్యూబిట్', query: 'సూపర్ కండక్టింగ్ ట్రాన్స్‌మోన్ క్యూబిట్‌లు ఎలా పనిచేస్తాయి?' },
      { label: '🧲 ట్రాప్డ్ అయాన్ కంప్యూటర్', query: 'ట్రాప్డ్ అయాన్ క్వాంటమ్ కంప్యూటర్ విధానం వివరించండి.' },
      { label: '🛡️ లోప సవరణ (Surface Code)', query: 'క్వాంటమ్ లోప సవరణ (Error Correction) ఎలా జరుగుతుంది?' },
      { label: '🌡️ డీకోహెరెన్స్ (T1/T2)', query: 'క్వాంటమ్ డీకోహెరెన్స్ మరియు T1/T2 సమయం అంటే ఏమిటి?' }
    ]
  },
  bn: {
    foundations: [
      { label: '⚛️ কিউবিট কি?', query: 'কিউবিট (Qubit) এবং সুপারপজিশন কিভাবে কাজ করে?' },
      { label: '🔗 কোয়ান্টাম এন্ট্যাঙ্গেলমেন্ট', query: 'কোয়ান্টাম এন্ট্যাঙ্গেলমেন্ট এবং বেল স্টেট (Bell state) কি?' },
      { label: '📏 পরিমাপ ও বর্ন নীতি', query: 'কোয়ান্টাম পরিমাপ এবং বর্নের নীতি (Born Rule) ব্যাখ্যা করুন।' },
      { label: '📜 নো-ক্লোনিং উপপাদ্য', query: 'নো-ক্লোনিং উপপাদ্য (No-Cloning Theorem) কেন গুরুত্বপূর্ণ?' }
    ],
    gates: [
      { label: '🌀 হ্যাডামার্ড গেট (H)', query: 'হ্যাডামার্ড গেট (Hadamard) কিভাবে অবস্থান ঘোরায়?' },
      { label: '⚡ পাউলি গেট (X, Y, Z)', query: 'পাউলি X, Y এবং Z গেট ম্যাট্রিক্স সহ বুঝিয়ে বলুন।' },
      { label: '↩️ ফেজ কিকব্যাক', query: 'নিয়ন্ত্রিত গেটে ফেজ কিকব্যাক (Phase Kickback) কিভাবে ঘটে?' },
      { label: '📐 S ও T গেট', query: 'S এবং T ফেজ গেট কি করে?' }
    ],
    algorithms: [
      { label: "🔑 শোরের অ্যালগরিদম", query: "শোরের অ্যালগরিদম (Shor's Algorithm) কিভাবে RSA ভাঙে?" },
      { label: "🔍 গ্রোভারের অনুসন্ধান", query: "গ্রোভারের সার্চ (Grover's Search) কিভাবে গতি বাড়ায়?" },
      { label: '🌌 কোয়ান্টাম টেলিপোর্টেশন', query: 'কোয়ান্টাম টেলিপোর্টেশন প্রক্রিয়াটি ধাপে ধাপে বর্ণনা করুন।' },
      { label: '⚖️ ডয়েচ-জোজসা অ্যালগরিদম', query: 'ডয়েচ-জোজসা অ্যালগরিদম ১টি অনুসন্ধানে কিভাবে কাজ করে?' }
    ],
    hardware: [
      { label: '🧊 ট্রান্সমন কিউবিট', query: 'সুপারকন্ডাক্টিং ট্রান্সমন কিউবিট কিভাবে তৈরি হয়?' },
      { label: '🧲 ট্র্যাপড আয়ন কম্পিউটার', query: 'ট্র্যাপড আয়ন কোয়ান্টাম কম্পিউটিং ব্যাখ্যা করুন।' },
      { label: '🛡️ সারফেস কোড ত্রুটি সংশোধন', query: 'সারফেস কোড (Surface Code) কিভাবে কিউবিটকে রক্ষা করে?' },
      { label: '🌡️ ডিকোহেরেন্স (T1/T2)', query: 'কোয়ান্টাম ডিকোহেরেন্স ও ফেজ ধ্বংস কি?' }
    ]
  }
};

const WELCOME_MESSAGES: Record<SupportedLanguage, string> = {
  en: "Welcome to your AI Quantum Mentor! I have comprehensive knowledge across all quantum computing domains: unitary gates, linear algebra, entanglement, algorithms (Shor, Grover, Deutsch-Jozsa, Teleportation), quantum hardware, and error correction.\n\nAsk me anything or click one of the quick inquiry topics below!",
  hi: "क्वांटम माइंड एआई मेंटर (AI Quantum Mentor) में आपका स्वागत है!\n\nमैं क्वांटम भौतिकी, यूनिटरी गेट्स (Unitary Gates), सुपरपोजिशन, एंटैंगलमेंट, शोर और ग्रोवर एल्गोरिदम, तथा क्वांटम हार्डवेयर के सभी प्रश्नों का हिंदी में उत्तर देने के लिए तैयार हूँ।\n\nकोई भी प्रश्न पूछें या नीचे दिए गए त्वरित विषयों पर क्लिक करें!",
  ta: "வணக்கம்! குவாண்டம் மைண்ட் செயற்கை நுண்ணறிவு வழிகாட்டிக்கு (AI Quantum Mentor) வரவேற்கிறோம்!\n\nகியூபிட்கள் (Qubits), மேற்பொருந்துதல் (Superposition), குவாண்டம் பிணைப்பு (Entanglement), மற்றும் குவாண்டம் வழிமுறைகள் பற்றிய அனைத்து கேள்விகளுக்கும் தமிழில் விளக்கம் தருகிறேன்.\n\nஉங்கள் கேள்வியை தட்டச்சு செய்யவும் அல்லது கீழேயுள்ள தலைப்புகளில் ஒன்றை தேர்வு செய்யவும்!",
  te: "క్వాంటమ్ మైండ్ AI మెంటార్‌కు స్వాగతం!\n\nక్యూబిట్‌లు (Qubits), సూపర్ పొజిషన్, క్వాంటమ్ ఎంటాంగిల్‌మెంట్, గేట్లు మరియు అల్గోరిథంల గురించిన మీ సందేహాలకు తెలుగులో వివరణలు ఇస్తాను.\n\nఏదైనా ప్రశ్న అడగండి లేదా దిగువన ఉన్న అంశాలను ఎంచుకోండి!",
  bn: "কোয়ান্টাম মাইন্ড এআই মেন্টরে (AI Quantum Mentor) আপনাকে স্বাগতম!\n\nআমি কিউবিট, সুপারপজিশন, কোয়ান্টাম এন্ট্যাঙ্গেলমেন্ট, ইউনিটারি গেট এবং অ্যালগরিদম সম্পর্কিত আপনার সমস্ত প্রশ্নের উত্তর বাংলায় দিতে প্রস্তুত।\n\nযেকোনো প্রশ্ন লিখুন বা নিচের বিষয়গুলি থেকে একটি নির্বাচন করুন!"
};

const CATEGORY_NAMES: Record<SupportedLanguage, Record<string, string>> = {
  en: { foundations: '1. Foundations', gates: '2. Gate Mechanics', algorithms: '3. Algorithms', hardware: '4. Hardware & Noise' },
  hi: { foundations: '1. बुनियादी सिद्धांत', gates: '2. क्वांटम गेट्स', algorithms: '3. एल्गोरिदम', hardware: '4. हार्डवेयर और एरर' },
  ta: { foundations: '1. அடிப்படைகள்', gates: '2. வாயில்கள்', algorithms: '3. வழிமுறைகள்', hardware: '4. வன்பொருள் & பிழை' },
  te: { foundations: '1. ప్రాథమిక అంశాలు', gates: '2. క్వాంటమ్ గేట్లు', algorithms: '3. అల్గోరిథంలు', hardware: '4. హార్డ్‌వేర్ & నాయిస్' },
  bn: { foundations: '1. মৌলিক ধারণা', gates: '2. গেট মেকানিক্স', algorithms: '3. অ্যালগরিদম', hardware: '4. হার্ডওয়্যার ও ত্রুটি' }
};

export const AiMentorPanel: React.FC<AiMentorPanelProps> = ({
  currentStepIndex,
  gates,
  currentState,
  numQubits
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeCategory, setActiveCategory] = useState<'foundations' | 'gates' | 'algorithms' | 'hardware'>('foundations');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      content: WELCOME_MESSAGES.en,
      timestamp: 'Now',
      topicTag: 'Quantum Knowledge Core'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    sounds.playClick();
    setLanguage(newLang);
    // Add language switch announcement
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === newLang);
    setMessages(prev => [
      ...prev,
      {
        id: `lang_${Date.now()}`,
        sender: 'ai',
        content: WELCOME_MESSAGES[newLang],
        timestamp: 'Just now',
        topicTag: `${langObj?.label} Activated`
      }
    ]);
  };

  const handleSend = async (text?: string) => {
    const query = (text || input).trim();
    if (!query) return;

    sounds.playClick();
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput('');
    setIsTyping(true);

    try {
      const { askMentorBackend } = await import('../../services/api');
      const backendAnswer = await askMentorBackend({
        question: query,
        language,
        student_level: 'intermediate',
        circuit_context: `Active qubits: ${numQubits}, gates: ${gates.length}, state: ${currentState.diracRepresentation}`,
        current_concept: activeCategory,
      });

      if (backendAnswer) {
        sounds.playSimulate();
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            content: backendAnswer,
            timestamp: 'Just now',
            topicTag: 'Gemini AI Core',
          }
        ]);
        return;
      }
    } catch {
      // Fallback to local quantum engine
    }

    setTimeout(() => {
      sounds.playSimulate();
      const response = answerQuantumQuery(query, gates, currentState, numQubits, currentStepIndex, language);
      setIsTyping(false);
      setMessages(prev => [...prev, response]);
    }, 350);
  };

  /**
   * Multilingual Encyclopedic Quantum Knowledge Reasoning Engine
   */
  const answerQuantumQuery = (
    query: string,
    allGates: CircuitGate[],
    state: QuantumState,
    qubitsCount: number,
    step: number,
    lang: SupportedLanguage
  ): Message => {
    const q = query.toLowerCase();

    // 1. ACTIVE CIRCUIT INSPECTION & DIAGNOSTICS
    if (q.includes('circuit') || q.includes('सर्किट') || q.includes('சர்க்யூட்') || q.includes('సర్క్యూట్') || q.includes('সার্কিট') || q.includes('analyze') || q.includes('state')) {
      const hasH = allGates.some(g => g.type === 'H');
      const hasCnot = allGates.some(g => g.type === 'CNOT');

      if (lang === 'hi') {
        let text = `### रीयल-टाइम क्वांटम सर्किट डायग्नोस्टिक (हिंदी):\n\n`;
        text += `• **क्युबिट्स की संख्या**: ${qubitsCount} क्युबिट्स और कुल ${allGates.length} ऑपरेशन्स।\n`;
        text += `• **वर्तमान स्टेटवेक्टर**: |ψ⟩ = ${state.diracRepresentation}\n`;
        text += `• **एंटैंगलमेंट (Entanglement)**: ${state.isEntangled ? '✅ गैर-स्थानीय एंटैंगलमेंट सक्रिय है (Non-Local Entangled State)!' : 'सेपरेबल प्रोडक्ट स्टेट (Separable state).'}\n\n`;
        if (hasH && hasCnot) {
          text += `**पैटर्न विश्लेषण**: आप बेल-स्टेट (Bell state) जनरेटर पैटर्न (Hadamard + CNOT) का उपयोग कर रहे हैं। यह क्वांटम सुपरपोजिशन को नॉन-लोकल कोरिलेशन में बदलता है!`;
        }
        return { id: `ai_${Date.now()}`, sender: 'ai', content: text, timestamp: 'Just now', topicTag: 'सर्किट विश्लेषण', mathFormula: `|\\psi\\rangle = ${state.diracRepresentation}` };
      }

      if (lang === 'ta') {
        let text = `### நேரடி குவாண்டம் சர்க்யூட் பகுப்பாய்வு (தமிழ்):\n\n`;
        text += `• **கியூபிட்கள் எண்ணிக்கை**: ${qubitsCount} கியூபிட்கள் மற்றும் ${allGates.length} செயல்பாடுகள்.\n`;
        text += `• **தற்போதைய குவாண்டம் நிலை**: |ψ⟩ = ${state.diracRepresentation}\n`;
        text += `• **குவாண்டம் பிணைப்பு**: ${state.isEntangled ? '✅ முழுமையான குவாண்டம் பிணைப்பு (Entangled State)!' : 'பிரிக்கக்கூடிய நிலை (Separable State).'}\n\n`;
        if (hasH && hasCnot) {
          text += `**வடிவமைப்பு**: ஹடமார்ட் (H) மற்றும் CNOT வாயில்களை இணைத்து புகழ்பெற்ற பெல் நிலை (Bell Pair) உருவாக்குகிறீர்கள்!`;
        }
        return { id: `ai_${Date.now()}`, sender: 'ai', content: text, timestamp: 'Just now', topicTag: 'சர்க்யூட் பகுப்பாய்வு', mathFormula: `|\\psi\\rangle = ${state.diracRepresentation}` };
      }

      if (lang === 'te') {
        let text = `### రియల్-టైమ్ క్వాంటమ్ సర్క్యూట్ విశ్లేషణ (తెలుగు):\n\n`;
        text += `• **క్యూబిట్‌లు**: ${qubitsCount} క్యూబిట్‌లు మరియు ${allGates.length} ఆపరేషన్‌లు.\n`;
        text += `• **ప్రస్తుత స్థితి**: |ψ⟩ = ${state.diracRepresentation}\n`;
        text += `• **ఎంటాంగిల్‌మెంట్**: ${state.isEntangled ? '✅ క్వాంటమ్ ఎంటాంగిల్‌మెంట్ ఏర్పడింది!' : 'విభజించదగిన సాధారణ స్థితి.'}\n\n`;
        return { id: `ai_${Date.now()}`, sender: 'ai', content: text, timestamp: 'Just now', topicTag: 'సర్క్యూట్ విశ్లేషణ', mathFormula: `|\\psi\\rangle = ${state.diracRepresentation}` };
      }

      if (lang === 'bn') {
        let text = `### রিয়েল-টাইম কোয়ান্টাম সার্কিট বিশ্লেষণ (বাংলা):\n\n`;
        text += `• **কিউবিট সংখ্যা**: ${qubitsCount} টি কিউবিট এবং ${allGates.length} টি অপারেশন।\n`;
        text += `• **বর্তমান স্টেটভেক্টর**: |ψ⟩ = ${state.diracRepresentation}\n`;
        text += `• **এন্ট্যাঙ্গেলমেন্ট**: ${state.isEntangled ? '✅ নন-লোকাল কোয়ান্টাম এন্ট্যাঙ্গেলমেন্ট তৈরি হয়েছে!' : 'পৃথকযোগ্য সাধারণ অবস্থা।'}\n\n`;
        return { id: `ai_${Date.now()}`, sender: 'ai', content: text, timestamp: 'Just now', topicTag: 'সার্কিট বিশ্লেষণ', mathFormula: `|\\psi\\rangle = ${state.diracRepresentation}` };
      }

      // English Default
      let analysis = `### Real-Time Quantum Circuit Diagnostic:\n\n`;
      analysis += `• **Architecture**: ${qubitsCount} Qubits with ${allGates.length} operations placed.\n`;
      analysis += `• **Current Statevector**: |ψ⟩ = ${state.diracRepresentation}\n`;
      analysis += `• **Entanglement**: ${state.isEntangled ? '✅ Maximally Entangled (Non-separable state across subsystems).' : 'Separable product state.'}\n\n`;

      if (hasH && hasCnot) {
        analysis += `**Circuit Pattern**: You are employing the canonical Bell entangling pair pattern (Hadamard + CNOT), generating non-local quantum correlations!`;
      } else if (!hasH && hasCnot) {
        analysis += `**Optimization Note**: You have a CNOT gate without prior superposition on the control qubit. If control is always |0⟩, CNOT does nothing!`;
      }

      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        content: analysis,
        timestamp: 'Just now',
        topicTag: 'Circuit Diagnostic',
        mathFormula: `|ψ⟩ = ${state.diracRepresentation}`
      };
    }

    // 2. SHOR'S ALGORITHM
    if (q.includes('shor') || q.includes('शोर') || q.includes('ஷோர்') || q.includes('షోర్') || q.includes('শোর')) {
      if (lang === 'hi') {
        return {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          content: `### शोर का एल्गोरिदम (Shor's Algorithm)\n\nपीटर शोर द्वारा 1994 में खोजा गया यह एल्गोरिदम बड़े पूर्णांकों का अभाज्य गुणनखंडन (Prime Factorization) पॉलीनोमियल समय $O((\\log N)^3)$ में करता है।\n\n• **मुख्य सिद्धांत**: यह फैक्टरिंग समस्या को क्वांटम फेज़ एस्टिमेशन (QPE) और क्वांटम फूरियर ट्रांसफॉर्म (QFT) के जरिए ऑर्डर-फाइंडिंग (Order Finding) समस्या में बदल देता है।\n• **प्रभाव**: यह RSA 2048-बिट एन्क्रिप्शन को आसानी से तोड़ सकता है, जिसके लिए पोस्ट-क्वांटम क्रिप्टोग्राफी (PQC) की आवश्यकता है।`,
          timestamp: 'Just now',
          topicTag: 'शोर एल्गोरिदम',
          mathFormula: 'f(x) = a^x \\pmod N'
        };
      }
      if (lang === 'ta') {
        return {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          content: `### ஷோரின் அல்காரிதம் (Shor's Algorithm)\n\nபெரிய எண்களின் பகா காரணியாக்கத்தை (Prime Factorization) மிக விரைவாக பல்லுறுப்புக் கோவைக் காலத்தில் (Polynomial time) தீர்க்கும் புரட்சிகரமான வழிமுறை.\n\n• **குவாண்டம் வேகம்**: குவாண்டம் ஃபோரியர் உருமாற்றம் (QFT) மூலம் கால இடைவெளியைக் கண்டறிந்து (Period finding) RSA மறைகுறியீட்டை உடைக்க முடியும்.`,
          timestamp: 'Just now',
          topicTag: 'ஷோர் வழிமுறை'
        };
      }
      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        content: `### Shor's Factoring Algorithm (1994)\n\nShor's algorithm solves integer factorization in polynomial time $O((\\log N)^3)$, exponentially outperforming the classical General Number Field Sieve.\n\n**Core Quantum Subroutine**: Reduces factoring $N = p \\cdot q$ to modular order-finding: finding the period $r$ of $f(x) = a^x \\pmod N$. Quantum Fourier Transform (QFT) extracts the period in a single coherent measurement.\n\n**Cybersecurity Impact**: Renders classical RSA-2048 and ECC vulnerable, driving the NIST global transition to Post-Quantum Cryptography (PQC).`,
        timestamp: 'Just now',
        topicTag: "Shor's Algorithm",
        mathFormula: 'f(x) = a^x \\pmod N, \\quad QFT|k\\rangle = \\frac{1}{\\sqrt{N}}\\sum_{j=0}^{N-1} e^{2\\pi i j k / N} |j\\rangle'
      };
    }

    // 3. GROVER'S SEARCH
    if (q.includes('grover') || q.includes('ग्रोवर') || q.includes('குரோவர்') || q.includes('గ్రోవర్') || q.includes('গ্রোভার')) {
      if (lang === 'hi') {
        return {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          content: `### ग्रोवर का सर्च एल्गोरिदम (Grover's Algorithm)\n\nअसंरचित डेटाबेस में $N$ तत्वों के बीच सर्च करने के लिए क्लासिकल कंप्यूटर को $O(N)$ समय लगता है, जबकि ग्रोवर का क्वांटम एल्गोरिदम इसे केवल $O(\\sqrt{N})$ में हल करता है!\n\n• **ओरेकल (Oracle)**: लक्षित अवस्था के फेज़ को -1 से गुणा करता है।\n• **डिफ्यूजन ऑपरेटर (Diffusion)**: औसत आयाम के सापेक्ष परावर्तन (Inversion about average) करके सही उत्तर की प्रायिकता को बढ़ा देता है।`,
          timestamp: 'Just now',
          topicTag: 'ग्रोवर सर्च',
          mathFormula: 'O(\\sqrt{N}) \\text{ iterations}'
        };
      }
      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        content: `### Grover's Quantum Amplitude Amplification (1996)\n\nSearches an unsorted database of $N$ items in $O(\\sqrt{N})$ iterations instead of classical $O(N)$ brute-force, providing a proven quadratic speedup.\n\n**Iterative Protocol**:\n1. Initialize uniform superposition: $|s\\rangle = H^{\\otimes n}|0\\rangle$.\n2. **Phase Oracle $U_w$**: Inverts the phase of the target marked state: $|w\\rangle \\to -|w\\rangle$.\n3. **Grover Diffusion Operator $U_s$**: Performs inversion-about-the-average: $2|s\\rangle\\langle s| - I$.\n4. Repeat $\\approx \\frac{\\pi}{4}\\sqrt{N}$ times, rotating the statevector toward the target with near 100% measurement probability.`,
        timestamp: 'Just now',
        topicTag: "Grover's Search",
        mathFormula: 'G = (2|s\\rangle\\langle s| - I) U_w, \\quad R \\approx \\frac{\\pi}{4}\\sqrt{N}'
      };
    }

    // 4. GENERAL FALLBACK SYNTHESIS
    if (lang === 'hi') {
      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        content: `### क्वांटम परामर्श ("${query}"):\n\nक्वांटम यांत्रिकी में सभी संक्रियाएं यूनिटरी मैट्रिक्स $U$ ($U^\\dagger U = I$) द्वारा नियंत्रित होती हैं, जिससे कुल प्रायिकता 1 (100%) बनी रहती है।\n\nवर्तमान में आपके सर्किट में ${qubitsCount} क्युबिट्स हैं और स्टेटवेक्टर: |ψ⟩ = ${state.diracRepresentation} है।\n\nआप मुझसे हैडामार्ड, पॉली गेट्स, शोर और ग्रोवर एल्गोरिदम, या क्वांटम हार्डवेयर के बारे में हिंदी में कुछ भी पूछ सकते हैं!`,
        timestamp: 'Just now',
        topicTag: 'क्वांटम सिद्धांत'
      };
    }

    if (lang === 'ta') {
      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        content: `### குவாண்டம் வழிகாட்டல் ("${query}"):\n\nகுவாண்டம் அமைப்புகளில் அனைத்து மாற்றங்களும் யூனிட்டரி பரிமாற்றங்கள் ($U^\\dagger U = I$) மூலம் நிகழ்கின்றன. நிகழ்தகவு எப்போதும் 1 ஆக இருக்கும்.\n\nதற்போது உங்கள் சர்க்யூட்டில் ${qubitsCount} கியூபிட்கள் உள்ளன. நிலை: |ψ⟩ = ${state.diracRepresentation}.\n\nஹடமார்ட் வாயில், பாலி மேட்ரிக்ஸ், அல்லது ஷோர் வழிமுறை பற்றி தமிழில் மேலும் விளக்கம் பெறலாம்!`,
        timestamp: 'Just now',
        topicTag: 'குவாண்டம் தத்துவம்'
      };
    }

    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      content: `### Quantum Consultation on "${query}":\n\nIn quantum mechanics, all operations are governed by unitary transformations U (where U†U = I) preserving the L2 probability norm ||ψ||² = 1.\n\nCurrently, your active circuit has ${qubitsCount} qubits with statevector: |ψ⟩ = ${state.diracRepresentation}.\n\nYou can ask me for detailed mathematical proofs, circuit designs, or algorithmic walkthroughs for Shor's, Grover's, Teleportation, Bell pairs, or hardware implementations!`,
      timestamp: 'Just now',
      topicTag: 'Quantum Principles'
    };
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      {/* Top Header with Regional Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#0f62fe] flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">AI Quantum Mentor</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Multilingual
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Universal quantum knowledge base & real-time circuit reasoning</p>
          </div>
        </div>

        {/* Regional Language Toggle Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <Globe2 className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                language === l.code
                  ? 'bg-white text-[#0f62fe] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={`Switch language to ${l.label}`}
            >
              <span>{l.flag}</span>
              <span className="ml-1">{l.nativeLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Active Circuit Diagnostic Action */}
      <div className="flex items-center justify-between pt-3 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['foundations', 'gates', 'algorithms', 'hardware'] as const).map((catKey) => (
            <button
              key={catKey}
              onClick={() => { sounds.playClick(); setActiveCategory(catKey); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer text-xs shrink-0 ${
                activeCategory === catKey
                  ? 'bg-[#0f62fe] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {CATEGORY_NAMES[language]?.[catKey] || CATEGORY_NAMES.en[catKey]}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleSend(language === 'hi' ? 'मेरे सक्रिय सर्किट का विश्लेषण करें' : 'Analyze my active circuit')}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f62fe] border border-blue-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'सर्किट डायग्नोस्टिक' : 'Analyze Active Circuit'}</span>
        </button>
      </div>

      {/* Category Specific Prompts in Selected Regional Language */}
      <div className="flex items-center gap-2 py-2 overflow-x-auto text-xs">
        {(CATEGORY_PROMPTS_I18N[language]?.[activeCategory] || CATEGORY_PROMPTS_I18N.en[activeCategory])?.map((p) => (
          <button
            key={p.label}
            onClick={() => handleSend(p.query)}
            className="px-3 py-1 rounded-full bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 shrink-0 font-medium transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[420px] p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col text-xs leading-relaxed max-w-[92%] rounded-xl p-3.5 shadow-xs ${
              m.sender === 'ai'
                ? 'self-start bg-white border border-slate-200 text-slate-800'
                : 'self-end bg-[#0f62fe] text-white'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 pb-1 border-b border-slate-100">
              <span className={m.sender === 'ai' ? 'text-[#0f62fe] font-bold' : 'text-blue-100 font-bold'}>
                {m.sender === 'ai' ? 'Quantum Mentor' : 'You'}
              </span>
              {m.topicTag && (
                <span className="text-slate-400 font-semibold">{m.topicTag}</span>
              )}
            </div>

            <p className="whitespace-pre-line text-xs leading-relaxed font-sans">{m.content}</p>

            {m.mathFormula && (
              <div className="mt-2.5 p-2 rounded bg-slate-100 border border-slate-200 text-[#0f62fe] font-mono text-xs font-semibold">
                {m.mathFormula}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="self-start bg-white border border-slate-200 text-slate-600 text-xs p-3 rounded-xl flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0f62fe] animate-pulse" />
            <span className="font-mono">Synthesizing quantum derivation...</span>
          </div>
        )}
      </div>

      {/* Input Message Bar */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-200 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={
            language === 'hi'
              ? 'क्वांटम प्रश्न पूछें (उदा. "हैडामार्ड क्या करता है?")...'
              : language === 'ta'
              ? 'குவாண்டம் கேள்வி கேளுங்கள் (उदा. "கியூபிட் என்றால் என்ன?")...'
              : 'Ask a quantum question (e.g., "Why does CNOT create entanglement?")...'
          }
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0f62fe] shadow-xs"
        />

        <button
          onClick={() => handleSend()}
          className="px-4 py-2.5 bg-[#0f62fe] hover:bg-[#0353e9] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
