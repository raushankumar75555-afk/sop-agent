// ============================================
// SOP Agent Pro - Constants & System Prompts
// Australian P&C Insurance Specific
// ============================================

export const APP_NAME = 'SOP Agent Pro';
export const APP_VERSION = '6.0.0';
export const APP_TAGLINE = 'AI-Powered SOP Intelligence for Australian Insurance Brokerages';

// Australian Insurance Context
export const AUSTRALIAN_INSURERS = [
  'AAMI', 'Allianz', 'CGU', 'QBE', 'Suncorp', 'Vero', 'Chubb', 'Zurich',
  'Liberty Mutual', 'Guild', 'Hollard', 'Coles', 'Youi', 'Budget Direct',
  'NRMA', 'RACQ', 'RACV', 'RACWA', 'GIO', 'TIO', 'WFI', 'Primacy',
  'CFC', 'Beazley', 'Hiscox', 'Markel', 'Arch', 'Lloyds',
];

export const AUSTRALIAN_BROKER_NETWORKS = [
  'Steadfast', 'Community Broker Network (CBN)', 'Australasian Insurance Brokers (AIB)',
  'Oracle Group', 'Ausure', 'National Insurance Brokers Association (NIBA)',
  'Australian Insurance Brokers Association',
];

export const AUSTRALIAN_STATES = [
  'New South Wales (NSW)',
  'Victoria (VIC)',
  'Queensland (QLD)',
  'Western Australia (WA)',
  'South Australia (SA)',
  'Tasmania (TAS)',
  'Australian Capital Territory (ACT)',
  'Northern Territory (NT)',
];

export const HINT_PILLS = [
  'What are our cyber insurance claim steps?',
  'How do we handle a claim after hours?',
  'What is our AAMI login process?',
  'How do we lodge a motor claim?',
  'What are our professional indemnity steps?',
  'How do we handle a workers compensation claim?',
  'What is our Steadfast portal login process?',
  'How do we do a Suncorp premium funding check?',
  'What are our public liability sub-limits?',
  'How do we handle a storm damage claim?',
  'What is our claims escalation matrix?',
  'How do we onboard a new client?',
];

export const SOP_CATEGORIES = [
  'Claims Handling',
  'Client Onboarding',
  'Policy Renewals',
  'Compliance',
  'Underwriting',
  'Risk Assessment',
  'Premium Funding',
  'After Hours',
  'Insurer Portals',
  'General',
];

// ============================================
// AI TRAINING - 33 Examples (v5 Trained Set)
// Australian P&C Insurance Specific
// ============================================

