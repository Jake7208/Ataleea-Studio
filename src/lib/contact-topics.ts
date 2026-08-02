/**
 * The one list of enquiry topics. Imported by both the Payload collection (to
 * build its select options) and the contact form (to render its radios), so a
 * value the form can submit is always a value the collection will accept.
 */
export const CONTACT_TOPICS = [
  { value: 'project', label: 'New website' },
  { value: 'local', label: 'Local search' },
  { value: 'care', label: 'Care plan' },
  { value: 'other', label: 'Something else' },
] as const

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['value']
