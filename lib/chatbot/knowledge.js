/**
 * SOURCE OF TRUTH for the site assistant.
 *
 * The assistant has no language model behind it by default. It can only ever
 * say what is written in this file, so everything here must be factually true
 * and must stay in sync with the real pages:
 *   - services ......... app/(site)/services/page.js
 *   - approach / fit ... app/(site)/about/page.js
 *   - coverage area .... app/(site)/service-area/page.js
 *   - intake detail .... app/(site)/contact/page.js
 *
 * TWO HARD RULES, because the site itself follows them:
 *
 * 1. NO PRICES. The site publishes no rates, and coverage is priced from the
 *    hours, schedule, skills, travel and duration of the actual assignment.
 *    Never state, estimate, or imply a dollar figure or hourly rate.
 * 2. NO PHONE OR EMAIL. The site publishes neither. The contact form is the
 *    only channel, so every hand-off goes to /contact or to the in-chat
 *    lead capture. Never invent contact details.
 *
 * Voice: plant-floor first. Lead with the maintenance problem, then the
 * coverage that solves it, then one concrete next step. When we do not know,
 * the honest answer is that it is defined when the scope is built.
 */

/** @typedef {{ label: string, href: string }} ChatLink */

/**
 * @typedef {Object} KnowledgeEntry
 * @property {string}      id          Stable topic id, carried between turns.
 * @property {string[]}    [phrases]   Multi-word matches. Weighted heavily — near-certain intent.
 * @property {string[]}    [keywords]  Single tokens. Matched as prefixes, so "maintenance" hits "maintain".
 * @property {string}      answer      Plain text; \n\n separates paragraphs in the bubble.
 * @property {ChatLink[]}  [links]     Buttons rendered under the answer.
 * @property {string[]}    [followUps] Suggested next questions, rendered as tappable chips.
 * @property {string}      [scoping]   Reply to a bare "how much?" once this topic is active. Never a number.
 * @property {boolean}     [leadIntent] High intent — the assistant offers to take their details.
 */

export const CONTACT = {
  company: 'Olmem Technical Services',
  region: 'Southeast Wisconsin and Northeast Illinois',
  /** The only published channel. There is no public phone number or email. */
  contactPath: '/contact',
};

export const GREETING =
  "I'm the Olmem Technical Services assistant.\n\n" +
  'We provide industrial maintenance capacity for manufacturers that need qualified hands on the floor — a scheduled shift, a block of hours, recurring PM work, shutdown support, a difficult machine problem, or a longer-term assignment.\n\n' +
  'Tell me what you need covered and I can explain how it would be structured, or take your details and pass them straight to Olmem.';

/** Chips shown under the greeting. */
export const OPENING_SUGGESTIONS = [
  'I need maintenance coverage for a shift',
  'Do you do contract PM?',
  'We have a machine down',
  'What areas do you serve?',
];

export const FALLBACK =
  "I'm not certain about that one, and I'd rather say so than guess.\n\n" +
  'I can tell you how maintenance coverage, contract PM, troubleshooting, shutdown support, or the service area work — or I can take your details and have Olmem follow up directly.';

export const FALLBACK_SUGGESTIONS = [
  'What services do you offer?',
  'How is coverage priced?',
  'What areas do you serve?',
  'Request maintenance coverage',
];

/**
 * Everything the assistant is allowed to say. Ordered loosely by how often it
 * gets asked; order does not affect matching.
 *
 * @type {KnowledgeEntry[]}
 */
