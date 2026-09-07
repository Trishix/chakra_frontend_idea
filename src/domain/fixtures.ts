import type { AppState, SourceRecord } from './types';

function source(record: Omit<SourceRecord, 'fullText'>, context: string): SourceRecord {
  return { ...record, fullText: `${record.excerpt}\n\n${context}\n\nFictional demonstration record. Dates, identifiers, people and organizations are invented. This extract supports review of the stated observation only; it is not a finding of identity, intent or wrongdoing.` };
}

const initial: AppState = {
  schemaVersion: 1,
  cases: [
    { id: 'c1', reference: 'DL/2026/0418', title: 'Women safety referral network', district: 'North', station: 'Civil Lines', status: 'Active', updated: '2026-09-08T08:45:00.000Z', officer: 'Insp. A. Sen', summary: 'Review of safety referrals, a shared contact number and an advance payment reported by protected witnesses. Connections remain subject to officer verification.' },
    { id: 'c2', reference: 'DL/2026/0362', title: 'Safe mobility inquiry', district: 'North West', station: 'Adarsh Nagar', status: 'Under review', updated: '2026-09-07T14:20:00.000Z', officer: 'SI P. Batra', summary: 'A family reported loss of contact after a safety referral meeting. A contact number also appears in the North district women safety inquiry.' },
    { id: 'c3', reference: 'DL/2026/0289', title: 'Workplace safety complaint', district: 'South East', station: 'Lajpat Nagar', status: 'Active', updated: '2026-09-06T10:10:00.000Z', officer: 'Insp. M. Rao', summary: 'A service fee payment was disputed. A masked recipient account and an abbreviated display name require independent verification.' },
  ],
  sources: [
    source({ id: 's1', caseId: 'c1', title: 'Initial complaint · safety referral offer', type: 'FIR', date: '2026-08-28', pages: 4, excerpt: 'Protected survivor A stated that a person introduced as Ananya Verma offered placement through Sakhi Worklink and supplied contact number +91 •••••• 8842.' }, 'Page 2, paragraph 3. The witness described a meeting near Azadpur on 24 August 2026. The name was supplied verbally; no identification document was shown. The complaint records the name as an allegation and does not establish who controls the device.'),
    source({ id: 's2', caseId: 'c1', title: 'Call detail extract · contact ending 8842', type: 'CDR', date: '2026-09-01', pages: 6, excerpt: 'The submitted call detail extract contains contact number +91 •••••• 8842 on 24, 25 and 26 August 2026, within the period described in DL/2026/0418.' }, 'Page 3, rows 12–17. The demonstration extract records contact events only. Subscriber identity and the person using the device have not been established. Cell-site information is omitted; no precise location is inferred from these entries.'),
    source({ id: 's3', caseId: 'c1', title: 'Witness account · advance payment', type: 'Statement', date: '2026-08-30', pages: 3, excerpt: 'Protected survivor A described an advance payment of ₹8,500 to account •••• 2190. The payment screen displayed the abbreviated recipient name “A. Verma”.' }, 'Page 2, paragraph 2. The witness retained a redacted payment receipt and said the payment followed a safety referral conversation. The account owner was not independently verified. A display name alone cannot identify a recipient or connect that person to the referral coordinator.'),
    source({ id: 's4', caseId: 'c2', title: 'Inquiry note · safety referral contact', type: 'FIR', date: '2026-08-21', pages: 5, excerpt: 'The family supplied contact number +91 •••••• 8842 from a safety referral message. A separate local contact, Ananya Malhotra, had a different address and date of birth from the Ananya Verma description.' }, 'Page 3, paragraphs 1–2. The family could not identify the sender of the safety referral message. Ananya Malhotra was mentioned as a neighbor who helped the family submit the inquiry, not as the referral coordinator. The shared first name is not evidence that the two people are the same person.'),
    source({ id: 's5', caseId: 'c2', title: 'Call detail extract · family-supplied number', type: 'CDR', date: '2026-08-25', pages: 4, excerpt: 'The family-supplied number +91 •••••• 8842 appears in the call detail extract for 18–20 August 2026 associated with DL/2026/0362.' }, 'Page 2, rows 4–8. The number matches the masked contact token used in the women safety inquiry. This cross-case match concerns the contact number only. The extract does not identify the device user, prove a meeting took place or establish any connection to the survivor’s current location.'),
    source({ id: 's6', caseId: 'c3', title: 'Redacted payment receipt · recipient 2190', type: 'Financial', date: '2026-08-16', pages: 2, excerpt: 'A redacted receipt dated 14 August 2026 records ₹6,000 sent to account •••• 2190 with recipient display name “A. Verma”. Account-holder verification is pending.' }, 'Page 1, transaction summary. The complainant supplied the receipt following a disputed safety service fee. The same masked account token and display name appear in the witness account from DL/2026/0418. Neither a common display name nor matching account tokens establish the identity of the referral coordinator.'),
    source({ id: 's7', caseId: 'c3', title: 'Complaint · disputed safety service fee', type: 'FIR', date: '2026-08-17', pages: 3, excerpt: 'The complainant reported paying a safety service fee after meeting a representative of Sakhi Worklink in Lajpat Nagar. No safety service was subsequently confirmed.' }, 'Page 2, paragraph 4. The complainant did not obtain a signed contract and could not provide the representative’s legal name. The organization label is reproduced as described in the complaint; business registration and any link to the North district inquiry remain unverified.'),
    source({ id: 's8', caseId: 'c1', title: 'Protected survivor B · restricted statement', type: 'Statement', date: '2026-09-03', pages: 2, restricted: true, excerpt: 'Protected survivor B described a meeting in Lajpat Nagar. The statement is restricted and is excluded from report exports in this demonstration.' }, 'Access note. This fictional protected statement is represented only by a redacted summary. No direct identifiers, residence details or contact information are included. The meeting account has not been independently corroborated and must not be treated as proof of an individual’s involvement.'),
  ],
  entities: [
    { id: 'e1', label: 'Ananya Verma', kind: 'Person', subtitle: 'Name reported by witness', caseIds: ['c1'], x: 100, y: 80 },
    { id: 'e2', label: '+91 •••••• 8842', kind: 'Phone', subtitle: 'Shared contact · user unverified', caseIds: ['c1', 'c2'], x: 290, y: 80 },
    { id: 'e3', label: 'Account •••• 2190', kind: 'Account', subtitle: 'Owner verification pending', caseIds: ['c1', 'c3'], x: 300, y: 285 },
    { id: 'e4', label: 'Azadpur', kind: 'Location', subtitle: 'Reported meeting area', caseIds: ['c1'], x: 20, y: 230 },
    { id: 'e5', label: 'Protected survivor A', kind: 'Person', subtitle: 'Protected identity', caseIds: ['c1'], x: 150, y: 200 },
    { id: 'e6', label: 'DL/2026/0418', kind: 'Case', subtitle: 'Women safety inquiry', caseIds: ['c1'], x: 170, y: 360 },
    { id: 'e7', label: 'DL/2026/0362', kind: 'Case', subtitle: 'Safe mobility inquiry', caseIds: ['c2'], x: 475, y: 45 },
    { id: 'e8', label: 'DL/2026/0289', kind: 'Case', subtitle: 'Safety complaint', caseIds: ['c3'], x: 510, y: 340 },
    { id: 'e9', label: 'Sakhi Worklink', kind: 'Organization', subtitle: 'Fictional · registration unverified', caseIds: ['c1', 'c3'], x: 40, y: 365 },
    { id: 'e10', label: 'Ananya Malhotra', kind: 'Person', subtitle: 'Separate person · identity conflict', caseIds: ['c2'], x: 20, y: 15 },
    { id: 'e11', label: 'A. Verma', kind: 'Person', subtitle: 'Payment display name · unresolved', caseIds: ['c1', 'c3'], x: 485, y: 225 },
    { id: 'e12', label: 'Protected survivor B', kind: 'Person', subtitle: 'Restricted statement', caseIds: ['c1'], x: 570, y: 120 },
    { id: 'e13', label: 'Lajpat Nagar', kind: 'Location', subtitle: 'Reported meeting area', caseIds: ['c1', 'c3'], x: 570, y: 380 },
  ],
  relations: [
    { id: 'r1', source: 'e6', target: 'e2', label: 'Contact in case record', date: '2026-09-01', sourceIds: ['s1', 's2'], leadIds: ['l1', 'l4'] },
    { id: 'r2', source: 'e7', target: 'e2', label: 'Same contact token', date: '2026-08-25', sourceIds: ['s4', 's5'], leadIds: ['l1', 'l4'] },
    { id: 'r3', source: 'e1', target: 'e2', label: 'Reported contact · user unverified', date: '2026-08-28', sourceIds: ['s1'], inferred: true, leadIds: ['l1'] },
    { id: 'r4', source: 'e3', target: 'e11', label: 'Recipient display name', date: '2026-08-16', sourceIds: ['s6'], leadIds: ['l2', 'l5'] },
    { id: 'r5', source: 'e5', target: 'e3', label: 'Payment reported', date: '2026-08-30', sourceIds: ['s3'], leadIds: ['l2', 'l5'] },
    { id: 'r6', source: 'e1', target: 'e10', label: 'Name similarity · identity conflict', date: '2026-08-28', sourceIds: ['s1', 's4'], inferred: true, leadIds: ['l3'] },
    { id: 'r7', source: 'e1', target: 'e9', label: 'Affiliation alleged', date: '2026-08-28', sourceIds: ['s1'], inferred: true, leadIds: [] },
    { id: 'r8', source: 'e5', target: 'e4', label: 'Meeting reported', date: '2026-08-28', sourceIds: ['s1'], leadIds: [] },
    { id: 'r9', source: 'e12', target: 'e13', label: 'Restricted account', date: '2026-09-03', sourceIds: ['s8'], leadIds: [] },
    { id: 'r10', source: 'e8', target: 'e3', label: 'Receipt in case record', date: '2026-08-16', sourceIds: ['s6'], leadIds: ['l2', 'l5'] },
    { id: 'r11', source: 'e9', target: 'e13', label: 'Meeting area reported', date: '2026-08-17', sourceIds: ['s7'], inferred: true, leadIds: [] },
  ],
  leads: [
    { id: 'l1', caseId: 'c1', title: 'Shared phone across two cases', summary: 'Contact ending 8842 appears in the recruitment and safe mobility records.', reason: 'The same masked contact token is present in both complaint records and their call detail extracts. This supports a shared contact; it does not identify its user or establish wrongdoing.', entityIds: ['e1', 'e2', 'e6', 'e7'], relationIds: ['r1', 'r2', 'r3'], sourceIds: ['s1', 's2', 's4', 's5'], date: '2026-09-08', kind: 'corroborated', status: 'unreviewed' },
    { id: 'l2', caseId: 'c1', title: 'Possible shared payment recipient', summary: 'Account ending 2190 and display name A. Verma recur in a separate payment complaint.', reason: 'A witness account and a redacted receipt share a recipient token and abbreviated name. Obtain account-holder verification before attributing the payments to Ananya Verma or the safety support organization.', entityIds: ['e3', 'e5', 'e8', 'e11'], relationIds: ['r4', 'r5', 'r10'], sourceIds: ['s3', 's6'], date: '2026-09-08', kind: 'unverified', status: 'unreviewed' },
    { id: 'l3', caseId: 'c1', title: 'Similar name, conflicting identity', summary: 'Ananya Malhotra was suggested by a first-name match, but the source describes a separate person.', reason: 'The safe mobility note names Ananya Malhotra as a helpful neighbor and records a different address and date of birth. Do not merge this entity with Ananya Verma. Dismiss the match or record a correction with reasons.', entityIds: ['e1', 'e10'], relationIds: ['r6'], sourceIds: ['s1', 's4'], date: '2026-09-07', kind: 'conflict', status: 'unreviewed' },
    { id: 'l4', caseId: 'c2', title: 'Women safety contact in North district inquiry', summary: 'The family-supplied number ending 8842 is also recorded in DL/2026/0418.', reason: 'Independent case extracts reference the same masked number. Review the underlying dates and request subscriber verification before inferring a common operator.', entityIds: ['e2', 'e6', 'e7'], relationIds: ['r1', 'r2'], sourceIds: ['s1', 's2', 's4', 's5'], date: '2026-09-07', kind: 'corroborated', status: 'unreviewed' },
    { id: 'l5', caseId: 'c3', title: 'Recipient account in a second complaint', summary: 'A North district witness describes payment to account ending 2190.', reason: 'The masked recipient token aligns with the receipt in this complaint. The display name is not an identity document; the link remains provisional until the account holder is verified.', entityIds: ['e3', 'e5', 'e8', 'e11'], relationIds: ['r4', 'r5', 'r10'], sourceIds: ['s3', 's6'], date: '2026-09-06', kind: 'unverified', status: 'unreviewed' },
  ],
  reports: [],
  activity: [
    { id: 'a1', caseId: 'c1', title: 'Sources added to workspace', detail: 'Fictional case records prepared for officer review. All suggested leads are unreviewed.', time: '2026-09-08T08:45:00.000Z' },
    { id: 'a2', caseId: 'c2', title: 'Cross-case contact suggested', detail: 'Contact ending 8842 appears in a second case. User identity remains unverified.', time: '2026-09-07T14:20:00.000Z' },
    { id: 'a3', caseId: 'c3', title: 'Payment receipt indexed', detail: 'Redacted account token added. Account-holder verification pending.', time: '2026-09-06T10:10:00.000Z' },
  ],
  loadedPacks: [],
};

export function createInitialState(): AppState {
  return structuredClone(initial);
}