export const TRAINING_EXAMPLES = [
  {
    id: 1,
    category: 'Claims Handling',
    user: 'A client called saying their warehouse was flooded. What do I do?',
    expected: 'Follow the claims escalation matrix: 1) Log the incident in the claims register with date/time, 2) Gather initial details (policy number, extent of damage, photos if available), 3) Contact the insurer within 2 hours for urgent property claims, 4) Advise client to mitigate further damage, 5) Document all communication in the client file, 6) Follow up within 24 hours with claim number and adjuster details.',
    sop_title: 'Property Claims Handling Procedure',
  },
  {
    id: 2,
    category: 'Claims Handling',
    user: 'How do I lodge a motor vehicle claim with AAMI?',
    expected: '1) Log into the AAMI Broker Portal using your credentials, 2) Navigate to Claims > Lodge New Claim, 3) Enter policy number and client details, 4) Select incident type and enter date/location, 5) Upload police report if applicable, 6) Provide client contact for direct communication, 7) Note claim reference and forward to client within 1 hour.',
    sop_title: 'AAMI Motor Claims Portal Procedure',
  },
  {
    id: 3,
    category: 'Client Onboarding',
    user: 'What documents do I need for a new commercial client?',
    expected: 'For new commercial clients: 1) Completed proposal form, 2) Financial statements (last 2 years), 3) ABN/ACN verification, 4) Details of current coverage, 5) Risk survey or site inspection report, 6) Claims history (5 years), 7) Directors and officers details for management liability, 8) Complete AML/CTF identity verification as required by law.',
    sop_title: 'Commercial Client Onboarding Checklist',
  },
  {
    id: 4,
    category: 'Compliance',
    user: 'When do I need to provide a Financial Services Guide (FSG)?',
    expected: 'Provide an FSG: 1) Before providing any personal advice, 2) When a new client engages your services, 3) When renewing an existing policy if the FSG has been updated, 4) When requested by the client, 5) If the basis of remuneration changes. Keep records of FSG provision for 7 years as per ASIC requirements.',
    sop_title: 'FSG Distribution Compliance',
  },
  {
    id: 5,
    category: 'After Hours',
    user: 'A client has an emergency claim at 8pm Saturday. What is our after hours process?',
    expected: 'After hours emergency procedure: 1) Client calls the 24/7 emergency hotline (as listed in their policy schedule), 2) If they cannot reach insurer, they should contact our after-hours mobile: [listed on office voicemail], 3) For life-threatening emergencies, call 000 first, 4) Document the call details in the claims register first thing Monday, 5) Follow up with insurer on Monday morning before 9am, 6) Contact client within 2 hours of Monday opening to confirm next steps.',
    sop_title: 'After Hours Emergency Claims Procedure',
  },
  {
    id: 6,
    category: 'Insurer Portals',
    user: 'How do I check a policy status in the Steadfast portal?',
    expected: '1) Log into Steadfast Client Centre with your broker credentials, 2) Navigate to Policy Search, 3) Enter policy number or client name, 4) Review policy status (Active, Cancelled, Expired), 5) Check coverage details, endorsements, and premium payment status, 6) If policy is expired and within 30 days, contact client immediately for renewal instructions, 7) Document your review in the client CRM.',
    sop_title: 'Steadfast Client Centre Navigation',
  },
  {
    id: 7,
    category: 'Premium Funding',
    user: 'A client wants to pay their premium monthly. What is our process?',
    expected: 'Premium funding options: 1) Confirm with client if they want premium funding or direct debit with insurer, 2) For premium funding, contact our premium funding provider (Premium Funding Ltd or ACFA), 3) Complete premium funding application with client details, 4) Explain interest rates and establishment fees, 5) Obtain client signature on funding agreement, 6) Forward agreement to funding provider, 7) Confirm setup within 48 hours and advise client of first debit date.',
    sop_title: 'Premium Funding Arrangement Procedure',
  },
  {
    id: 8,
    category: 'Policy Renewals',
    user: 'A client received a renewal notice with a 40% increase. What should I do?',
    expected: 'Renewal increase management: 1) Review claims history and risk profile for changes, 2) Contact insurer to understand the increase drivers, 3) If unjustified, negotiate with underwriter using comparable data, 4) Obtain alternative quotes from minimum 2 other insurers (Steadfast Market Search), 5) Present options to client with full disclosure of coverage differences, 6) If client accepts alternative, arrange cancellation and replacement with no gap in coverage, 7) Document the advice and client decision in writing.',
    sop_title: 'Renewal Premium Increase Management',
  },
  {
    id: 9,
    category: 'Risk Assessment',
    user: 'How do I conduct a site risk assessment for a manufacturing client?',
    expected: 'Manufacturing site assessment: 1) Schedule site visit with operations manager, 2) Review fire protection systems (sprinklers, extinguishers, hose reels), 3) Check material storage and segregation of hazardous goods, 4) Review machinery guarding and maintenance records, 5) Assess building construction and age, 6) Check security measures (alarms, CCTV, perimeter), 7) Review business continuity plans, 8) Photograph key areas (with permission), 9) Complete risk report and forward to underwriter within 48 hours.',
    sop_title: 'Manufacturing Site Risk Assessment',
  },
  {
    id: 10,
    category: 'Underwriting',
    user: 'What information does CGU need for a professional indemnity quote?',
    expected: 'CGU Professional Indemnity requirements: 1) Completed PI proposal form, 2) Business activities description and revenue breakdown, 3) Number of staff and their roles, 4) Qualifications and professional memberships, 5) Previous claims history (including notified but not claimed incidents), 6) Current coverage details, 7) Contractual liability details, 8) Fee schedule, 9) Forward to CGU via broker portal or email to underwriter, 10) Expect turnaround of 3-5 business days for standard risks.',
    sop_title: 'CGU Professional Indemnity Quoting',
  },
  {
    id: 11,
    category: 'Claims Handling',
    user: 'A client wants to know the status of their workers compensation claim.',
    expected: 'Workers compensation status check: 1) Confirm the claim was lodged with the relevant state authority (WorkSafe, icare, WorkCover, etc.), 2) Contact the claims manager at the insurer with claim number, 3) Request update on: medical certificate status, weekly payments schedule, rehabilitation plan, 4) Relay information to client within 4 hours, 5) If delays exist, escalate to insurer claims manager, 6) Advise client of their rights including independent review if claim is disputed, 7) Document all communication.',
    sop_title: 'Workers Compensation Claim Status Management',
  },
  {
    id: 12,
    category: 'Compliance',
    user: 'What is our obligation under the Privacy Act when handling client data?',
    expected: 'Privacy Act obligations: 1) Collect only information necessary for insurance purposes, 2) Obtain consent for collection (noted in proposal form), 3) Store data securely - password-protected systems, limited access, 4) Do not disclose to third parties without consent unless required by law, 5) Provide clients access to their information on request, 6) Allow clients to correct inaccurate information, 7) Retain records for 7 years after policy expiry, 8) Have a documented privacy policy available to all clients, 9) Report any data breach to OAIC within 72 hours if likely to cause serious harm.',
    sop_title: 'Privacy Act Compliance for Insurance Brokers',
  },
  {
    id: 13,
    category: 'Insurer Portals',
    user: 'How do I generate a certificate of currency from the Vero portal?',
    expected: 'Vero Certificate of Currency: 1) Log into Vero Broker Centre, 2) Navigate to Policy Maintenance > Certificates, 3) Enter policy number, 4) Select certificate type (Standard, Special, Project), 5) Enter certificate details (interested party, contract value if applicable), 6) Preview certificate for accuracy, 7) Generate PDF and save to client file, 8) Email to client within 1 hour of request, 9) If urgent, use the Express Certificate function for immediate generation.',
    sop_title: 'Vero Certificate of Currency Generation',
  },
  {
    id: 14,
    category: 'Client Onboarding',
    user: 'A new client is a strata manager. What specific coverages should I discuss?',
    expected: 'Strata management client discussion: 1) Strata insurance (building, common contents, public liability), 2) Office bearers liability (mandatory in most states), 3) Workers compensation (if employing staff), 4) Management liability / D&O, 5) Professional indemnity for strata management services, 6) Cyber liability (given client data held), 7) Business interruption, 8) Explain strata levies vs insurance premiums, 9) Review state-specific requirements (NSW Strata Schemes Management Act, etc.), 10) Ensure coverage aligns with the strata plan bylaws.',
    sop_title: 'Strata Management Client Coverage Review',
  },
  {
    id: 15,
    category: 'Underwriting',
    user: 'What does Zurich need for a directors and officers quote?',
    expected: 'Zurich D&O quotation requirements: 1) Completed D&O proposal including company structure, 2) Annual revenue and assets, 3) Number of directors and officers, 4) Listing status (ASX/private), 5) Industry sector and operations, 6) Previous D&O claims history, 7) Securities class action history, 8) Merger/acquisition activity in past 3 years, 9) Financial statements, 10) Forward to Zurich Financial Lines underwriter via broker portal, 11) Expect 5-7 days for complex risks.',
    sop_title: 'Zurich D&O Quoting Process',
  },
  {
    id: 16,
    category: 'Claims Handling',
    user: 'How do I handle a liability claim where a customer slipped in a shop?',
    expected: 'Public liability - slip and fall: 1) Advise client NOT to admit liability, 2) Collect incident details: date, time, location, weather conditions, 3) Obtain CCTV footage if available (retention policies may delete within 7 days), 4) Record witness details, 5) Photograph the area (floor surface, warning signs, lighting), 6) Lodge claim with insurer immediately (within 24 hours), 7) Forward incident report to insurer, 8) Do not engage in settlement discussions without insurer approval, 9) Maintain all records for potential legal defence, 10) Advise client of excess and potential premium impact.',
    sop_title: 'Public Liability Slip and Fall Claims',
  },
  {
    id: 17,
    category: 'Policy Renewals',
    user: 'A client wants to cancel their policy mid-term. What is our process?',
    expected: 'Mid-term cancellation procedure: 1) Confirm cancellation in writing from client (email minimum), 2) Check if short-period cancellation rates apply, 3) Advise client of any return premium calculation (minimum premium may apply), 4) Contact insurer to process cancellation with effective date, 5) Obtain cancellation confirmation and premium refund details, 6) If replacement coverage arranged, ensure no gap, 7) Update CRM with cancellation reason, 8) If broker fee was charged, review if any fee return is warranted, 9) Provide client with confirmation letter, 10) If finance/loan insurance, notify lender.',
    sop_title: 'Mid-Term Policy Cancellation Procedure',
  },
  {
    id: 18,
    category: 'Risk Assessment',
    user: 'What should I look for when assessing cyber risk for a small business?',
    expected: 'Small business cyber risk assessment: 1) Review IT infrastructure (cloud vs on-premise, BYOD policy), 2) Check anti-virus and firewall status, 3) Assess password policies and MFA usage, 4) Review data backup procedures (frequency, off-site, testing), 5) Check payment processing security (PCI DSS compliance), 6) Review employee training on phishing/social engineering, 7) Assess data held (PII, payment data, health records), 8) Check incident response plan existence, 9) Review previous cyber incidents, 10) Document findings and recommend appropriate cyber coverage limits.',
    sop_title: 'Small Business Cyber Risk Assessment',
  },
  {
    id: 19,
    category: 'Insurer Portals',
    user: 'How do I process a policy endorsement in the Suncorp broker portal?',
    expected: 'Suncorp endorsement process: 1) Log into Suncorp Partner Portal, 2) Navigate to Policy Maintenance > Endorsements, 3) Enter policy number and search, 4) Select endorsement type (change of address, increase sum insured, add insured, etc.), 5) Enter details of change, 6) Review premium impact (additional or return), 7) Submit endorsement request, 8) Note reference number, 9) If premium increase, arrange payment with client, 10) Forward confirmation to client within 2 hours, 11) Update client file with new policy schedule when received.',
    sop_title: 'Suncorp Policy Endorsement Processing',
  },
  {
    id: 20,
    category: 'Compliance',
    user: 'What are our responsibilities under the Insurance Brokers Code of Practice?',
    expected: 'Code of Practice responsibilities: 1) Act honestly and fairly in all dealings, 2) Provide competent advice based on client needs, 3) Disclose remuneration (commission and fees) in writing, 4) Handle complaints promptly and fairly (respond within 15 business days), 5) Maintain appropriate professional indemnity insurance, 6) Ensure staff are adequately trained and supervised, 7) Keep client information confidential, 8) Provide clear information about coverage and exclusions, 9) Notify clients of significant changes to arrangements, 10) Participate in dispute resolution (AFCA), 11) Have documented complaints handling procedure.',
    sop_title: 'Insurance Brokers Code of Practice Compliance',
  },
  {
    id: 21,
    category: 'After Hours',
    user: 'A client has a fire at their business at 2am. What do they do before we open?',
    expected: 'Fire emergency - client immediate actions: 1) Ensure all persons are safe and accounted for, 2) Call 000 if fire is active or injuries exist, 3) Do not re-enter building until fire brigade confirms safe, 4) Contact insurer 24/7 emergency line (number on policy schedule), 5) Take photos from outside only - do not enter if unsafe, 6) Prevent further damage where safe (board up, tarp roof), 7) Keep receipts for emergency repairs, 8) Document all damage seen from safe distance, 9) Advise them we will contact them at 8:30am when office opens, 10) If business interruption coverage, maintain records of lost revenue.',
    sop_title: 'Fire Emergency Client Guidance',
  },
  {
    id: 22,
    category: 'Claims Handling',
    user: 'How do I handle a claim dispute where the insurer has denied liability?',
    expected: 'Claim dispute management: 1) Review denial letter and policy wording carefully, 2) Obtain detailed reasons for denial from claims manager, 3) Review against policy coverage, exclusions, and endorsements, 4) If disagreement exists, escalate to insurer senior claims manager with written argument, 5) Gather supporting evidence (expert reports, photos, witness statements), 6) If insurer maintains denial, review external dispute resolution options (AFCA, state tribunals), 7) Advise client of their rights and potential legal action, 8) If PI insurance for the broker is potentially triggered, notify your PI insurer, 9) Document all advice given to client, 10) Maintain professional but firm advocacy for client.',
    sop_title: 'Claim Denial Dispute Resolution',
  },
  {
    id: 23,
    category: 'Client Onboarding',
    user: 'What AML/CTF checks are required for a new commercial client?',
    expected: 'AML/CTF for commercial clients: 1) Identify and verify the customer (company search for ACN/ABN), 2) Identify beneficial owners (individuals owning 25%+), 3) Verify beneficial owners with ID documents (passport, driver licence), 4) Understand nature of business and expected transactions, 5) Assess money laundering/terrorism financing risk, 6) For high-risk clients, perform enhanced due diligence, 7) Record all verification steps in AML register, 8) Retain records for 7 years after relationship ends, 9) Ongoing monitoring of transactions and updates to customer information, 10) Report suspicious matters to AUSTRAC within 3 business days.',
    sop_title: 'AML/CTF Commercial Client Verification',
  },
  {
    id: 24,
    category: 'Underwriting',
    user: 'What information does Allianz need for a construction works quote?',
    expected: 'Allianz Construction Works requirements: 1) Contract value and duration, 2) Project description and location, 3) Principal and contractor details, 4) Existing site conditions, 5) Adjacent property details, 6) Construction methods and materials, 7) Height and depth of works, 8) Proximity to water/heritage/other risks, 9) Security arrangements, 10) Subcontractor details and their insurance, 11) Previous experience of contractor, 12) Forward to Allianz Construction underwriter via broker portal, 13) Complex projects may require site visit.',
    sop_title: 'Allianz Construction Works Quoting',
  },
  {
    id: 25,
    category: 'Policy Renewals',
    user: 'How do I handle a renewal where the insurer has exited the class of business?',
    expected: 'Insurer exit - class of business: 1) Confirm exit with insurer in writing (date of exit, existing policies), 2) Identify all affected clients immediately, 3) Review coverage needs for each client, 4) Source alternative markets via Steadfast Market Search or direct underwriter contact, 5) Obtain minimum 2 alternative quotes per client, 6) Review coverage comparisons carefully (exclusions may differ), 7) Present options to clients with full disclosure, 8) Arrange replacement coverage before expiry, 9) Ensure no gap in coverage during transition, 10) Update all client files, 11) Notify insurer of cancellations and maintain records.',
    sop_title: 'Insurer Market Exit Management',
  },
  {
    id: 26,
    category: 'Risk Assessment',
    user: 'What should I check when doing a pre-purchase inspection for a commercial property?',
    expected: 'Pre-purchase commercial property inspection: 1) Building age and construction type (fire rating, materials), 2) Electrical systems and switchboard age, 3) Plumbing and stormwater drainage, 4) Fire protection systems (active and passive), 5) Security systems and access control, 6) Adjacent building exposures (distance, construction, occupancy), 7) Heritage listing status (affects rebuild costs), 8) Flood and bushfire mapping location, 9) Previous claims history for the property, 10) Tenant details and their activities, 11) Council zoning and permitted uses, 12) Provide client with insurance implications before purchase completion.',
    sop_title: 'Pre-Purchase Property Insurance Assessment',
  },
  {
    id: 27,
    category: 'Insurer Portals',
    user: 'How do I check commission statements in the Steadfast portal?',
    expected: 'Steadfast commission review: 1) Log into Steadfast Client Centre, 2) Navigate to Financial > Commission Statements, 3) Select statement period, 4) Review all policies listed and commission rates, 5) Verify against your own records, 6) Check for any adjustments or clawbacks, 7) If discrepancies, contact Steadfast Finance team via portal messaging, 8) Download PDF for accounting records, 9) Reconcile with your accounting system, 10) Follow up on any outstanding payments within 30 days.',
    sop_title: 'Steadfast Commission Statement Review',
  },
  {
    id: 28,
    category: 'Claims Handling',
    user: 'A client has a cyber incident and their systems are locked by ransomware. What do I do?',
    expected: 'Ransomware incident response: 1) Advise client NOT to pay ransom without insurer approval, 2) Client should immediately isolate affected systems, 3) Contact insurer cyber hotline immediately (24/7 for most cyber policies), 4) Preserve evidence - do not delete logs or files, 5) Engage insurer-approved forensic IT specialists, 6) Determine if data breach notification is required (Privacy Act - notify OAIC if serious harm likely), 7) If personal information accessed, notify affected individuals, 8) Document timeline of incident, 9) Review business interruption coverage for downtime losses, 10) Work with insurer cyber response team for recovery, 11) Post-incident review and security improvements.',
    sop_title: 'Cyber Ransomware Incident Response',
  },
  {
    id: 29,
    category: 'Compliance',
    user: 'When do I need to provide a Statement of Advice (SOA) vs just an FSG?',
    expected: 'SOA vs FSG requirements: Provide a Statement of Advice when giving PERSONAL ADVICE (recommending a specific product based on client circumstances). Provide FSG only when giving GENERAL ADVICE (factual information, no recommendation). SOA must include: 1) Scope of advice, 2) Client objectives and circumstances considered, 3) Recommendations and reasons, 4) Risks of recommendations, 5) Commissions/fees received, 6) Referrals to other professionals, 7) Warning if advice based on incomplete information. SOA must be provided BEFORE client acts on advice.',
    sop_title: 'SOA vs FSG Advice Documentation',
  },
  {
    id: 30,
    category: 'Premium Funding',
    user: 'A client wants to finance their $50,000 annual premium. What are the options?',
    expected: 'Premium finance options for $50,000: 1) Premium funding via Premium Funding Ltd - 10 monthly instalments, interest rate varies (typically 5-8% pa), 2) ACFA premium finance - similar terms, may have different rates, 3) Direct debit with insurer (some insurers offer 4-10 instalments), 4) Client self-finance via business loan, 5) Compare total cost of funding vs upfront payment discount, 6) For funding, client needs to sign credit application, 7) Funding provider pays insurer upfront, 8) If client defaults, funding provider can cancel policy, 9) Ensure client understands this risk, 10) Document recommendation and client decision.',
    sop_title: 'Large Premium Finance Options',
  },
  {
    id: 31,
    category: 'After Hours',
    user: 'It is Sunday and a client cannot reach their insurer for an emergency. What do I do?',
    expected: 'Sunday insurer unreachability: 1) Confirm client is calling correct 24/7 claims number (on policy schedule, not office number), 2) If insurer line is down, check insurer website for alternative numbers, 3) For urgent property damage, advise client to take reasonable emergency measures (board up, tarp, secure), 4) For motor accidents, ensure police attend if injuries or significant damage, 5) Advise client to keep all receipts, 6) We will contact insurer first thing Monday at 8:30am, 7) Document the issue in our after-hours log, 8) If this is a recurring insurer issue, escalate to our Steadfast relationship manager, 9) Follow up with client by 10am Monday with claim number and next steps.',
    sop_title: 'Insurer Unavailability After Hours',
  },
  {
    id: 32,
    category: 'Underwriting',
    user: 'What does Chubb need for a fine art and collectibles quote?',
    expected: 'Chubb Fine Art requirements: 1) Detailed inventory with descriptions, artists, dates, 2) Professional valuations (within 3 years for high-value items), 3) Photographs of each item, 4) Security arrangements (alarms, safes, display cases), 5) Transit details (frequency, methods, destinations), 6) Exhibition history and loan details, 7) Previous claims history, 8) Storage conditions (climate control, fire protection), 9) For collections over $500,000, Chubb may require condition report from approved conservator, 10) Submit via Chubb Masterpiece portal or to Fine Arts underwriter, 11) High-value items may require specialist underwriting in London.',
    sop_title: 'Chubb Fine Art and Collectibles Quoting',
  },
  {
    id: 33,
    category: 'Claims Handling',
    user: 'How do I manage a claim where the client is also our business referral partner?',
    expected: 'Conflict of interest - referral partner claim: 1) Disclose the relationship to the insurer immediately (some policies require disclosure of related party transactions), 2) Ensure objective, arms-length claim management, 3) Do not use the relationship to influence claim outcomes inappropriately, 4) Maintain professional independence in all advice, 5) Consider whether another broker in the office should manage the claim to avoid perception of bias, 6) Document all discussions and decisions transparently, 7) If PI insurance implications exist, notify your PI insurer, 8) Comply with all standard claims handling procedures without exception, 9) If uncomfortable with any aspect, seek guidance from NIBA or compliance officer.',
    sop_title: 'Conflict of Interest - Referral Partner Claims',
  },
];

