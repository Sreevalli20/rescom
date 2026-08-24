/**
 * AI Voice Sales Agent - Mock Telephony & Speech Simulation Engine
 * Provides realistic outbound calling, natural multi-lingual dialogue (Telugu, Hindi, English),
 * live transcript streaming, dynamic qualification updates, WhatsApp trigger, and callback scheduling.
 */

import {
  CallAction,
  CallRecord,
  CallStatus,
  CallSummary,
  CallbackData,
  LeadStatus,
  QualificationData,
  StartCallPayload,
  StartCallResponse,
  TranscriptMessage,
} from '../types';

export interface ScenarioStep {
  delayMs: number;
  status: CallStatus;
  aiGoal?: string;
  transcript?: Omit<TranscriptMessage, 'id'>;
  qualificationPatch?: Partial<QualificationData>;
  actionTrigger?: Omit<CallAction, 'id'>;
  callbackPatch?: Partial<CallbackData>;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  phoneNumber: string;
  customerName: string;
  language: string;
  leadTarget: LeadStatus;
  description: string;
  steps: ScenarioStep[];
  finalSummary: Omit<CallSummary, 'id' | 'callId' | 'generatedAt'>;
}

export const MOCK_SCENARIOS: Record<string, ScenarioConfig> = {
  telugu_hot: {
    id: 'telugu_hot',
    name: 'Telugu Boutique Owner (HOT Lead)',
    phoneNumber: '+91 98490 12345',
    customerName: 'Lakshmi Devi (Hyderabad Sarees)',
    language: 'Telugu',
    leadTarget: 'HOT',
    description: 'High intent boutique owner ready to launch online store before festive season with ₹35k budget.',
    steps: [
      {
        delayMs: 1500,
        status: 'calling',
        aiGoal: 'Dialing outbound via Exotel Telephony SIP Gateway...',
      },
      {
        delayMs: 3500,
        status: 'ringing',
        aiGoal: 'Ringing customer terminal (+91 98490 12345)...',
      },
      {
        delayMs: 6000,
        status: 'connected',
        aiGoal: 'Call answered. Engaging in Telugu with e-commerce value proposition.',
        actionTrigger: {
          type: 'outbound_initiated',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Exotel Call Connected',
          description: 'SIP Call SID #EXO-994821 established with Hyderabad telecom circle.',
        },
      },
      {
        delayMs: 8000,
        status: 'speaking',
        aiGoal: 'Greeting customer & introducing custom online store proposition in Telugu',
        transcript: {
          speaker: 'ai',
          text: 'నమస్కారం అండి! నేను AI వెబ్ సొల్యూషన్స్ నుండి మాట్లాడుతున్నాను. మీ బూటీక్ చీరలు మరియు డ్రెస్సెస్ కోసం ఒక అందమైన ఈ-కామర్స్ వెబ్‌సైట్ మరియు ఆన్‌లైన్ పేమెంట్ సెటప్ గురించి మాట్లాడుతున్నాను. మీరు ఆన్‌లైన్‌లో అమ్మకాలు ప్రారంభించాలనుకుంటున్నారా?',
          translation: 'Namaskaram! I am speaking from AI Web Solutions. We build custom e-commerce stores with online payments for boutique sarees & dresses. Would you be interested in expanding your sales online?',
          timestamp: '00:08',
          language: 'Telugu',
        },
        actionTrigger: {
          type: 'language_detected',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Language Detected: Telugu',
          description: 'Speech recognition switched to Telugu acoustic & translation model.',
        },
      },
      {
        delayMs: 14000,
        status: 'listening',
        aiGoal: 'Listening to customer business background and current sales channels',
        transcript: {
          speaker: 'customer',
          text: 'అవునండి, ప్రస్తుతం ఇన్‌స్టాగ్రామ్ మరియు వాట్సాప్‌లో ఆర్డర్స్ తీసుకుంటున్నాము. కానీ ఆర్డర్ మేనేజ్‌మెంట్ కష్టంగా ఉంది. వెబ్‌సైట్ అయితే బాగుంటుంది.',
          translation: 'Yes, currently we take orders on Instagram and WhatsApp. But managing orders is difficult. Having our own website would be great.',
          timestamp: '00:14',
          language: 'Telugu',
        },
        qualificationPatch: {
          products: 'Handloom Sarees, Designer Kurtis, Bridal Wear',
          decisionMaker: 'Known',
          buyingIntent: 'High',
          leadScore: 65,
        },
      },
      {
        delayMs: 19000,
        status: 'speaking',
        aiGoal: 'Probing catalog volume and desired store features',
        transcript: {
          speaker: 'ai',
          text: 'చాలా మంచిదండి! మా సిస్టమ్‌లో వాట్సాప్ మరియు వెబ్‌సైట్ డైరెక్ట్ ఆర్డర్ సింక్ ఉంటుంది. మీ దగ్గర ప్రస్తుతం ఎన్ని రకాల చీరలు మరియు ప్రొడక్ట్స్ ఉన్నాయి? ఇంకా ఆన్‌లైన్ UPI పేమెంట్ గేట్‌వే అవసరమా?',
          translation: 'That is great! Our system includes direct WhatsApp & website order sync. How many saree varieties do you currently stock, and do you need online UPI payment gateways?',
          timestamp: '00:19',
          language: 'Telugu',
        },
      },
      {
        delayMs: 25000,
        status: 'listening',
        aiGoal: 'Extracting product SKU count, budget range, and timeline expectations',
        transcript: {
          speaker: 'customer',
          text: 'మా దగ్గర దాదాపు 120 నుండి 150 డిజైన్స్ ఉన్నాయి. ఆన్‌లైన్ పేమెంట్, కస్టమర్‌కి ట్రాకింగ్ SMS ఉండాలి. వచ్చే ఉగాది పండుగ లోపు అంటే 10 రోజుల్లో కావాలి. బడ్జెట్ 30,000 నుండి 35,000 దాకా పెట్టుకోగలను.',
          translation: 'We have around 120 to 150 designs. We need online UPI payment and tracking SMS for customers. We need it in 10 days before Ugadi festival. Budget is ₹30,000 to ₹35,000.',
          timestamp: '00:25',
          language: 'Telugu',
        },
        qualificationPatch: {
          leadStatus: 'HOT',
          budget: '₹30,000 - ₹35,000',
          productCount: '~120-150 SKUs',
          timeline: 'Within 10 days (Festive rush)',
          features: ['Razorpay UPI/Cards', 'Automated Courier Tracking', 'WhatsApp Catalog Sync', 'Mobile Fast Checkout'],
          barrier: 'None (Needs urgent delivery before Ugadi)',
          leadScore: 94,
        },
        actionTrigger: {
          type: 'lead_classified',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Lead Classified: HOT (Score 94/100)',
          description: 'High purchase intent, explicit budget confirmed, urgent 10-day timeline.',
        },
      },
      {
        delayMs: 31000,
        status: 'speaking',
        aiGoal: 'Confirming technical fit and triggering instant WhatsApp quote link',
        transcript: {
          speaker: 'ai',
          text: 'ఖచ్చితంగా 7 రోజుల్లో డెలివరీ చేయగలం అండి! మీ బడ్జెట్ లోనే ప్రీమియం మొబైల్ స్టోర్ మరియు వాట్సాప్ ఇంటిగ్రేషన్ పూర్తి చేసి ఇస్తాము. నేను ఇప్పుడే మీ వాట్సాప్‌కి డెమో స్టోర్ లింక్ మరియు కొటేషన్ పంపుతున్నాను. ఒకసారి చూస్తారా?',
          translation: 'We can definitely deliver within 7 days! Within your budget, we will deliver a premium mobile store with full WhatsApp integration. I am sending the demo store link and quotation to your WhatsApp right now. Would you check it?',
          timestamp: '00:31',
          language: 'Telugu',
        },
        actionTrigger: {
          type: 'whatsapp_sent',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'WhatsApp Catalog & Quotation Sent',
          description: 'Sent live interactive demo link + Festive Package PDF (₹35,000) to +91 98490 12345.',
          payloadSnippet: 'Template: ecommerce_boutique_quote_v2 | Status: Delivered',
        },
      },
      {
        delayMs: 37000,
        status: 'listening',
        aiGoal: 'Closing the loop and agreeing on next onboarding step',
        transcript: {
          speaker: 'customer',
          text: 'సరే అండి, వాట్సాప్ చూసి ఇప్పుడే నా కొడుకుతో కలిసి చెక్ చేస్తాను. డెమో బాగుంటే ఇవాళ సాయంత్రానికే అడ్వాన్స్ ఇస్తాను.',
          translation: 'Sure! I will check the WhatsApp message with my son right away. If the demo looks good, I will transfer the advance today evening.',
          timestamp: '00:37',
          language: 'Telugu',
        },
      },
      {
        delayMs: 42000,
        status: 'speaking',
        aiGoal: 'Concluding call professionally with dedicated tech executive assigned',
        transcript: {
          speaker: 'ai',
          text: 'ధన్యవాదాలు లక్ష్మి గారు! మా సీనియర్ వెబ్ డెవలపర్ సాయంత్రం 5 గంటలకు మిమ్మల్ని సంప్రదిస్తారు. హావ్ ఏ గ్రేట్ డే!',
          translation: 'Thank you Lakshmi garu! Our senior web developer will connect with you at 5:00 PM. Have a wonderful day!',
          timestamp: '00:42',
          language: 'Telugu',
        },
        callbackPatch: {
          requested: true,
          originalText: 'సాయంత్రం 5 గంటలకు మాట్లాడతాను (Talk to me at 5:00 PM this evening)',
          requestedTime: 'Today evening at 5:00 PM',
          parsedDateTime: 'Today, 5:00 PM IST',
          status: 'scheduled',
          notes: 'Customer requested follow-up after checking WhatsApp demo link with son.',
        },
        actionTrigger: {
          type: 'callback_scheduled',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Follow-up Call Scheduled',
          description: 'Scheduled for Today at 5:00 PM IST with Senior Solutions Architect.',
        },
      },
      {
        delayMs: 46000,
        status: 'completed',
        aiGoal: 'Call completed successfully. Generating executive AI sales synthesis.',
        actionTrigger: {
          type: 'followup_prepared',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Post-Call AI Summary Prepared',
          description: 'CRM lead card generated, Slack notification dispatched to Sales Engineering team.',
        },
      },
    ],
    finalSummary: {
      phoneNumber: '+91 98490 12345',
      customerName: 'Lakshmi Devi (Hyderabad Sarees)',
      language: 'Telugu',
      leadStatus: 'HOT',
      whatTheyWant: 'A custom, mobile-optimized boutique e-commerce web store to eliminate manual Instagram/WhatsApp DM order friction and scale festive sales.',
      budget: '₹30,000 - ₹35,000',
      products: 'Handloom Designer Sarees, Silk Kurtis, Bridal Lehengas',
      productCount: '~120-150 SKUs',
      timeline: 'Urgent: Within 7-10 days before Ugadi festive rush',
      features: [
        'Razorpay Instant UPI & Card Gateway',
        'Direct WhatsApp Order Notification & Sync',
        'Automated Courier Shipping Status SMS',
        'Mobile-first responsive catalog with instant filters',
      ],
      customerConcerns: 'Managing large volume of manual orders during festive season; needs reassurance of fast 7-day turnaround.',
      nextAction: 'Senior engineer to call at 5:00 PM IST today to demonstrate live checkout flow, finalize payment gateway KYC, and collect advance deposit.',
      importantStatements: [
        '"ప్రస్తుతం ఇన్‌స్టాగ్రామ్ మరియు వాట్సాప్‌లో ఆర్డర్స్ తీసుకోవడం కష్టంగా ఉంది" (Managing manual IG/WhatsApp orders is difficult)',
        '"బడ్జెట్ 30,000 నుండి 35,000 దాకా పెట్టుకోగలను, ఉగాది లోపు కావాలి" (Budget is ₹30k-₹35k, must launch before Ugadi)',
        '"డెమో బాగుంటే ఇవాళ సాయంత్రానికే అడ్వాన్స్ ఇస్తాను" (If demo is good, will send advance this evening)',
      ],
      recommendedPackage: 'Festive Growth E-commerce (Custom Storefront + Razorpay + WhatsApp Sync)',
      estimatedDealValue: '₹35,000',
    },
  },

  hindi_warm: {
    id: 'hindi_warm',
    name: 'Hindi Retailer (WARM Lead & Callback)',
    phoneNumber: '+91 98110 54321',
    customerName: 'Rajesh Sharma (Sharma Spices & Dry Fruits)',
    language: 'Hindi',
    leadTarget: 'WARM',
    description: 'Retail store owner wanting to sell spice gift boxes online. Requested callback tomorrow with partner.',
    steps: [
      {
        delayMs: 1500,
        status: 'calling',
        aiGoal: 'Initiating outbound call to Delhi NCR merchant...',
      },
      {
        delayMs: 3500,
        status: 'ringing',
        aiGoal: 'Ringing customer terminal (+91 98110 54321)...',
      },
      {
        delayMs: 5500,
        status: 'connected',
        aiGoal: 'Connected. Greeting in Hindi and introducing online catalog setup.',
      },
      {
        delayMs: 7500,
        status: 'speaking',
        aiGoal: 'Greeting customer and presenting spice/dry-fruit e-commerce solution',
        transcript: {
          speaker: 'ai',
          text: 'नमस्ते राजेश जी! मैं ई-कॉमर्स ग्रोथ टीम से बात कर रहा हूँ। आपकी दुकान के मसालों और ड्राई फ्रूट्स के लिए एक डिजिटल ऑनलाइन स्टोर बनाने के सिलसिले में फोन किया है, जहाँ ग्राहक सीधे ऑनलाइन आर्डर कर सकें। क्या आप 2 मिनट बात कर सकते हैं?',
          translation: 'Namaste Rajesh ji! I am calling from the E-commerce Growth team regarding setting up a dedicated digital store for your spices and dry fruits where customers can order online. Do you have 2 minutes?',
          timestamp: '00:07',
          language: 'Hindi',
        },
        actionTrigger: {
          type: 'language_detected',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Language Detected: Hindi',
          description: 'Recognized North Indian Hindi dialect.',
        },
      },
      {
        delayMs: 13000,
        status: 'listening',
        aiGoal: 'Listening to customer query about cost and online order process',
        transcript: {
          speaker: 'customer',
          text: 'हाँ बताइए, हमारे पास करीब 40-50 प्रोडक्ट्स हैं। हम सोच तो रहे थे कि कॉर्पोरेट गिफ्टिंग और रिटेल दोनों के लिए वेबसाइट बनाएं। खर्चा कितना आएगा?',
          translation: 'Yes tell me, we have around 40-50 products. We were thinking of building a website for both corporate gifting and retail. What will be the cost?',
          timestamp: '00:13',
          language: 'Hindi',
        },
        qualificationPatch: {
          products: 'Organic Spices, Dry Fruits Gift Packs, Sweets',
          productCount: '40-50 Products',
          decisionMaker: 'Known',
          buyingIntent: 'Medium',
          leadScore: 68,
        },
      },
      {
        delayMs: 18500,
        status: 'speaking',
        aiGoal: 'Explaining tiered packages and probing timeline and partner involvement',
        transcript: {
          speaker: 'ai',
          text: 'बहुत बढ़िया! 40-50 प्रोडक्ट्स के लिए हमारा स्टार्टर स्टोर ₹18,000 से ₹22,000 में तैयार हो जाता है, जिसमें GST इनवॉइस और ऑनलाइन पेमेंट शामिल है। आप इसे कब तक लाइव करना चाहते हैं?',
          translation: 'Wonderful! For 40-50 products, our Starter Store is ready in ₹18,000 to ₹22,000, including GST invoicing and online payments. When are you looking to go live?',
          timestamp: '00:18',
          language: 'Hindi',
        },
      },
      {
        delayMs: 24500,
        status: 'listening',
        aiGoal: 'Capturing callback request with natural language time expression',
        transcript: {
          speaker: 'customer',
          text: 'बजट तो ठीक है, करीब 20 हजार तक चलेगा। लेकिन अभी मैं बाहर मार्केट में हूँ। आप मुझे कल दोपहर 2 बजे फोन करो, मैं अपने पार्टनर के साथ बैठकर फाइनल करूँगा।',
          translation: 'Budget seems okay, around 20k is fine. But right now I am out in the wholesale market. Call me tomorrow afternoon at 2:00 PM, I will sit with my partner to finalize.',
          timestamp: '00:24',
          language: 'Hindi',
        },
        qualificationPatch: {
          leadStatus: 'WARM',
          budget: '₹18,000 - ₹22,000',
          timeline: 'Next Month (Requires partner discussion)',
          features: ['GST Invoicing', 'Corporate Bulk Enquiry Form', 'Razorpay Gateway'],
          barrier: 'Requires co-founder / partner alignment',
          buyingIntent: 'Medium',
          leadScore: 72,
        },
        callbackPatch: {
          requested: true,
          originalText: 'कल दोपहर 2 बजे फोन करो, पार्टनर रहेगा (Call me tomorrow at 2 PM, partner will be present)',
          requestedTime: 'Tomorrow afternoon at 2:00 PM',
          parsedDateTime: 'Tomorrow, 2:00 PM IST',
          status: 'scheduled',
          notes: 'Partner will be present to review budget and design templates.',
        },
        actionTrigger: {
          type: 'callback_requested',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Callback Interpreted by AI',
          description: 'Extracted temporal expression "कल दोपहर 2 बजे" -> Scheduled for Tomorrow 2:00 PM IST.',
        },
      },
      {
        delayMs: 30000,
        status: 'speaking',
        aiGoal: 'Confirming callback time and dispatching WhatsApp overview brochure',
        transcript: {
          speaker: 'ai',
          text: 'जी बिल्कुल! मैंने कल दोपहर ठीक 2 बजे का कॉल शेड्यूल कर दिया है। साथ ही आपके नंबर पर बेसिक कैटलॉग ब्रोशर भेज दिया है। धन्यवाद राजेश जी!',
          translation: 'Certainly! I have scheduled the call for tomorrow sharp at 2:00 PM. I also sent our basic catalog brochure to your WhatsApp. Thank you Rajesh ji!',
          timestamp: '00:30',
          language: 'Hindi',
        },
        actionTrigger: {
          type: 'whatsapp_sent',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'WhatsApp Catalog Sent',
          description: 'Brochure + GST Feature list dispatched to +91 98110 54321.',
        },
      },
      {
        delayMs: 34000,
        status: 'completed',
        aiGoal: 'Call wrapped up. Callback synced to calendar queue.',
        actionTrigger: {
          type: 'callback_scheduled',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Calendar Reminder Created',
          description: 'Calendar event created for Tomorrow 14:00 IST (Agent: Hindi Sales Desk).',
        },
      },
    ],
    finalSummary: {
      phoneNumber: '+91 98110 54321',
      customerName: 'Rajesh Sharma (Sharma Spices & Dry Fruits)',
      language: 'Hindi',
      leadStatus: 'WARM',
      whatTheyWant: 'E-commerce platform for 40-50 spice and dry fruit gift items with GST invoicing and corporate bulk order request capabilities.',
      budget: '₹18,000 - ₹22,000',
      products: 'Organic Spices, Dry Fruits Gift Packs, Regional Sweets',
      productCount: '40-50 SKUs',
      timeline: 'Next Month (Pre-festive setup)',
      features: ['GST Compliant Invoicing', 'Corporate Bulk Ordering Form', 'UPI/Card Payments', 'Catalog Grid'],
      customerConcerns: 'Needs partner approval before paying advance; requested time to review catalog samples.',
      nextAction: 'Outbound sales callback scheduled for Tomorrow at 2:00 PM IST with partner on speaker/conference.',
      importantStatements: [
        '"हमारे पास करीब 40-50 प्रोडक्ट्स हैं, कॉर्पोरेट गिफ्टिंग और रिटेल दोनों चाहिए" (Have 40-50 items, need retail + corporate)',
        '"आप मुझे कल दोपहर 2 बजे फोन करो, मैं अपने पार्टनर के साथ बैठूँगा" (Call me tomorrow at 2 PM with partner)',
      ],
      recommendedPackage: 'Retail Starter Store (₹20,000)',
      estimatedDealValue: '₹20,000',
    },
  },

  english_cold: {
    id: 'english_cold',
    name: 'English Wholesaler (COLD Lead)',
    phoneNumber: '+91 97170 99887',
    customerName: 'Vikram Menon (Apex Tech Gadgets)',
    language: 'English',
    leadTarget: 'COLD',
    description: 'Existing Amazon/Flipkart seller who has low interest in a dedicated website unless cost is negligible.',
    steps: [
      {
        delayMs: 1500,
        status: 'calling',
        aiGoal: 'Initiating call to Bangalore gadget distributor...',
      },
      {
        delayMs: 3500,
        status: 'ringing',
        aiGoal: 'Ringing +91 97170 99887...',
      },
      {
        delayMs: 5000,
        status: 'connected',
        aiGoal: 'Connected in English. Pitching D2C brand independence.',
      },
      {
        delayMs: 7000,
        status: 'speaking',
        aiGoal: 'Pitching e-commerce direct store to reduce marketplace commissions',
        transcript: {
          speaker: 'ai',
          text: 'Hello Vikram! Calling from AI Web Solutions. We build zero-commission custom D2C storefronts for tech and consumer electronics brands. Are you looking to launch your own brand website this quarter?',
          timestamp: '00:07',
          language: 'English',
        },
      },
      {
        delayMs: 12000,
        status: 'listening',
        aiGoal: 'Listening to objection regarding Amazon dependence and lack of interest',
        transcript: {
          speaker: 'customer',
          text: 'Honestly, 95% of my sales come from Amazon and Flipkart already. I don’t think people will search for my standalone website. Unless it’s super cheap or free, not really interested.',
          timestamp: '00:12',
          language: 'English',
        },
        qualificationPatch: {
          leadStatus: 'COLD',
          budget: 'Under ₹10,000 or Unspecified',
          products: 'Mobile accessories, chargers, Bluetooth headsets',
          productCount: '15 items',
          timeline: 'Indefinite / Low priority',
          features: ['Basic product display only'],
          buyingIntent: 'Low',
          barrier: 'High marketplace dependency, skeptical of independent website traffic',
          decisionMaker: 'Known',
          leadScore: 24,
        },
        actionTrigger: {
          type: 'lead_classified',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Lead Classified: COLD (Score 24/100)',
          description: 'Customer expressed heavy marketplace dependency and price skepticism.',
        },
      },
      {
        delayMs: 17000,
        status: 'speaking',
        aiGoal: 'Respectfully concluding and offering passive email case study',
        transcript: {
          speaker: 'ai',
          text: 'Understood Vikram. I completely understand. I can drop a quick 2-page case study on how Amazon brands save 15% margin on your email if you ever want to explore later. Thanks for your time!',
          timestamp: '00:17',
          language: 'English',
        },
      },
      {
        delayMs: 22000,
        status: 'listening',
        aiGoal: 'Polite wrap up',
        transcript: {
          speaker: 'customer',
          text: 'Sure, you can email it over. Bye.',
          timestamp: '00:22',
          language: 'English',
        },
      },
      {
        delayMs: 25000,
        status: 'completed',
        aiGoal: 'Call concluded. Lead marked COLD / Passive nurture.',
        actionTrigger: {
          type: 'followup_prepared',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Cold Lead Nurture Flow Triggered',
          description: 'Added to monthly newsletter and D2C margin case study email queue.',
        },
      },
    ],
    finalSummary: {
      phoneNumber: '+91 97170 99887',
      customerName: 'Vikram Menon (Apex Tech Gadgets)',
      language: 'English',
      leadStatus: 'COLD',
      whatTheyWant: 'Prefers marketplace fulfillment on Amazon/Flipkart. Only interested if website costs under ₹10,000 with guaranteed organic sales.',
      budget: 'Low / < ₹10,000',
      products: 'Mobile phone accessories, GaN chargers, cables',
      productCount: '~15 SKUs',
      timeline: 'No immediate plans',
      features: ['Basic landing page'],
      customerConcerns: 'Convinced standalone web stores do not get organic buyer traffic compared to Amazon.',
      nextAction: 'Send passive email case study on marketplace fee savings. Do not follow up via outbound phone calls for 90 days.',
      importantStatements: [
        '"95% of my sales come from Amazon and Flipkart already"',
        '"Unless it’s super cheap or free, not really interested"',
      ],
      recommendedPackage: 'Low Priority / Passive Email Nurture',
      estimatedDealValue: '₹0',
    },
  },
};

