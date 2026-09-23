import type { AppState, SourceRecord } from './types';

function source(record: Omit<SourceRecord, 'fullText'>, context: string): SourceRecord {
  return {
    ...record,
    fullText: `${record.excerpt}\n\n${context}\n\nSYNTHETIC DEMONSTRATION RECORD. All names, identifiers, case numbers, organizations and events are fictional and created for SIH 2026 prototype purposes only. This record does not represent any real person, active investigation, or government database.`,
  };
}

const initial: AppState = {
  schemaVersion: 1,

  cases: [
    {
      id: 'c1',
      reference: 'FIR-409/2026/NZ',
      title: 'State vs. Tariq Ahmed @ Doctor & Syndicate 11',
      district: 'NCR & Transit',
      station: 'PS Special Cell, New Delhi',
      status: 'Active',
      updated: '2026-02-14T18:40:00.000Z',
      officer: 'Insp. Rajesh Varma',
      classification: 'S-2 RESTRICTED',
      summary: 'Multi-agency investigation into hawala network operating under cover of logistics firms. Suspect Tariq Ahmed (alias Doctor) coordinated bulk cash movements through transit corridors. CDR analysis reveals 142 contact events with known couriers. Three related FIRs across NCR, Haryana and UP.',
      linkedCases: ['FIR-112/2025', 'FIR-089/2026'],
    },
    {
      id: 'c2',
      reference: 'FIR-112/2025',
      title: 'Faridabad Cargo Theft — Syndicate Link',
      district: 'Faridabad',
      station: 'PS Ballabhgarh',
      status: 'Under review',
      updated: '2026-01-20T10:15:00.000Z',
      officer: 'SI P. Mathur',
      summary: 'Cargo theft from industrial corridor. Same device IMEI appears in FIR-409/2026/NZ call records from Faridabad tower 404-10-B831. 6 overlapping contact events during 22-minute window.',
      linkedCases: ['FIR-409/2026/NZ'],
    },
    {
      id: 'c3',
      reference: 'FIR-089/2026',
      title: 'NCR Financial Fraud — Shell Accounts',
      district: 'NCR South',
      station: 'PS Lajpat Nagar',
      status: 'Active',
      updated: '2026-02-10T14:30:00.000Z',
      officer: 'Insp. M. Rao',
      summary: 'Fraudulent NEFT transactions through shell accounts linked to Axis Bank Surat ledger SL-91. Beneficiary account ending 2190 traces to Sunita Devi. Three payments totaling Rs.14,50,000 match entries in the Surat ledger.',
      linkedCases: ['FIR-409/2026/NZ'],
    },
  ],

  sources: [
    source(
      { id: 'FIR-409', caseId: 'c1', title: 'Initial FIR — State vs. Tariq Ahmed', type: 'FIR', date: '2026-01-02', pages: 8, excerpt: 'Complaint names Tariq Ahmed (alias Doctor) and reports cash deliveries in Chandni Chowk. Reference: Section 154 CrPC. Complainant identified suspect coordinating bulk currency transfers through logistics front companies.' },
      'Page 3, paragraph 2. Suspect described arriving at Chandni Chowk branch on multiple occasions with sealed packages. Two witnesses corroborate cash handover on 28 December 2025. Formal charge sheet filing window: 90 days from registration.'
    ),
    source(
      { id: 'CDR-004', caseId: 'c1', title: 'Call Detail Record — +91 98102-44109', type: 'CDR', date: '2026-02-14', pages: 6, excerpt: 'Airtel tower record shows activity for +91 98102-44109 at 18:05:22 IST, followed by a disconnection at Chandni Chowk tower. 142 contact events across 14 Feb 2026. Device IMEI: 864218...' },
      'Page 2, rows 12-17. CDR extract covers 14 Feb 2026 17:30-19:30 IST window. Tower 404-CH-01 (Chandni Chowk). Subscriber identity verified by Airtel telecom authority. The same device IMEI appears in FIR-112/2025 Faridabad records at tower 404-10-B831 with 6 overlaps during a 22-minute window.'
    ),
    source(
      { id: 'FIN-001', caseId: 'c1', title: 'Bank Transfer Record — Rs.45,00,000 NEFT', type: 'Financial', date: '2026-02-14', pages: 4, excerpt: 'Axis Bank Surat ledger SL-91 records Rs.45,00,000 NEFT transfer at 17:42:10 IST via V.K. Logistics routing. Cash withdrawal at Chandni Chowk branch 12 minutes later.' },
      'Page 1, transaction summary. NEFT reference AXIS-NZ-20260214-4421. Remitter: 001920-88123 (Hawala Primary Hub - ICICI). Beneficiary: Account ending 2190, registered to sharma.enterprises@okaxis. Three payments totaling Rs.14,50,000 in ledger SL-91 match FIR-089/2026 entries.'
    ),
    source(
      { id: 'ANPR-001', caseId: 'c1', title: 'ANPR Record — DL-1C-AA-0921', type: 'ANPR', date: '2026-02-14', pages: 2, excerpt: 'Silver Hyundai Creta passed Ring Road Junction 04 at Kherki Daula Toll toward Jaipur, 14 minutes after the call. Toll record confirmed at 18:22:15 IST.' },
      'Page 1. Toll camera CAM-DL-RR-0044 captured plate DL-1C-AA-0921 at 18:22:15 IST. Vehicle registered to Vikramaditya Malhotra, V.K. Logistics and Transport. Road distance from Chandni Chowk: 4.2 km.'
    ),
    source(
      { id: 'CCTV-001', caseId: 'c1', title: 'CCTV — ISBT Kashmere Gate, Gate 2', type: 'CCTV', date: '2026-02-14', pages: 3, excerpt: 'CAM-DL-KG-0418 at Gate 2 recorded plate DL-1C-AA-0921 at 18:39:12 IST. 94.2% match score. 2 occupants visible. Vehicle moving toward departure sector.' },
      'Frame 034,289 of 056,000. Recording duration: 00:03:00.000. Second bounding box: Adult male, 88.0% confidence. Vehicle entered at 18:38:46 and exited Gate 2 at 18:39:12.'
    ),
    source(
      { id: 'STAT-001', caseId: 'c1', title: 'Witness Statement — Location Confirmation', type: 'Statement', date: '2026-02-14', pages: 2, restricted: true, excerpt: 'Protected witness statement confirming suspect presence at Chandni Chowk at 18:00 IST. Statement is restricted and excluded from report exports.' },
      'Access note. This synthetic protected statement is represented only by a redacted summary. No direct identifiers are included.'
    ),
    source(
      { id: 'CDR-007', caseId: 'c2', title: 'CDR — Faridabad Tower Cross-reference', type: 'CDR', date: '2026-01-18', pages: 4, excerpt: 'Same device IMEI appears in Faridabad FIR-112/2025 records from tower 404-10-B831. 6 overlapping contact events during 22-minute window on 18 Jan 2026.' },
      'Page 3. IMEI 864218 present at Faridabad tower during cargo theft window. Cross-case link requires subscriber verification and independent corroboration before attribution.'
    ),
    source(
      { id: 'FIN-003', caseId: 'c3', title: 'Axis Bank Surat — Ledger SL-91 Extract', type: 'Financial', date: '2026-02-08', pages: 6, excerpt: 'Three payments totaling Rs.14,50,000 match entries in Surat ledger SL-91. They occurred within 18 minutes of the reported delivery. Beneficiary account ending 2190.' },
      'Ledger extract provided by Axis Bank compliance. Beneficiary display name: sharma.enterprises. Account holder Sunita Devi - verification pending at time of extract. S.41A CrPC notice issued.'
    ),
  ],

  entities: [
    { id: 'e-tariq',  label: 'Tariq Ahmed',               kind: 'Person',       subtitle: 'Alias: Doctor — NCR/Srinagar',        caseIds: ['c1','c2'], x: 280, y: 200, status: 'IN CUSTODY',  metadata: { role: 'Reported coordinator', alias: 'Doctor' } },
    { id: 'e-vikram', label: 'Vikramaditya Malhotra',      kind: 'Person',       subtitle: 'Logistics & Transport',               caseIds: ['c1'],      x: 460, y: 300, status: 'COURIER',    metadata: { role: 'Courier / logistics', company: 'V.K. Logistics' } },
    { id: 'e-sunita', label: 'Sunita Devi',                kind: 'Person',       subtitle: 'Beneficiary / Shell Accounts',        caseIds: ['c1','c3'], x: 460, y: 100, status: 'S.41A CrPC', metadata: { role: 'Beneficiary', notice: 'S.41A CrPC' } },
    { id: 'e-phone1', label: '+91 98102-44109',            kind: 'Phone',        subtitle: '142 contact events — Airtel',         caseIds: ['c1','c2'], x: 150, y: 200, metadata: { operator: 'Airtel', events: '142', imei: '864218...' } },
    { id: 'e-phone2', label: '+91 98765-33201',            kind: 'Phone',        subtitle: 'Vikramaditya registered',             caseIds: ['c1'],      x: 460, y: 420, metadata: { operator: 'Jio', subscriber: 'Vikramaditya Malhotra' } },
    { id: 'e-vehicle',label: 'DL-1C-AA-0921',             kind: 'Vehicle',      subtitle: 'Silver Hyundai Creta',                caseIds: ['c1'],      x: 340, y: 380, metadata: { make: 'Hyundai Creta', colour: 'Silver', owner: 'Vikramaditya Malhotra' } },
    { id: 'e-acct1',  label: '001920-88123',               kind: 'Financial',    subtitle: 'Hawala Primary Hub — ICICI',          caseIds: ['c1'],      x: 100, y: 350, metadata: { bank: 'ICICI', type: 'Current' } },
    { id: 'e-acct2',  label: 'sharma.enterprises@okaxis', kind: 'Financial',    subtitle: 'Axis Bank Surat — SL-91',             caseIds: ['c1','c3'], x: 620, y: 200, metadata: { bank: 'Axis Bank', branch: 'Surat', ledger: 'SL-91' } },
    { id: 'e-loc1',   label: 'Chandni Chowk',             kind: 'Location',     subtitle: 'Primary transaction point',           caseIds: ['c1'],      x: 160, y: 100, metadata: { type: 'Urban hub', tower: '404-CH-01' } },
    { id: 'e-loc2',   label: 'ISBT Kashmere Gate',        kind: 'Location',     subtitle: 'Gate 2 departure corridor',           caseIds: ['c1'],      x: 340, y: 100, metadata: { type: 'Transit hub', camera: 'CAM-DL-KG-0418' } },
    { id: 'e-loc3',   label: 'Ring Road Junction 04',     kind: 'Location',     subtitle: 'Kherki Daula Toll — ANPR',            caseIds: ['c1'],      x: 340, y: 280, metadata: { type: 'Toll point', camera: 'CAM-DL-RR-0044' } },
    { id: 'e-org1',   label: 'Hawala Primary Hub',        kind: 'Organization', subtitle: 'Financial routing entity',            caseIds: ['c1'],      x:  60, y: 260, metadata: { type: 'Shell entity', role: 'Hawala routing' } },
    { id: 'e-case1',  label: 'FIR-409/2026/NZ',          kind: 'Case',         subtitle: 'State vs. Syndicate 11',              caseIds: ['c1'],      x: 280, y:  60, metadata: { status: 'Active' } },
    { id: 'e-case2',  label: 'FIR-112/2025',              kind: 'Case',         subtitle: 'Faridabad Cargo Theft',               caseIds: ['c2'],      x: 600, y: 380, metadata: { status: 'Under review', link: 'Device overlap' } },
  ],

  relations: [
    { id: 'r1',  source: 'e-tariq',  target: 'e-phone1', label: 'Primary device',              date: '2026-02-14', sourceIds: ['CDR-004'],              leadIds: ['l1'] },
    { id: 'r2',  source: 'e-phone1', target: 'e-case1',  label: 'Named in FIR',                date: '2026-02-14', sourceIds: ['FIR-409','CDR-004'],     leadIds: ['l1'] },
    { id: 'r3',  source: 'e-phone1', target: 'e-case2',  label: 'Device overlap — 6 contacts', date: '2026-01-18', sourceIds: ['CDR-007'],              leadIds: ['l1'], inferred: true },
    { id: 'r4',  source: 'e-tariq',  target: 'e-acct1',  label: 'Payment reference',           date: '2026-02-14', sourceIds: ['FIN-001'],              leadIds: ['l2'] },
    { id: 'r5',  source: 'e-acct1',  target: 'e-acct2',  label: 'NEFT transfer Rs.45,00,000',  date: '2026-02-14', sourceIds: ['FIN-001'],              leadIds: ['l2'] },
    { id: 'r6',  source: 'e-acct2',  target: 'e-sunita', label: 'Beneficiary — S.41A',         date: '2026-02-14', sourceIds: ['FIN-001','FIN-003'],    leadIds: ['l2'] },
    { id: 'r7',  source: 'e-vikram', target: 'e-vehicle',label: 'Registered owner',            date: '2026-02-14', sourceIds: ['ANPR-001'],             leadIds: ['l3'] },
    { id: 'r8',  source: 'e-vehicle',target: 'e-loc3',   label: 'Toll record — ANPR',          date: '2026-02-14', sourceIds: ['ANPR-001'],             leadIds: ['l3'] },
    { id: 'r9',  source: 'e-vehicle',target: 'e-loc2',   label: 'CCTV sighting — 94.2%',       date: '2026-02-14', sourceIds: ['CCTV-001'],             leadIds: ['l3'] },
    { id: 'r10', source: 'e-tariq',  target: 'e-org1',   label: 'Affiliation alleged',         date: '2026-02-14', sourceIds: ['FIR-409'],              leadIds: [], inferred: true },
    { id: 'r11', source: 'e-org1',   target: 'e-acct1',  label: 'Account linked',              date: '2026-02-14', sourceIds: ['FIN-001'],              leadIds: ['l2'] },
    { id: 'r12', source: 'e-vikram', target: 'e-phone2', label: 'Registered contact',          date: '2026-02-14', sourceIds: ['CDR-004'],              leadIds: [] },
    { id: 'r13', source: 'e-phone1', target: 'e-loc1',   label: 'Tower — Chandni Chowk',       date: '2026-02-14', sourceIds: ['CDR-004'],              leadIds: ['l4'] },
  ],

  leads: [
    {
      id: 'l1', caseId: 'c1',
      title: 'Telecom Correlation — Device Overlap',
      summary: 'Same IMEI in FIR-409 CDR and FIR-112/2025 Faridabad records. 6 overlapping contacts in 22-min window.',
      reason: 'The same device IMEI (864218...) appears at Chandni Chowk tower (FIR-409) and Faridabad tower 404-10-B831 (FIR-112) with temporal overlap. Both records require independent subscriber verification before attributing use to a specific individual.',
      entityIds: ['e-tariq','e-phone1','e-case1','e-case2'], relationIds: ['r1','r2','r3'], sourceIds: ['CDR-004','CDR-007'],
      date: '2026-02-14', kind: 'corroborated', status: 'unreviewed', leadStatus: 'pending', confidence: 94, leadType: 'Telecom Correlation',
    },
    {
      id: 'l2', caseId: 'c1',
      title: 'Financial Intelligence — Payment Chain',
      summary: 'Rs.45,00,000 NEFT at 17:42 through V.K. Logistics. Three payments in SL-91 match FIR-089 entries within 18 minutes.',
      reason: 'The Axis Bank Surat ledger SL-91 records payments totaling Rs.14,50,000 that match timestamps and amounts in FIR-089/2026. The NEFT reference traces through Hawala Primary Hub (001920-88123) to account ending 2190. Account-holder verification required before attributing to Sunita Devi.',
      entityIds: ['e-tariq','e-acct1','e-acct2','e-sunita'], relationIds: ['r4','r5','r6'], sourceIds: ['FIN-001','FIN-003'],
      date: '2026-02-14', kind: 'corroborated', status: 'unreviewed', leadStatus: 'pending', confidence: 91, leadType: 'Financial Intelligence',
    },
    {
      id: 'l3', caseId: 'c1',
      title: 'ANPR Surveillance — Vehicle Movement',
      summary: 'DL-1C-AA-0921 at Ring Road Toll 18:22, then ISBT Gate 2 at 18:39. 17-min window, 4.2 km. Optical match 94.2%.',
      reason: 'ANPR at Ring Road Junction 04 records DL-1C-AA-0921 at 18:22:15 IST. CCTV at ISBT Kashmere Gate captures the same plate at 18:39:12 IST. Road distance 4.2 km; estimated speed 21.9 km/h — consistent with evening traffic.',
      entityIds: ['e-vikram','e-vehicle','e-loc2','e-loc3'], relationIds: ['r7','r8','r9'], sourceIds: ['ANPR-001','CCTV-001'],
      date: '2026-02-14', kind: 'corroborated', status: 'unreviewed', leadStatus: 'pending', confidence: 94, leadType: 'ANPR Surveillance',
    },
    {
      id: 'l4', caseId: 'c1',
      title: 'Location Cross-reference — Chandni Chowk',
      summary: 'Phone tower, bank branch and witness statement all place activity at Chandni Chowk within 18-minute window.',
      reason: 'CDR records tower 404-CH-01 (Chandni Chowk) at 18:05:22. Axis Bank records cash withdrawal at Chandni Chowk branch at 17:54. Witness statement (restricted) confirms presence. Convergence of three independent source types at same location.',
      entityIds: ['e-tariq','e-phone1','e-loc1'], relationIds: ['r1','r13'], sourceIds: ['CDR-004','FIN-001'],
      date: '2026-02-14', kind: 'corroborated', status: 'unreviewed', leadStatus: 'pending', confidence: 96, leadType: 'Location Cross-reference',
    },
    {
      id: 'l5', caseId: 'c1',
      title: 'Network Hub Analysis — Syndicate Structure',
      summary: 'Hawala Primary Hub (001920-88123) acts as routing node connecting 4 shell accounts across 2 FIRs.',
      reason: 'Financial analysis shows 001920-88123 as the primary routing account receiving and distributing funds across multiple beneficiary accounts. Account label is investigator-assigned based on transaction pattern analysis and requires legal verification.',
      entityIds: ['e-org1','e-acct1','e-acct2','e-sunita'], relationIds: ['r5','r6','r11'], sourceIds: ['FIN-001','FIN-003'],
      date: '2026-02-14', kind: 'unverified', status: 'unreviewed', leadStatus: 'pending', confidence: 87, leadType: 'Network Hub Analysis',
    },
  ],

  timelineEvents: [
    { id: 'ev1', caseId: 'c1', type: 'Financial', title: 'Bank transfer Rs.45,00,000', detail: 'Axis NEFT — 001920-88123 to sharma.enterprises@okaxis via V.K. Logistics', timestamp: '2026-02-14T17:42:10.000Z', sourceId: 'FIN-001', entityIds: ['e-acct1','e-acct2'], confirmed: true },
    { id: 'ev2', caseId: 'c1', type: 'Financial', title: 'Cash withdrawal — Chandni Chowk', detail: 'Axis Bank branch cash withdrawal. Amount: Rs.8,00,000.', timestamp: '2026-02-14T17:54:00.000Z', sourceId: 'FIN-001', entityIds: ['e-acct2','e-loc1'], confirmed: true },
    { id: 'ev3', caseId: 'c1', type: 'Location',  title: 'Witness statement — Chandni Chowk', detail: 'Protected witness corroborates suspect presence at Chandni Chowk at approx 18:00 IST', timestamp: '2026-02-14T18:00:00.000Z', entityIds: ['e-tariq','e-loc1'], confirmed: true },
    { id: 'ev4', caseId: 'c1', type: 'Call',      title: 'Call records — tower disconnect', detail: '+91 98102-44109 disconnected at Chandni Chowk tower 404-CH-01 at 18:05:22 IST', timestamp: '2026-02-14T18:05:22.000Z', sourceId: 'CDR-004', entityIds: ['e-tariq','e-phone1','e-loc1'], confirmed: true },
    { id: 'ev5', caseId: 'c1', type: 'Vehicle',   title: 'Vehicle sighting — Ring Road Toll', detail: 'DL-1C-AA-0921 (Silver Hyundai Creta) at Ring Road Junction 04, Kherki Daula Toll', timestamp: '2026-02-14T18:22:15.000Z', sourceId: 'ANPR-001', entityIds: ['e-vehicle','e-vikram','e-loc3'], confirmed: true },
    { id: 'ev6', caseId: 'c1', type: 'CCTV',      title: 'CCTV match — ISBT Gate 2', detail: 'CAM-DL-KG-0418 — plate DL-1C-AA-0921 at 94.2% match. 2 occupants.', timestamp: '2026-02-14T18:39:12.000Z', sourceId: 'CCTV-001', entityIds: ['e-vehicle','e-loc2'], confirmed: true, confidence: 94 },
    { id: 'ev7', caseId: 'c1', type: 'CCTV',      title: 'CCTV — NDLS Paharganj', detail: 'CAM-DL-NDLS-0108 — rear bumper dent signature match at 82.1%. Plate partially obscured.', timestamp: '2026-02-14T19:14:05.000Z', sourceId: 'CCTV-001', entityIds: ['e-vehicle','e-loc2'], confirmed: false, confidence: 82 },
    { id: 'ev8', caseId: 'c1', type: 'Incident',  title: 'FIR registered — PS Special Cell', detail: 'FIR-409/2026/NZ registered at PS Special Cell, New Delhi.', timestamp: '2026-01-02T11:30:00.000Z', entityIds: ['e-case1'], confirmed: true },
  ],

  cameraRecordings: [
    { id: 'cam1', caseId: 'c1', cameraId: 'CAM-DL-KG-0418',  cameraName: 'ISBT Kashmere Gate, Gate 2',          location: 'ISBT Kashmere Gate',     timestamp: '2026-02-14T18:39:12.000Z', detectedEntities: ['DL-1C-AA-0921','Adult male'],    matchScore: 94.2, frameRef: 'Frame 034,289 / 056,000',  notes: 'Plate DL-1C-AA-0921 on White Swift moving past departure sector. 2 Occupants.' },
    { id: 'cam2', caseId: 'c1', cameraId: 'CAM-DL-NDLS-0108', cameraName: 'NDLS Railway Station, Paharganj',     location: 'NDLS Railway Station',    timestamp: '2026-02-14T19:14:05.000Z', detectedEntities: ['DL-1C-AA-0921 (partial)'],     matchScore: 82.1, frameRef: 'Frame 012,441 / 089,200',  notes: 'Rear bumper dent signature match. Plate partially obscured by taxi grill.' },
    { id: 'cam3', caseId: 'c1', cameraId: 'CAM-DL-RR-0044',   cameraName: 'Ring Road Junction 04 — Kherki Daula Toll', location: 'Ring Road Junction 04', timestamp: '2026-02-14T18:22:15.000Z', detectedEntities: ['DL-1C-AA-0921'], matchScore: 98.7, frameRef: 'Toll sequence 441-B', notes: 'ANPR confirmed plate. Direction: Toward Jaipur via NH-48.' },
  ],

  aiLeads: [
    { id: 'ai1', caseId: 'c1', leadId: 'l1', type: 'Telecom Correlation',    confidence: 94, relatedEntity: '+91 98102-44109',            explanation: 'Same device IMEI in both FIR-409 and FIR-112 records. 6 overlapping contact events in 22-min window at Faridabad tower.', sourceRef: 'CDR-004, CDR-007', timestamp: '2026-02-14T18:45:00.000Z', status: 'pending' },
    { id: 'ai2', caseId: 'c1', leadId: 'l2', type: 'Financial Intelligence', confidence: 91, relatedEntity: 'sharma.enterprises@okaxis', explanation: 'Three payments in Surat ledger SL-91 match FIR-089 entries. Timestamps within 18 minutes of reported delivery.',           sourceRef: 'FIN-001, FIN-003', timestamp: '2026-02-14T18:47:00.000Z', status: 'pending' },
    { id: 'ai3', caseId: 'c1', leadId: 'l3', type: 'ANPR Surveillance',      confidence: 94, relatedEntity: 'DL-1C-AA-0921',             explanation: 'Vehicle DL-1C-AA-0921 sighted at Ring Road Toll 18:22, then ISBT Gate 2 at 18:39. Distance and time consistent.',          sourceRef: 'ANPR-001, CCTV-001', timestamp: '2026-02-14T18:50:00.000Z', status: 'pending' },
  ],

  reports: [],

  activity: [
    { id: 'a1', caseId: 'c1', title: 'CCTV match confirmed',          detail: 'CAM-DL-KG-0418 — DL-1C-AA-0921 at 94.2% confidence. Lead L-110 created.',         time: '2026-02-14T18:50:00.000Z', type: 'cctv'      },
    { id: 'a2', caseId: 'c1', title: 'Location match — Chandni Chowk', detail: 'CDR tower 404-CH-01 corroborates financial and witness records.',                  time: '2026-02-14T18:45:00.000Z', type: 'location'  },
    { id: 'a3', caseId: 'c1', title: 'Financial transaction flagged',  detail: 'Rs.45,00,000 NEFT via V.K. Logistics. Timestamp proximity +/-12m to CDR.',        time: '2026-02-14T18:40:00.000Z', type: 'financial' },
    { id: 'a4', caseId: 'c2', title: 'CDR cross-case link found',      detail: 'Device IMEI 864218 matches FIR-409 records. Faridabad tower overlap confirmed.',   time: '2026-01-18T14:20:00.000Z', type: 'call'      },
    { id: 'a5', caseId: 'c3', title: 'Shell account indexed',          detail: 'sharma.enterprises@okaxis linked to Surat ledger SL-91. Verification pending.',   time: '2026-02-10T09:00:00.000Z', type: 'financial' },
  ],

  loadedPacks: [],
};

export function createInitialState(): AppState {
  return structuredClone(initial);
}