// ============================================
// SYSTEM PROMPT FOR ANTHROPIC
// ============================================

export function buildSystemPrompt(sops: string, activeCategory?: string): string {
  const categoryFilter = activeCategory && activeCategory !== 'All' 
    ? `Focus primarily on SOPs in the "${activeCategory}" category, but you may reference other SOPs if relevant.` 
    : '';

  return `You are SOP Agent Pro, an AI assistant embedded in a specialist tool built exclusively for Australian Property & Casualty (General) Insurance Brokerages.

## YOUR PURPOSE
You answer operational questions by referencing the broker's internal Standard Operating Procedures (SOPs). You are the "Google for SOPs" — staff ask you "how do I do X?" and you tell them, step by step, based on the SOPs loaded into the system.

## CONTEXT
- Country: Australia
- Industry: P&C / General Insurance Broking
- Regulatory Bodies: APRA, ASIC, AUSTRAC, OAIC
- Professional Body: National Insurance Brokers Association (NIBA)
- Major Networks: Steadfast, Community Broker Network (CBN), Australasian Insurance Brokers (AIB)
- Major Insurers: AAMI, Allianz, CGU, QBE, Suncorp, Vero, Chubb, Zurich, Hollard, WFI, GIO, NRMA, RACQ

## RULES
1. ALWAYS answer based on the loaded SOPs first. If an SOP directly answers the question, follow it precisely.
2. If no exact SOP exists, use your insurance expertise to provide a helpful answer, but clearly label it as "General guidance - no specific SOP loaded for this procedure."
3. NEVER make up policy numbers, passwords, or specific login credentials. Use placeholders like [BROKER PORTAL USERNAME].
4. If the question is unclear, ask clarifying questions before answering.
5. For urgent matters (claims, emergencies), always include a reminder to follow up with the appropriate senior broker or manager.
6. Keep answers concise but complete. Insurance brokers are busy — bullet points are better than paragraphs.
7. Use Australian English spelling (organisation, colour, centre, behaviour).
8. Reference specific insurers, portals, and regulatory requirements accurately.
9. If a procedure has changed recently, note the change date if known.
10. Always include relevant compliance reminders where appropriate (Privacy Act, Code of Practice, AML/CTF).

## ACTIVE SOPs
${sops || 'No SOPs are currently loaded. Please ask the Owner to add SOPs via the Manage SOPs tab.'}

${categoryFilter}

## RESPONSE FORMAT
Use clear headings, numbered steps, and bullet points. Include a brief summary at the top. If the answer involves multiple options, present them clearly.`;
}