// Initial seeded historical records for immediate dashboard exploration
export const SEEDED_CALL_HISTORY: CallRecord[] = [
  {
    id: 'call_hist_001',
    phoneNumber: '+91 98490 12345',
    customerName: 'Lakshmi Devi (Hyderabad Sarees)',
    status: 'completed',
    startedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    endedAt: new Date(Date.now() - 3600 * 1000 * 2 + 46000).toISOString(),
    durationSeconds: 46,
    language: 'Telugu',
    qualification: {
      leadStatus: 'HOT',
      budget: '₹30,000 - ₹35,000',
      products: 'Handloom Sarees, Designer Kurtis',
      productCount: '~120-150 SKUs',
      timeline: 'Within 10 days (Festive rush)',
      features: ['Razorpay UPI/Cards', 'Automated Courier Tracking', 'WhatsApp Catalog Sync', 'Mobile Fast Checkout'],
      buyingIntent: 'High',
      barrier: 'None',
      decisionMaker: 'Known',
      leadScore: 94,
    },
    callback: {
      requested: true,
      originalText: 'సాయంత్రం 5 గంటలకు మాట్లాడతాను',
      requestedTime: 'Today evening at 5:00 PM',
      parsedDateTime: 'Today, 5:00 PM IST',
      status: 'scheduled',
      notes: 'Customer requested follow-up after checking WhatsApp demo link with son.',
    },
    actions: [
      {
        id: 'act_101',
        type: 'outbound_initiated',
        status: 'completed',
        timestamp: '14:30:02',
        title: 'Exotel Call Connected',
        description: 'SIP Call SID #EXO-994821 established with Hyderabad telecom circle.',
      },
      {
        id: 'act_102',
        type: 'language_detected',
        status: 'completed',
        timestamp: '14:30:08',
        title: 'Language Detected: Telugu',
        description: 'Speech recognition switched to Telugu acoustic model.',
      },
      {
        id: 'act_103',
        type: 'lead_classified',
        status: 'completed',
        timestamp: '14:30:25',
        title: 'Lead Classified: HOT (Score 94/100)',
        description: 'High purchase intent, explicit budget confirmed, urgent 10-day timeline.',
      },
      {
        id: 'act_104',
        type: 'whatsapp_sent',
        status: 'completed',
        timestamp: '14:30:31',
        title: 'WhatsApp Catalog & Quotation Sent',
        description: 'Sent live interactive demo link + Festive Package PDF (₹35,000) to +91 98490 12345.',
      },
      {
        id: 'act_105',
        type: 'callback_scheduled',
        status: 'completed',
        timestamp: '14:30:42',
        title: 'Follow-up Call Scheduled',
        description: 'Scheduled for Today at 5:00 PM IST with Senior Solutions Architect.',
      },
    ],
    transcript: [
      {
        id: 't_01',
        speaker: 'ai',
        text: 'నమస్కారం అండి! నేను AI వెబ్ సొల్యూషన్స్ నుండి మాట్లాడుతున్నాను. మీ బూటీక్ చీరల కోసం వెబ్‌సైట్ గురించి మాట్లాడుతున్నాను.',
        translation: 'Namaskaram! I am speaking from AI Web Solutions regarding an e-commerce website for your boutique sarees.',
        timestamp: '00:08',
        language: 'Telugu',
      },
      {
        id: 't_02',
        speaker: 'customer',
        text: 'అవునండి, ప్రస్తుతం ఇన్‌స్టాగ్రామ్‌లో ఆర్డర్స్ మేనేజ్ చేయడం కష్టంగా ఉంది. మంచి వెబ్‌సైట్ కావాలి.',
        translation: 'Yes, managing orders on Instagram is currently very hard. We need a good website.',
        timestamp: '00:14',
        language: 'Telugu',
      },
      {
        id: 't_03',
        speaker: 'ai',
        text: 'మా దగ్గర వాట్సాప్ మరియు పేమెంట్ గేట్‌వే ఇంటిగ్రేషన్ ఉంటుంది. మీ బడ్జెట్ మరియు సమయం ఎంత?',
        translation: 'We provide WhatsApp and payment gateway integration. What is your budget and timeline?',
        timestamp: '00:19',
        language: 'Telugu',
      },
      {
        id: 't_04',
        speaker: 'customer',
        text: '120 డిజైన్స్ ఉన్నాయి. బడ్జెట్ 35,000 దాకా పెట్టుకోగలను. ఉగాది లోపు అంటే 10 రోజుల్లో కావాలి.',
        translation: 'We have 120 designs. Budget is up to ₹35k. Need it in 10 days before festival.',
        timestamp: '00:25',
        language: 'Telugu',
      },
      {
        id: 't_05',
        speaker: 'ai',
        text: 'ఖచ్చితంగా! మీ వాట్సాప్‌కి డెమో మరియు కొటేషన్ పంపుతున్నాను. సాయంత్రం 5 గంటలకు వివరాలు ఫైనల్ చేద్దాం.',
        translation: 'Absolutely! Sending demo and quotation to WhatsApp now. We will finalize details at 5 PM.',
        timestamp: '00:31',
        language: 'Telugu',
      },
    ],
    summary: {
      id: 'sum_001',
      callId: 'call_hist_001',
      customerName: 'Lakshmi Devi (Hyderabad Sarees)',
      phoneNumber: '+91 98490 12345',
      language: 'Telugu',
      leadStatus: 'HOT',
      whatTheyWant: 'Custom boutique e-commerce web store with instant UPI payment and WhatsApp order sync.',
      budget: '₹30,000 - ₹35,000',
      products: 'Handloom Designer Sarees, Silk Kurtis',
      productCount: '~120-150 SKUs',
      timeline: 'Urgent: Within 10 days',
      features: ['Razorpay UPI/Cards', 'Automated Courier Tracking', 'WhatsApp Catalog Sync'],
      customerConcerns: 'Needs quick delivery before festival rush.',
      nextAction: 'Senior engineer follow-up call at 5:00 PM IST today to demonstrate live checkout flow.',
      importantStatements: [
        '"ప్రస్తుతం ఇన్‌స్టాగ్రామ్‌లో ఆర్డర్స్ మేనేజ్ చేయడం కష్టంగా ఉంది" (Manual IG order management is hard)',
        '"బడ్జెట్ 35,000 దాకా పెట్టుకోగలను, ఉగాది లోపు కావాలి" (Budget is up to ₹35k, urgent launch)',
      ],
      generatedAt: new Date(Date.now() - 3600 * 1000 * 2 + 46000).toISOString(),
      recommendedPackage: 'Festive Growth E-commerce (₹35,000)',
      estimatedDealValue: '₹35,000',
    },
  },
  {
    id: 'call_hist_002',
    phoneNumber: '+91 98110 54321',
    customerName: 'Rajesh Sharma (Sharma Spices)',
    status: 'completed',
    startedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    endedAt: new Date(Date.now() - 3600 * 1000 * 5 + 34000).toISOString(),
    durationSeconds: 34,
    language: 'Hindi',
    qualification: {
      leadStatus: 'WARM',
      budget: '₹18,000 - ₹22,000',
      products: 'Organic Spices, Dry Fruits Gift Packs',
      productCount: '40-50 SKUs',
      timeline: 'Next Month',
      features: ['GST Invoicing', 'Corporate Bulk Ordering Form', 'UPI/Card Payments'],
      buyingIntent: 'Medium',
      barrier: 'Requires business partner alignment',
      decisionMaker: 'Known',
      leadScore: 72,
    },
    callback: {
      requested: true,
      originalText: 'कल दोपहर 2 बजे फोन करो, पार्टनर रहेगा',
      requestedTime: 'Tomorrow afternoon at 2:00 PM',
      parsedDateTime: 'Tomorrow, 2:00 PM IST',
      status: 'scheduled',
      notes: 'Partner will be present to review budget and design templates.',
    },
    actions: [
      {
        id: 'act_201',
        type: 'outbound_initiated',
        status: 'completed',
        timestamp: '11:15:00',
        title: 'Exotel Call Connected',
        description: 'SIP Call SID #EXO-488219 connected.',
      },
      {
        id: 'act_202',
        type: 'language_detected',
        status: 'completed',
        timestamp: '11:15:07',
        title: 'Language Detected: Hindi',
        description: 'Standard Hindi conversational agent active.',
      },
      {
        id: 'act_203',
        type: 'callback_requested',
        status: 'completed',
        timestamp: '11:15:24',
        title: 'Callback Interpreted by AI',
        description: 'Extracted temporal expression "कल दोपहर 2 बजे" -> Scheduled for Tomorrow 2:00 PM IST.',
      },
      {
        id: 'act_204',
        type: 'whatsapp_sent',
        status: 'completed',
        timestamp: '11:15:30',
        title: 'WhatsApp Brochure Dispatched',
        description: 'Sent Retail E-commerce catalog PDF to +91 98110 54321.',
      },
    ],
    transcript: [
      {
        id: 't_11',
        speaker: 'ai',
        text: 'नमस्ते राजेश जी! आपकी दुकान के मसालों और ड्राई फ्रूट्स के लिए ऑनलाइन स्टोर बनाने के सिलसिले में फोन किया है।',
        translation: 'Namaste Rajesh ji! Calling regarding an online store for your spices and dry fruits.',
        timestamp: '00:07',
        language: 'Hindi',
      },
      {
        id: 't_12',
        speaker: 'customer',
        text: 'हाँ, हमारे पास करीब 40-50 प्रोडक्ट्स हैं। खर्चा कितना आएगा?',
        translation: 'Yes, we have around 40-50 products. What is the cost?',
        timestamp: '00:13',
        language: 'Hindi',
      },
      {
        id: 't_13',
        speaker: 'ai',
        text: '40-50 प्रोडक्ट्स के लिए हमारा पैकेज ₹18,000 से ₹22,000 में आ जाता है।',
        translation: 'For 40-50 products our package ranges from ₹18,000 to ₹22,000.',
        timestamp: '00:18',
        language: 'Hindi',
      },
      {
        id: 't_14',
        speaker: 'customer',
        text: 'कल दोपहर 2 बजे फोन करो, मैं अपने पार्टनर के साथ बैठूँगा।',
        translation: 'Call me tomorrow at 2 PM, I will be sitting with my partner.',
        timestamp: '00:24',
        language: 'Hindi',
      },
    ],
    summary: {
      id: 'sum_002',
      callId: 'call_hist_002',
      customerName: 'Rajesh Sharma (Sharma Spices)',
      phoneNumber: '+91 98110 54321',
      language: 'Hindi',
      leadStatus: 'WARM',
      whatTheyWant: 'E-commerce platform for 40-50 spice items with GST invoicing.',
      budget: '₹18,000 - ₹22,000',
      products: 'Organic Spices, Dry Fruits Gift Packs',
      productCount: '40-50 SKUs',
      timeline: 'Next Month',
      features: ['GST Invoicing', 'Corporate Bulk Ordering Form'],
      customerConcerns: 'Needs partner approval before paying advance.',
      nextAction: 'Outbound sales callback scheduled for Tomorrow at 2:00 PM IST.',
      importantStatements: ['"कल दोपहर 2 बजे फोन करो, मैं अपने पार्टनर के साथ बैठूँगा"'],
      generatedAt: new Date(Date.now() - 3600 * 1000 * 5 + 34000).toISOString(),
      recommendedPackage: 'Retail Starter Store (₹20,000)',
      estimatedDealValue: '₹20,000',
    },
  },
  {
    id: 'call_hist_003',
    phoneNumber: '+91 97170 99887',
    customerName: 'Vikram Menon (Apex Gadgets)',
    status: 'completed',
    startedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    endedAt: new Date(Date.now() - 3600 * 1000 * 24 + 25000).toISOString(),
    durationSeconds: 25,
    language: 'English',
    qualification: {
      leadStatus: 'COLD',
      budget: '< ₹10,000 / Unspecified',
      products: 'Mobile accessories',
      productCount: '15 items',
      timeline: 'Indefinite',
      features: ['Basic display'],
      buyingIntent: 'Low',
      barrier: 'Marketplace dependency',
      decisionMaker: 'Known',
      leadScore: 24,
    },
    callback: {
      requested: false,
      status: 'none',
    },
    actions: [
      {
        id: 'act_301',
        type: 'outbound_initiated',
        status: 'completed',
        timestamp: 'Yesterday 16:10',
        title: 'Exotel Call Connected',
        description: 'Call connected with Bangalore subscriber.',
      },
      {
        id: 'act_302',
        type: 'lead_classified',
        status: 'completed',
        timestamp: 'Yesterday 16:10',
        title: 'Lead Classified: COLD (Score 24/100)',
        description: 'Customer has heavy Amazon reliance and no immediate website budget.',
      },
    ],
    transcript: [
      {
        id: 't_21',
        speaker: 'ai',
        text: 'Hello Vikram! Calling from AI Web Solutions regarding building your brand storefront.',
        timestamp: '00:07',
        language: 'English',
      },
      {
        id: 't_22',
        speaker: 'customer',
        text: '95% of my sales come from Amazon already. Not looking to invest in a website now.',
        timestamp: '00:12',
        language: 'English',
      },
    ],
    summary: {
      id: 'sum_003',
      callId: 'call_hist_003',
      customerName: 'Vikram Menon (Apex Gadgets)',
      phoneNumber: '+91 97170 99887',
      language: 'English',
      leadStatus: 'COLD',
      whatTheyWant: 'Currently relies on Amazon/Flipkart. Skeptical of independent traffic.',
      budget: '< ₹10,000',
      products: 'Mobile accessories',
      productCount: '15 items',
      timeline: 'Indefinite',
      features: ['Basic display'],
      customerConcerns: 'Amazon fee reliance, low intent for standalone website.',
      nextAction: 'Queued for passive email newsletter.',
      importantStatements: ['"95% of my sales come from Amazon already"'],
      generatedAt: new Date(Date.now() - 3600 * 1000 * 24 + 25000).toISOString(),
    },
  },
];

