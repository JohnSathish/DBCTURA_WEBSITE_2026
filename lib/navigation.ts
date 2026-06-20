export type NavigationItem = {
  id?: string
  href?: string | null
  label: string
  order?: number
  isVisible?: boolean
  parentId?: string | null
  children?: NavigationItem[]
}

export const defaultNavigation: NavigationItem[] = [
  { href: "/", label: "Home" },
  {
    href: "/about",
    label: "About Us",
    children: [
      { href: "/about/founder", label: "Founder: St.John Bosco" },
      { href: "/about/rector-major", label: "Our Rector Major" },
      { href: "/about/vision-mission", label: "Vision & Mission" },
      { href: "/about/objectives", label: "Objectives" },
      { href: "/about/affiliation", label: "Affiliation" },
      { href: "/about/philosophy", label: "Philosophy" },
      { href: "/about/management", label: "Management" },
      { href: "/about/history", label: "History" },
      { href: "/about/former-principals", label: "Former Principals" },
      { href: "/about/former-vice-principals", label: "Former Vice Principals" },
      { href: "/about/db-higher-education", label: "DB Higher Edu. in India" },
    ],
  },
  {
    href: "/administration",
    label: "Administration",
    children: [
      { href: "/administration/governing-body", label: "Governing Body" },
      {
        href: "/administration/perspective-plans",
        label: "Perspective Plans of DBC",
        children: [
          { href: "/administration/perspective-plans/2017-2022", label: "Five Year Plan: 2017-2022" },
          { href: "/administration/perspective-plans/2023-2028", label: "Five Year Plan: 2023-2028" },
        ],
      },
      {
        href: "/administration/organogram",
        label: "Organogram of DBC",
        children: [
          { href: "/administration/organogram/governing-body", label: "Governing Body" },
          { href: "/administration/organogram/administrative-setup", label: "Administrative Set up" },
        ],
      },
      {
        href: "/administration/naac",
        label: "NAAC",
        children: [
          { href: "/administration/naac/ssr", label: "SSR" },
        ],
      },
      { href: "/administration/iqac", label: "IQAC" },
      { href: "/administration/rusa", label: "RUSA" },
      { href: "/administration/nirf", label: "NIRF" },
      { href: "/administration/aishe", label: "AISHE" },
      { href: "/administration/uba", label: "UBA" },
      { href: "/administration/grant-in-aid", label: "Grant-in Aid" },
      { href: "/administration/feedback", label: "Feedback" },
      { href: "/administration/covid-19-task-force", label: "COVID-19 Task Force" },
      { href: "/administration/committees", label: "Committees" },
      { href: "/administration/annual-magazine", label: "Annual Magazine" },
    ],
  },
  {
    href: "/academics",
    label: "Academics",
    children: [
      {
        href: "/academics/admission",
        label: "Admission",
        children: [
          { href: "/academics/admission/reservation-policy", label: "Admission Reservation Policy" },
          { href: "/academics/admission/cuet", label: "Central Universities Entrance Test (CUET)" },
          { href: "/academics/admission/dbct-reservation-policy", label: "DBCT Admission Reservation Policy" },
        ],
      },
      { href: "/academics/routine", label: "Routine" },
      { href: "/academics/academic-council", label: "Academic Council" },
      {
        href: "/academics/nep-2020",
        label: "NEP 2020",
        children: [
          { href: "/academics/nep-2020/concept-2022-2023", label: "Nep Concept 2022-2023" },
          { href: "/academics/nep-2020/nehu-curriculum", label: "Nehu Curriculum and Credit" },
        ],
      },
      {
        href: "/academics/departments",
        label: "Departments",
        children: [
          { href: "/academics/departments/teaching-staffs", label: "Teaching Staffs" },
          { href: "/academics/departments/non-teaching-staffs", label: "Non-Teaching Staffs" },
        ],
      },
      {
        href: "/academics/field-trips",
        label: "Field Trips",
        children: [
          { href: "/academics/field-trips/botany", label: "Department of Botany" },
          { href: "/academics/field-trips/chemistry", label: "Department of Chemistry" },
          { href: "/academics/field-trips/physics", label: "Department of Physics" },
          { href: "/academics/field-trips/mathematics", label: "Department of Mathematics" },
          { href: "/academics/field-trips/zoology", label: "Department of Zoology" },
          { href: "/academics/field-trips/commerce", label: "Department of Commerce" },
          { href: "/academics/field-trips/economics", label: "Department of Economics" },
          { href: "/academics/field-trips/education", label: "Department of Education" },
          { href: "/academics/field-trips/english", label: "Department of English" },
          { href: "/academics/field-trips/history", label: "Department of History" },
          { href: "/academics/field-trips/sociology", label: "Department of Sociology" },
          { href: "/academics/field-trips/political-science", label: "Department of Political Science" },
          { href: "/academics/field-trips/philosophy", label: "Department of Philosophy" },
        ],
      },
      {
        href: "/academics/seminars",
        label: "Seminars",
        children: [
          { href: "/academics/seminars/philosophy", label: "Departments of Philosophy" },
          { href: "/academics/seminars/botany", label: "Departments of Botany" },
          { href: "/academics/seminars/chemistry", label: "Departments of Chemistry" },
          { href: "/academics/seminars/physics", label: "Departments of Physics" },
          { href: "/academics/seminars/mathematics", label: "Departments of Mathematics" },
          { href: "/academics/seminars/zoology", label: "Departments of Zoology" },
          { href: "/academics/seminars/commerce", label: "Departments of Commerce" },
          { href: "/academics/seminars/economics", label: "Departments of Economics" },
          { href: "/academics/seminars/education", label: "Departments of Education" },
          { href: "/academics/seminars/english", label: "Departments of English" },
          { href: "/academics/seminars/history", label: "Departments of History" },
          { href: "/academics/seminars/sociology", label: "Departments of Sociology" },
          { href: "/academics/seminars/political-science", label: "Departments of Political Science" },
        ],
      },
      {
        href: "/academics/webinar",
        label: "Webinar",
        children: [
          { href: "/academics/webinar/chemistry", label: "Chemistry" },
          { href: "/academics/webinar/iwcras", label: "IWCRAS" },
          { href: "/academics/webinar/economics", label: "Economics" },
          { href: "/academics/webinar/education", label: "Education" },
          { href: "/academics/webinar/english", label: "English" },
          { href: "/academics/webinar/political-science", label: "Political Science" },
          { href: "/academics/webinar/philosophy", label: "Philosophy Web" },
          { href: "/academics/webinar/nss", label: "NSS Web" },
          { href: "/academics/webinar/sociology", label: "Sociology" },
        ],
      },
      { href: "/academics/po-pso-co", label: "PO, PSO & CO" },
      {
        href: "/academics/calendars",
        label: "Calendars",
        children: [
          { href: "/academics/calendars/2013-2014", label: "Calendar 2013-2014" },
          { href: "/academics/calendars/2015-2016", label: "Calendar 2015-2016" },
          { href: "/academics/calendars/2016-2017", label: "Calendar 2016-2017" },
          { href: "/academics/calendars/2017-2018", label: "Calendar 2017-2018" },
          { href: "/academics/calendars/2018-2019", label: "Calendar 2018-2019" },
          { href: "/academics/calendars/2019-2020", label: "Calendar 2019-2020" },
          { href: "/academics/calendars/2020-2021", label: "Calendar 2020-2021" },
          { href: "/academics/calendars/2021-2022", label: "Calendar 2021-2022" },
          { href: "/academics/calendars/2022-2023", label: "Calendar 2022-2023" },
          { href: "/academics/calendars/2023-2024", label: "Calendar 2023-2024" },
        ],
      },
      {
        href: "/academics/annual-reports",
        label: "Annual Reports",
        children: [
          { href: "/academics/annual-reports/2014-2015", label: "Annual Report 2014-2015" },
          { href: "/academics/annual-reports/2016", label: "Annual Report 2016" },
          { href: "/academics/annual-reports/2017", label: "Annual Report 2017" },
          { href: "/academics/annual-reports/2018", label: "Annual Report 2018" },
          { href: "/academics/annual-reports/2019", label: "Annual Report 2019" },
          { href: "/academics/annual-reports/2020", label: "Annual Report 2020" },
          { href: "/academics/annual-reports/2021", label: "Annual Report 2021" },
          { href: "/academics/annual-reports/2022", label: "Annual Report 2022" },
          { href: "/academics/annual-reports/2023", label: "Annual Report 2023" },
        ],
      },
      {
        href: "/academics/research-journals",
        label: "Research and Journals",
        children: [
          { href: "/academics/research-journals/source", label: "Source" },
          { href: "/academics/research-journals/transient", label: "Transient" },
        ],
      },
      { href: "/academics/best-practices", label: "Best Practices" },
      { href: "/academics/institutional-distinctiveness", label: "Institutional Distinctiveness" },
      { href: "/academics/short-term-course", label: "Short Term Course" },
      { href: "/academics/question-papers", label: "Question Papers" },
    ],
  },
  {
    href: "/campus",
    label: "Campus",
    children: [
      {
        href: "/campus/infrastructure-facilities",
        label: "Infrastructure & Facilities",
        children: [
          { href: "/campus/infrastructure-facilities/procedures-policies", label: "Procedures and Policies" },
        ],
      },
      {
        href: "/campus/infrastructure-sops",
        label: "Infrastructure SOPs",
        children: [
          { href: "/campus/infrastructure-sops/classrooms", label: "SOP for Classrooms" },
          { href: "/campus/infrastructure-sops/computer-labs", label: "SOP for Computer Labs" },
          { href: "/campus/infrastructure-sops/library", label: "SOP for Library" },
          { href: "/campus/infrastructure-sops/seminar-halls", label: "SOP for Seminar Halls" },
          { href: "/campus/infrastructure-sops/sports-complexes", label: "SOP for Sports Complexes" },
          { href: "/campus/infrastructure-sops/gymnasium", label: "SOP for Gymnasium" },
          { href: "/campus/infrastructure-sops/science-laboratories", label: "SOP for Science Laboratories" },
          { href: "/campus/infrastructure-sops/geography-department", label: "SOP for Geography Department" },
        ],
      },
      { href: "/campus/hostels", label: "Hostels" },
      { href: "/campus/library", label: "Library" },
      { href: "/campus/biotech-hub", label: "Biotech Hub" },
      { href: "/campus/gymnasium", label: "Gymnasium" },
    ],
  },
  {
    href: "/aqar",
    label: "AQAR",
    children: [
      { href: "/aqar/2012", label: "AQAR-2012" },
      { href: "/aqar/2013-2014", label: "AQAR-July 2013-June 14" },
      { href: "/aqar/2014-2015", label: "AQAR-July 2014-June 15" },
      { href: "/aqar/2015-2016", label: "AQAR-July 2015-June 16" },
      { href: "/aqar/2016-2017", label: "AQAR-July 2016-June 17" },
      { href: "/aqar/2017-2018", label: "AQAR-July 2017-June 18" },
      { href: "/aqar/2018-2019", label: "AQAR-July 2018-June 19" },
      { href: "/aqar/2019-2020", label: "AQAR-June 2019-May 20" },
      { href: "/aqar/2020-2021", label: "AQAR-June 2020-May 21" },
      { href: "/aqar/2021-2022", label: "AQAR-June 2021-May 22" },
      { href: "/aqar/2022-2023", label: "AQAR-June 2022-May 23" },
    ],
  },
  {
    href: "/student-services",
    label: "Student Services",
    children: [
      { href: "/student-services/mental-health", label: "Mental Health Helpline: 14416" },
      { href: "/student-services/alumni-association", label: "Alumni Association" },
      { href: "/student-services/career-placement", label: "Career & Placement Cell" },
      { href: "/student-services/service-support", label: "Service and Support" },
      {
        href: "/student-services/student-progression",
        label: "Student Progression",
        children: [
          { href: "/student-services/student-progression/higher-education", label: "Progress to Higher Edu" },
          { href: "/student-services/student-progression/internship", label: "Internship" },
          { href: "/student-services/student-progression/employment", label: "Job / Employment" },
        ],
      },
      { href: "/student-services/swa", label: "SWA" },
      { href: "/student-services/parents-association", label: "Parents' Association" },
      { href: "/student-services/anti-ragging", label: "Anti Ragging Cell" },
      {
        href: "/student-services/women-cell",
        label: "Women Cell",
        children: [
          { href: "/student-services/women-cell/complaint", label: "Quick Complaint" },
        ],
      },
      {
        href: "/student-services/grievance-cell",
        label: "Grievance Cell",
        children: [
          { href: "/student-services/grievance-cell/submit", label: "Submit Your Grievances" },
        ],
      },
      { href: "/student-services/swachh-bharat", label: "Swachh Bharat" },
    ],
  },
  {
    href: "/clubs",
    label: "Clubs",
    children: [
      { href: "/clubs/ncc", label: "NCC" },
      { href: "/clubs/nss", label: "NSS" },
      { href: "/clubs/red-ribbon-club", label: "Red Ribbon Club" },
      { href: "/clubs/ndli-club", label: "NDLI Club" },
      { href: "/clubs/green-club", label: "Green Club" },
      { href: "/clubs/electoral-literacy-club", label: "Electoral Literacy Club" },
      { href: "/clubs/chess-club", label: "Chess Club" },
      { href: "/clubs/cultural-club", label: "Cultural Club" },
      { href: "/clubs/drama-club", label: "Drama Club" },
      { href: "/clubs/college-choir", label: "College Choir" },
      { href: "/clubs/ai-club", label: "AI Club" },
    ],
  },
  { href: "/downloads", label: "Downloads" },
  { href: "/gallery", label: "Gallery" },
  { href: "/alumni", label: "Alumni" },
  { href: "/contact", label: "Contact Us" },
]