export const KNOWLEDGE = [
  /* ─────────────────────────  WHO / POSITIONING  ───────────────────────── */
  {
    id: 'who',
    phrases: [
      'who are you',
      'about you',
      'about the company',
      'tell me about',
      'your background',
      'your experience',
      'what makes you different',
      'are you an agency',
      'are you a staffing',
    ],
    keywords: ['about', 'background', 'experience', 'who', 'company', 'agency', 'staffing'],
    answer:
      'Olmem Technical Services is an independent industrial maintenance provider serving manufacturers across Southeast Wisconsin and Northeast Illinois.\n\n' +
      'The work is hands-on: structured troubleshooting, repairs, PM execution, inspections, and day-to-day maintenance support alongside your team. The approach is to understand the failure before replacing parts, prioritize by safety and startup impact, and document the work so the next service call is easier than the last.\n\n' +
      'The goal is straightforward — give manufacturers access to qualified maintenance hours when internal staffing cannot cover the workload.',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
    ],
    followUps: ['What services do you offer?', 'Who do you usually work with?', 'What areas do you serve?'],
  },
  {
    id: 'independent',
    phrases: [
      'are you authorized',
      'oem service',
      'authorized service',
      'factory authorized',
      'are you certified by',
      'do you work on haas',
      'are you an oem',
    ],
    keywords: ['oem', 'authorized', 'independent', 'certified', 'factory', 'warranty'],
    answer:
      'Olmem Technical Services is an independent maintenance provider — not an authorized OEM service center, unless that is explicitly stated for a specific engagement.\n\n' +
      'That is deliberate, and it cuts both ways: you get practical maintenance support without OEM scheduling and overhead, and when an OEM specialist genuinely is the right next step, that recommendation gets made clearly rather than worked around.',
    links: [{ label: 'Our approach', href: '/about' }],
    followUps: ['What equipment do you work on?', 'What services do you offer?'],
  },
  {
    id: 'fit',
    phrases: [
      'who do you work with',
      'who are your customers',
      'is this right for us',
      'do you work with small',
      'typical customer',
      'good fit',
    ],
    keywords: ['fit', 'customer', 'client', 'manufacturer', 'plant', 'facility', 'typical'],
    answer:
      'Three situations come up most often.\n\n' +
      'Small and mid-sized manufacturers that need experienced maintenance support without immediately adding another full-time headcount. Plants with capable internal teams that need another resource for planned work, troubleshooting, PMs, or a shutdown. And new or aging equipment situations where the history is incomplete, the scope is unclear, or there are several startup and reliability issues to sort out.',
    links: [{ label: 'About', href: '/about' }],
    followUps: ['I need maintenance coverage for a shift', 'Do you do contract PM?', 'How is coverage priced?'],
  },

  /* ─────────────────────────────  SERVICES  ────────────────────────────── */
  {
    id: 'services',
    phrases: [
      'what services',
      'what do you offer',
      'what do you do',
      'list of services',
      'what can you do',
      'capabilities',
      'what kind of work',
    ],
    keywords: ['service', 'offer', 'capability', 'work', 'help', 'support', 'provide'],
    answer:
      'Seven capabilities, all built around adding maintenance capacity:\n\n' +
      'Industrial maintenance coverage (blocks, shifts, temporary or longer-term). Contract preventive maintenance. Industrial troubleshooting and repair. CNC and machine tool support. Maintenance program development. Equipment assessments and punch lists. Shutdown and project maintenance support.\n\n' +
      'Which one is closest to what you are dealing with?',
    links: [{ label: 'All services', href: '/services' }],
    followUps: [
      'I need maintenance coverage for a shift',
      'Do you do contract PM?',
      'We have a machine down',
      'Do you support CNC machines?',
    ],
  },
  {
    id: 'coverage',
    phrases: [
      'maintenance coverage',
      'cover a shift',
      'shift coverage',
      'need a technician',
      'extra hands',
      'another technician',
      'temporary coverage',
      'staffing gap',
      'short handed',
      'short staffed',
      'block of hours',
      'without hiring',
      'add headcount',
    ],
    keywords: ['coverage', 'cover', 'shift', 'technician', 'temporary', 'staffing', 'headcount', 'hours', 'block', 'vacancy', 'vacation'],
    answer:
      'This is the core of what Olmem does: qualified maintenance support for manufacturers that need additional hands without immediately adding permanent headcount.\n\n' +
      'Coverage can be scheduled as a block of hours, a designated production shift, weekly coverage, a shutdown period, temporary cover for a vacancy or vacation, or a longer-term assignment lasting weeks or months. The work itself can include breakdown response, mechanical and electrical troubleshooting, repairs, PM execution, inspections, and production-line support.\n\n' +
      'The assignment gets structured around the expected hours, shift schedule, required skills, travel, and duration.',
    scoping:
      'Coverage is priced from the assignment, not a published rate — expected labor hours, shift schedule, required skills, travel, and how long the coverage runs. Those get converted into a block, weekly, monthly, shutdown, or term-based agreement so you have a clear contract price tied to the actual capacity you need.\n\n' +
      'Send the shift, hours, duration, and equipment involved and Olmem can scope it properly.',
    links: [
      { label: 'How coverage works', href: '/services#coverage' },
      { label: 'Request coverage', href: '/contact' },
    ],
    followUps: ['How is coverage priced?', 'How quickly can you start?', 'What areas do you serve?'],
    leadIntent: true,
  },
  {
    id: 'contract-pm',
    phrases: [
      'contract pm',
      'preventive maintenance',
      'preventative maintenance',
      'pm program',
      'pm contract',
      'pm agreement',
      'recurring maintenance',
      'maintenance contract',
      'monthly maintenance',
      'quarterly pm',
    ],
    keywords: ['pm', 'preventive', 'preventative', 'recurring', 'contract', 'agreement', 'monthly', 'quarterly', 'lubrication', 'inspection'],
    answer:
      'Yes — recurring preventive maintenance handled on a contractual basis, for plants that want a defined PM workload actually executed rather than perpetually deferred.\n\n' +
      'Agreements are built around your equipment, PM frequency, expected labor hours, and contract duration. Coverage can be monthly, quarterly, shutdown-based, or a custom schedule, and typically includes scheduled PM execution, inspections, lubrication and condition checks, and maintenance backlog reduction.\n\n' +
      'If the PM program does not exist yet, that can be developed first.',
    scoping:
      'PM agreements are priced from the estimated maintenance hours needed across the duration of the contract — driven by equipment count, PM frequency, and the labor hours each cycle actually takes. No published rate; the contract total comes out of that estimate.\n\n' +
      'Useful to send: facility location, equipment types and rough machine count, existing PM frequency if you have one, estimated hours per month if known, and preferred contract duration.',
    links: [
      { label: 'Contract PM details', href: '/services#contract-pm' },
      { label: 'Request PM coverage', href: '/contact' },
    ],
    followUps: ['How is contract PM priced?', 'Can you build the PM program first?', 'Request maintenance coverage'],
    leadIntent: true,
  },
  {
    id: 'breakdown',
    phrases: [
      'machine is down',
      'machine down',
      'line is down',
      'production is down',
      'broke down',
      'breakdown',
      'not running',
      'stopped working',
      'keeps failing',
      'repeat failure',
      'troubleshoot',
      'emergency',
      'urgent',
    ],
    keywords: ['down', 'breakdown', 'broken', 'troubleshoot', 'repair', 'fault', 'failure', 'alarm', 'emergency', 'urgent', 'unreliable'],
    answer:
      'When a machine or line is down, unreliable, or creating repeat problems, the process is structured rather than parts-first: verify the symptom, isolate the fault, then restore operation safely.\n\n' +
      'That covers mechanical, electrical, sensor, motor and drive troubleshooting, plus a clear call on temporary recovery versus permanent repair — and documented findings so the same failure is easier to handle next time.\n\n' +
      'If you send it over, include the manufacturer and model, what the machine is or is not doing, any alarm numbers or fault messages, recent changes, and what has already been checked or replaced.',
    links: [
      { label: 'Troubleshooting & repair', href: '/services#breakdown' },
      { label: 'Send machine details', href: '/contact' },
    ],
    followUps: ['Do you support CNC machines?', 'What equipment do you work on?', 'How quickly can you start?'],
    leadIntent: true,
  },
  {
    id: 'cnc',
    phrases: [
      'cnc machine',
      'machine tool',
      'do you work on cnc',
      'cnc support',
      'mill or lathe',
      'coolant system',
      'spindle',
    ],
    keywords: ['cnc', 'machining', 'mill', 'lathe', 'spindle', 'coolant', 'toolchanger', 'vmc'],
    answer:
      'Yes — CNC and machine tool support, including the auxiliary systems around the machine that cause a surprising share of the downtime.\n\n' +
      'That means mechanical and auxiliary equipment troubleshooting, pumps, coolant systems, conveyors, motors and drives, fault isolation and restart support, and condition assessment for older or newly purchased machines.\n\n' +
      'Worth being direct about scope: this is independent maintenance support, not OEM control or servo repair work. When an OEM specialist is the right next step, you will be told.',
    links: [
      { label: 'CNC & machine tool support', href: '/services#cnc' },
      { label: 'Send machine details', href: '/contact' },
    ],
    followUps: ['Are you an authorized OEM service center?', 'We have a machine down', 'What equipment do you work on?'],
    leadIntent: true,
  },
  {
    id: 'pm-development',
    phrases: [
      'build a pm program',
      'create pm',
      'pm development',
      'develop a pm',
      'we have no pm',
      'dont have a pm program',
      'review our pm',
      'work instructions',
      'task list',
    ],
    keywords: ['develop', 'development', 'create', 'build', 'review', 'documentation', 'instruction', 'estimating', 'schedule'],
    answer:
      'Yes — the PM program itself can be built or overhauled before any recurring coverage starts.\n\n' +
      'That includes reviewing the equipment, creating new PMs or reviewing existing ones, estimating PM frequency and labor hours, defining lubrication, wear, alignment and condition checks, and writing work instructions, task lists and maintenance documentation.\n\n' +
      'It is a sensible first step when the equipment list is incomplete or nobody is confident the current PMs match the machines you actually run.',
    links: [
      { label: 'Program development', href: '/services#pm-development' },
      { label: 'Start a conversation', href: '/contact' },
    ],
    followUps: ['Do you do contract PM?', 'Can you assess our equipment first?', 'How is coverage priced?'],
    leadIntent: true,
  },
  {
    id: 'assessment',
    phrases: [
      'equipment assessment',
      'punch list',
      'assess our equipment',
      'we just bought',
      'acquisition',
      'used equipment',
      'aging equipment',
      'maintenance backlog',
      'where do we start',
      'dont know where to start',
    ],
    keywords: ['assessment', 'assess', 'punch', 'backlog', 'acquisition', 'aging', 'unknown', 'priority', 'prioritize', 'audit'],
    answer:
      'For unclear equipment situations — an acquisition, a startup, aging assets, or a maintenance backlog nobody has had time to sort — an assessment turns unknowns into an organized, prioritized action list.\n\n' +
      'That covers equipment assessment and punch-list development, priority ranking by safety, startup impact and risk, identifying parts, tooling, documentation and specialist-support needs, and job planning to build a workable backlog.\n\n' +
      'It is usually the cheapest way to find out what you are actually dealing with before committing to a bigger scope.',
    links: [
      { label: 'Assessments & punch lists', href: '/services#assessment' },
      { label: 'Describe your situation', href: '/contact' },
    ],
    followUps: ['Can you build the PM program first?', 'Do you do shutdown work?', 'Request maintenance coverage'],
    leadIntent: true,
  },
  {
    id: 'shutdown',
    phrases: [
      'shutdown support',
      'shut down',
      'planned outage',
      'outage',
      'turnaround',
      'installation support',
      'equipment install',
      'startup support',
      'project work',
      'project maintenance',
    ],
    keywords: ['shutdown', 'outage', 'turnaround', 'install', 'installation', 'startup', 'project', 'campaign'],
    answer:
      'Yes — additional maintenance capacity for planned outages, installations, startups, repairs, and project work where the internal team simply needs more hands on the floor.\n\n' +
      'That includes planned shutdown maintenance and inspections, equipment installation and startup support, backlog reduction and focused repair campaigns, and short-term project assignments.\n\n' +
      'Shutdown windows are unforgiving, so the earlier the dates and scope are known, the better the coverage can be built around them.',
    links: [
      { label: 'Shutdown & project support', href: '/services#shutdown' },
      { label: 'Request shutdown coverage', href: '/contact' },
    ],
    followUps: ['How is coverage priced?', 'How quickly can you start?', 'What areas do you serve?'],
    leadIntent: true,
  },

  /* ────────────────────────────  EQUIPMENT  ───────────────────────────── */
  {
    id: 'equipment',
    phrases: [
      'what equipment',
      'what machines',
      'do you work on',
      'types of equipment',
      'what can you fix',
      'conveyor',
      'packaging line',
      'palletizer',
    ],
    keywords: ['equipment', 'machine', 'conveyor', 'packaging', 'palletizer', 'motor', 'drive', 'pump', 'robot', 'hydraulic', 'pneumatic'],
    answer:
      'Coverage regularly includes CNC machines, conveyors, packaging lines, palletizers, motors and drives, pumps and coolant systems, and general production equipment.\n\n' +
      'The work spans mechanical, electrical and electromechanical troubleshooting, breakdown response, repairs, PM execution, inspections, and production-line support.\n\n' +
      'If you name the equipment you are running, the honest answer about fit is easy to give.',
    links: [{ label: 'Capabilities', href: '/services' }],
    followUps: ['Do you support CNC machines?', 'We have a machine down', 'Request maintenance coverage'],
  },

  /* ─────────────────────────────  PRICING  ────────────────────────────── */
  {
    id: 'pricing',
    phrases: [
      'how much',
      'what does it cost',
      'what do you charge',
      'your rate',
      'hourly rate',
      'price list',
      'get a quote',
      'ballpark',
    ],
    keywords: ['price', 'pricing', 'cost', 'charge', 'rate', 'quote', 'budget', 'expensive', 'fee', 'estimate'],
    answer:
      'There is no published rate card, and giving you a number here would be guessing.\n\n' +
      'Coverage is priced from the assignment itself: expected labor hours, shift schedule, required skills, travel, assignment duration, and the type of work involved. Those get converted into a block, weekly, monthly, shutdown, or term-based contract, so you get a clear contract price tied to the maintenance capacity you actually need. Recurring PM agreements are priced the same way, from the estimated hours across the contract.\n\n' +
      'Send the shift or schedule, expected duration, and equipment involved, and Olmem can scope it properly.',
    links: [
      { label: 'How pricing works', href: '/services' },
      { label: 'Request a scope', href: '/contact' },
    ],
    followUps: ['Request maintenance coverage', 'Do you do contract PM?', 'What is the process?'],
    leadIntent: true,
  },

  /* ─────────────────────────────  PROCESS  ────────────────────────────── */
  {
    id: 'process',
    phrases: [
      'what is the process',
      'how does it work',
      'how do we start',
      'next step',
      'getting started',
      'what happens after',
      'how do you set up',
    ],
    keywords: ['process', 'step', 'start', 'begin', 'procedure', 'onboard'],
    answer:
      'Four steps.\n\n' +
      'First, define the coverage — the shift, schedule, equipment, responsibilities, skills, and duration. Second, estimate the hours, including any travel or special support needs. Third, build the agreement, converting those hours into a block, weekly, monthly, shutdown, or term-based contract. Fourth, execute — troubleshooting, repairs, PMs, inspections, and day-to-day maintenance support as defined by the assignment.\n\n' +
      'It starts with a description of what you need covered.',
    links: [{ label: 'Request coverage', href: '/contact' }],
    followUps: ['How is coverage priced?', 'How quickly can you start?', 'Request maintenance coverage'],
    leadIntent: true,
  },
  {
    id: 'availability',
    phrases: [
      'how quickly',
      'how soon',
      'when can you start',
      'are you available',
      'availability',
      'lead time',
      'this week',
      'right away',
    ],
    keywords: ['quickly', 'soon', 'available', 'availability', 'schedule', 'when', 'immediately', 'timeline'],
    answer:
      'Availability depends on what is already scheduled and what the assignment involves, so I will not promise a start date on the website.\n\n' +
      'The fastest way to get a real answer is to send the shift or dates you need covered, the expected duration, and the equipment involved — then Olmem can tell you directly what is possible.',
    links: [{ label: 'Send your dates', href: '/contact' }],
    followUps: ['Request maintenance coverage', 'What areas do you serve?', 'How is coverage priced?'],
    leadIntent: true,
  },

  /* ────────────────────────────  SERVICE AREA  ─────────────────────────── */
  {
    id: 'area',
    phrases: [
      'what areas',
      'where are you located',
      'do you serve',
      'service area',
      'how far do you travel',
      'do you travel',
      'are you near',
      'located in',
    ],
    keywords: ['area', 'location', 'located', 'serve', 'travel', 'near', 'kenosha', 'racine', 'milwaukee', 'wisconsin', 'illinois', 'chicago'],
    answer:
      'Primary coverage is Southeast Wisconsin and Northeast Illinois, centered on the Kenosha-area corridor.\n\n' +
      'In Wisconsin that typically means Kenosha, Racine, Oak Creek, Franklin, Pleasant Prairie, Bristol, Burlington, Milwaukee’s south side, Walworth County and the surrounding industrial areas. In Illinois, Lake County and nearby communities.\n\n' +
      'For larger projects, shutdown work, or specialized equipment support, travel beyond the normal area may be available — location and travel expectations get confirmed before work begins. If you name your city, that question gets a straight answer.',
    links: [
      { label: 'Service area', href: '/service-area' },
      { label: 'Ask about your location', href: '/contact' },
    ],
    followUps: ['Request maintenance coverage', 'What services do you offer?', 'How quickly can you start?'],
  },

  /* ────────────────────────────  HAND-OFF  ────────────────────────────── */
  {
    id: 'contact',
    phrases: [
      'contact you',
      'get in touch',
      'talk to someone',
      'speak to someone',
      'request service',
      'request coverage',
      'reach you',
      'phone number',
      'email address',
      'call you',
    ],
    keywords: ['contact', 'touch', 'reach', 'call', 'phone', 'email', 'talk', 'speak', 'request', 'inquire'],
    answer:
      'The service request form is the way in — it goes straight to Olmem and gets answered directly.\n\n' +
      'I can also take your details right here and pass them along, which saves you filling in the form.\n\n' +
      'Either way, the more detail up front the better: facility location, the shift or schedule you need covered, expected duration, equipment involved, and whether the need is temporary, recurring, or project-based.',
    links: [{ label: 'Request service', href: '/contact' }],
    followUps: ['Request maintenance coverage'],
    leadIntent: true,
  },
];