type CallUpdateListener = (call: CallRecord) => void;

class MockService {
  private calls: Map<string, CallRecord> = new Map();
  private activeSimulationTimers: NodeJS.Timeout[] = [];
  private listeners: Set<CallUpdateListener> = new Set();
  private activeCallId: string | null = null;

  constructor() {
    // Populate seed history
    SEEDED_CALL_HISTORY.forEach((call) => {
      this.calls.set(call.id, { ...call });
    });
  }

  public subscribe(listener: CallUpdateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(call: CallRecord) {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...call });
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    });
  }

  public getCalls(): CallRecord[] {
    return Array.from(this.calls.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public getCall(callId: string): CallRecord | undefined {
    return this.calls.get(callId);
  }

  public getActiveCallId(): string | null {
    return this.activeCallId;
  }

  public cancelActiveSimulation(): void {
    this.activeSimulationTimers.forEach((timer) => clearTimeout(timer));
    this.activeSimulationTimers = [];
    if (this.activeCallId) {
      const activeCall = this.calls.get(this.activeCallId);
      if (activeCall && (activeCall.status !== 'completed' && activeCall.status !== 'failed')) {
        activeCall.status = 'completed';
        activeCall.endedAt = new Date().toISOString();
        this.calls.set(this.activeCallId, activeCall);
        this.notify(activeCall);
      }
    }
  }

  public async startCall(payload: StartCallPayload): Promise<StartCallResponse> {
    this.cancelActiveSimulation();

    const scenarioKey = payload.scenarioPreset || 'telugu_hot';
    const scenario = MOCK_SCENARIOS[scenarioKey] || MOCK_SCENARIOS.telugu_hot;

    const callId = `call_live_${Date.now()}`;
    this.activeCallId = callId;

    const initialCall: CallRecord = {
      id: callId,
      phoneNumber: payload.phoneNumber || scenario.phoneNumber,
      customerName: payload.customerName || scenario.customerName,
      status: 'calling',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      language: scenario.language,
      currentAiGoal: 'Initializing outbound Exotel telephony trunk...',
      qualification: {
        leadStatus: 'UNASSIGNED',
        budget: 'Not provided',
        products: 'Not provided',
        productCount: 'Not provided',
        timeline: 'Not provided',
        features: [],
        buyingIntent: 'Unknown',
        barrier: 'None',
        decisionMaker: 'Unknown',
        leadScore: 10,
        lastUpdated: new Date().toLocaleTimeString(),
      },
      callback: {
        requested: false,
        status: 'none',
      },
      actions: [
        {
          id: `act_init_${Date.now()}`,
          type: 'outbound_initiated',
          status: 'in_progress',
          timestamp: new Date().toLocaleTimeString(),
          title: 'Outbound Call Initiated',
          description: `Dialing ${payload.phoneNumber || scenario.phoneNumber} via Exotel Cloud Telephony SIP...`,
        },
      ],
      transcript: [],
    };

    this.calls.set(callId, initialCall);
    this.notify(initialCall);

    // Schedule timed scenario progression
    scenario.steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        const currentCall = this.calls.get(callId);
        if (!currentCall || currentCall.id !== this.activeCallId) return;

        currentCall.status = step.status;
        if (step.aiGoal) {
          currentCall.currentAiGoal = step.aiGoal;
        }

        // Increment duration when active
        if (step.status === 'connected' || step.status === 'listening' || step.status === 'speaking') {
          currentCall.durationSeconds = Math.floor(step.delayMs / 1000);
        }

        // Add transcript message
        if (step.transcript) {
          const newMsg: TranscriptMessage = {
            id: `msg_${index}_${Date.now()}`,
            speaker: step.transcript.speaker,
            text: step.transcript.text,
            translation: step.transcript.translation,
            timestamp: step.transcript.timestamp || new Date().toLocaleTimeString(),
            language: step.transcript.language || currentCall.language,
          };
          currentCall.transcript = [...currentCall.transcript, newMsg];
        }

        // Patch qualification
        if (step.qualificationPatch) {
          currentCall.qualification = {
            ...currentCall.qualification,
            ...step.qualificationPatch,
            lastUpdated: new Date().toLocaleTimeString(),
          };
        }

        // Patch callback
        if (step.callbackPatch) {
          currentCall.callback = {
            ...currentCall.callback,
            ...step.callbackPatch,
          };
        }

        // Add backend action
        if (step.actionTrigger) {
          const newAction: CallAction = {
            id: `act_${index}_${Date.now()}`,
            type: step.actionTrigger.type,
            status: step.actionTrigger.status,
            timestamp: step.actionTrigger.timestamp || new Date().toLocaleTimeString(),
            title: step.actionTrigger.title,
            description: step.actionTrigger.description,
            payloadSnippet: step.actionTrigger.payloadSnippet,
          };
          currentCall.actions = [newAction, ...currentCall.actions];
        }

        // Call completion step
        if (step.status === 'completed') {
          currentCall.endedAt = new Date().toISOString();
          currentCall.durationSeconds = Math.floor(step.delayMs / 1000);
          currentCall.currentAiGoal = 'Call ended. Post-call CRM intelligence generated.';

          const summary: CallSummary = {
            id: `sum_${callId}`,
            callId,
            customerName: currentCall.customerName,
            phoneNumber: currentCall.phoneNumber,
            language: currentCall.language,
            leadStatus: currentCall.qualification.leadStatus,
            whatTheyWant: scenario.finalSummary.whatTheyWant,
            budget: currentCall.qualification.budget || scenario.finalSummary.budget,
            products: currentCall.qualification.products || scenario.finalSummary.products,
            productCount: currentCall.qualification.productCount || scenario.finalSummary.productCount,
            timeline: currentCall.qualification.timeline || scenario.finalSummary.timeline,
            features: currentCall.qualification.features.length > 0 ? currentCall.qualification.features : scenario.finalSummary.features,
            customerConcerns: scenario.finalSummary.customerConcerns,
            nextAction: scenario.finalSummary.nextAction,
            importantStatements: scenario.finalSummary.importantStatements,
            generatedAt: new Date().toISOString(),
            recommendedPackage: scenario.finalSummary.recommendedPackage,
            estimatedDealValue: scenario.finalSummary.estimatedDealValue,
          };
          currentCall.summary = summary;
        }

        this.calls.set(callId, currentCall);
        this.notify(currentCall);
      }, step.delayMs);

      this.activeSimulationTimers.push(timer);
    });

    return {
      success: true,
      callId,
      status: 'calling',
      message: 'Mock call triggered successfully',
    };
  }

  public scheduleCallback(callId: string, data: { time: string; note?: string }): CallbackData {
    const call = this.calls.get(callId);
    if (!call) throw new Error('Call not found');

    const updatedCallback: CallbackData = {
      requested: true,
      requestedTime: data.time,
      parsedDateTime: data.time,
      status: 'scheduled',
      notes: data.note || call.callback.notes,
    };

    call.callback = updatedCallback;

    const action: CallAction = {
      id: `act_cb_${Date.now()}`,
      type: 'callback_scheduled',
      status: 'completed',
      timestamp: new Date().toLocaleTimeString(),
      title: 'Callback Manually Scheduled',
      description: `Callback confirmed for ${data.time}.`,
    };
    call.actions = [action, ...call.actions];

    this.calls.set(callId, call);
    this.notify(call);
    return updatedCallback;
  }
}

export const mockService = new MockService();
