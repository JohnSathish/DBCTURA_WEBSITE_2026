/** Shared college contact details for Contact page, footer, etc. */
export const COLLEGE_CONTACT = {
  name: "Don Bosco College, Tura",
  shortAddress: "Tura, Meghalaya — 794001, India",
  fullAddress:
    "Don Bosco College, Tura, West Garo Hills District, Meghalaya — 794001, India",
  phone: "+91 9402152496",
  phoneTel: "+919402152496",
  whatsappUrl: "https://wa.me/919402152496",
  principalEmail: "principal@donboscocollege.ac.in",
  helpdeskEmail: "helpdesk@donboscocollege.ac.in",
  aisheCode: "C-16361",
  mapQuery: "Don+Bosco+College+Tura+Meghalaya+794001",
  officeHours: [
    { label: "Monday – Friday", value: "9:00 AM – 5:00 PM" },
    { label: "Saturday", value: "9:00 AM – 1:00 PM" },
    { label: "Sunday & holidays", value: "Closed" },
  ],
} as const

export const CONTACT_DEPARTMENTS = [
  {
    title: "Principal's Office",
    email: "principal@donboscocollege.ac.in",
    phone: "+91 9402152496",
    description: "General enquiries, official correspondence, and institutional matters.",
  },
  {
    title: "Admissions",
    email: "principal@donboscocollege.ac.in",
    href: "https://admissionsdbctura.com/register",
    description: "Undergraduate admissions, eligibility, and application support.",
  },
  {
    title: "IT Helpdesk",
    email: "helpdesk@donboscocollege.ac.in",
    description: "Portal, email, and technical assistance for students and staff.",
  },
] as const
