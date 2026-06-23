import type { CommitteeSeed } from "./committee-utils"

export const COMMITTEES_ACADEMIC_YEAR = "2026 – 2027"

export const EX_OFFICIO_MEMBERS: { name: string; role: string }[] = [
  { name: "Dr (Fr) Jogesh B Sangma SDB", role: "Principal" },
  { name: "Fr John Paul Tirkey", role: "Vice Principal" },
  { name: "Dr Meuller Beul M Sangma", role: "IQAC Coordinator" },
  { name: "Dr Yubaraj Sharma", role: "Asst Coordinator" },
  { name: "Mr Kaushik Paul", role: "Asst Coordinator" },
]

export const COMMITTEES: CommitteeSeed[] = [
  {
    name: "INTERNAL QUALITY ASSURANCE CELL (IQAC)",
    description:
      "The Internal Quality Assurance Cell (IQAC) of a college is responsible for developing and implementing systems to ensure continuous improvement in academic and administrative performance. It plans, monitors, and evaluates quality benchmarks in teaching, learning, research, and institutional activities. The IQAC coordinates the preparation and submission of reports such as the Annual Quality Assurance Report (AQAR) to accrediting bodies like the National Assessment and Accreditation Council. It promotes best practices, innovation, and a learner-centric environment within the institution. In addition, it facilitates documentation, feedback collection, and internal audits to sustain and enhance overall institutional quality.",
    members: [
      { slNo: 1, name: "Dr (Fr) Jogesh B Sangma", role: "Principal – Chairperson" },
      { slNo: 2, name: "Fr John Paul Tirkey", role: "Vice Principal" },
      { slNo: 3, name: "Dr Meuller Beul M Sangma", role: "Coordinator & Criterion 6" },
      { slNo: 4, name: "Dr Lolly Pereira, NEHU", role: "External member" },
      { slNo: 5, name: "Dr L.K Gracy, NEHU", role: "External Member, Alumna" },
      { slNo: 6, name: "Dr Yubaraj Sharma", role: "Asst Coordinator & Criterion 2 & SSS Coordinator" },
      { slNo: 7, name: "Mr Kaushik Paul", role: "Asst Coordinator & Extended Profile" },
      { slNo: 8, name: "Dr Lilybell Ch Marak", role: "Criterion 3" },
      { slNo: 9, name: "Dr Colnat B Marak", role: "Criterion 4" },
      { slNo: 10, name: "Ms Westerley R Marak", role: "Criterion 5" },
      { slNo: 11, name: "Mr Andrew B Sangma", role: "Criterion 7" },
      { slNo: 12, name: "Ms Jordana Dipera R Marak", role: "Criterion 1" },
      { slNo: 13, name: "Mr Hilarius Ch Sangma", role: "Development Community Representative" },
      { slNo: 14, name: "Mrs Barcelona Ch Momin", role: "Non-teaching representative" },
      { slNo: 15, name: "Mrs Rehny A Sangma", role: "Library" },
    ],
  },
  {
    name: "ACADEMIC COUNCIL",
    description:
      "The Academic Council is the supreme academic authority within the college, charged with upholding standards in teaching, learning, and evaluation. Under the close supervision of the Principal, it approves academic regulations, and examination systems in alignment with the norms of the University Grants Commission and the affiliating university. It sanctions new programmes, academic collaborations, and research initiatives to ensure relevance and excellence. It monitors academic performance, enforces compliance with statutory requirements, and mandates corrective action where necessary. Its decisions are authoritative and binding, subject only to the statutes and ordinances of the university.",
    members: [
      { slNo: 1, name: "Dr (Fr) Jogesh B Sangma", role: "Chairperson" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Heads of Departments", role: null },
    ],
  },
  {
    name: "RUSA (RASHTRIYA UCHCHATAR SHIKSHA ABHIYAN) COMMITTEE",
    description:
      "The RUSA Committee plans, coordinates, and oversees the implementation of institutional development grants under the authority of the Principal. It formulates comprehensive Institutional Development Plans and ensures the optimal, transparent utilization of allocated funds for infrastructure expansion, procurement of academic resources, and equity initiatives. It ensures strict compliance with the guidelines and norms of the Rashtriya Uchchatar Shiksha Abhiyan, the Ministry of Education, and the DHTE.",
    members: [
      { slNo: 1, name: "Dr Sabindra Barman", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Dr Pranita Hajong", role: null },
      { slNo: 4, name: "Ms Westerley R Marak", role: null },
      { slNo: 5, name: "Mr Shiv R Marak", role: null },
      { slNo: 6, name: "Mr Jevelline A Sangma", role: null },
    ],
  },
  {
    name: "INTERNAL COMPLAINTS CELL (ICC) – POSH 2013",
    description:
      "The Internal Complaints Cell (ICC) functions in accordance with the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 under the authority of the Principal. It receives, inquires into, and redresses complaints of sexual harassment in a fair, confidential, and time-bound manner. It ensures due process, natural justice, and protection against victimization in all proceedings. It conducts awareness and prevention programmes to promote a safe and dignified workplace. It maintains records, submits statutory reports, and ensures full legal compliance and accountability.",
    members: [
      { slNo: 1, name: "Dr Uma Roy Bhowmik", role: "Coordinator" },
      { slNo: 2, name: "Ms Westerley R Marak", role: "Asst Coordinator" },
      { slNo: 3, name: "Dr Jacqueline R Marak", role: "External Member" },
      { slNo: 4, name: "Ms Anse Wanne Momin", role: "External Member" },
      { slNo: 5, name: "Ex-Officio members", role: null },
      { slNo: 6, name: "Mrs Arantxa Shannon R Marak", role: null },
      { slNo: 7, name: "Dr Wanphai Mary K Japang", role: null },
      { slNo: 8, name: "Mr Habul Das", role: null },
      { slNo: 9, name: "Dr Sanggra A Sangma", role: null },
      { slNo: 10, name: "Mr Mahidhar Rajbongshi", role: null },
    ],
  },
  {
    name: "EXAMINATION COMMITTEE",
    description:
      "The Examination Committee plans and conducts all examinations and internal assessments under the authority of the Principal. It ensures compliance with the norms of the University Grants Commission and the affiliating university. It oversees question setting, scheduling, invigilation, evaluation, and timely publication of results. It evaluates results, identifies trends, and recommends the way forward for academic improvement. It safeguards confidentiality, maintains records, and ensures accountability and audit readiness.",
    members: [
      { slNo: 1, name: "Mr Dhiraj Kumar Rabha", role: "Coordinator" },
      { slNo: 2, name: "Mr Surjoron Hajong", role: "Asst Coordinator" },
      { slNo: 3, name: "Ex-Officio members", role: null },
      { slNo: 4, name: "Mr Bikki Ch Sangma", role: null },
      { slNo: 5, name: "Ms Alwisha T Sangma", role: null },
      { slNo: 6, name: "Ms Kasinchi A Marak", role: null },
      { slNo: 7, name: "Mr Jesterfield D Sangma", role: null },
      { slNo: 8, name: "Mr Marcus B Sangma", role: null },
    ],
  },
  {
    name: "RTI and GRIEVANCE REDRESSAL CELL",
    description:
      "The RTI and Grievance Redressal Cell ensures transparency and accountability under the authority of the Principal. It processes applications in accordance with the Right to Information Act, 2005 and maintains timely, lawful disclosure of information. It receives, examines, and resolves grievances of students and staff in a fair and time-bound manner. It ensures due process, confidentiality, and protection against victimization. It maintains records and submits reports to ensure compliance and effective redressal.",
    members: [
      { slNo: 1, name: "Principal", role: "Designated Appellate Authority" },
      { slNo: 2, name: "Vice Principal", role: "Public Information Officer" },
      { slNo: 3, name: "Ex-Officio members", role: null },
      { slNo: 4, name: "Mr Stephen T Sangma", role: null },
      { slNo: 5, name: "Ms Friangky M Marak", role: null },
      { slNo: 6, name: "Mrs Benobitha M Sangma", role: null },
      { slNo: 7, name: "Mrs Judalin Kharsandi", role: null },
      { slNo: 8, name: "Mr Tenang R Marak", role: null },
      { slNo: 9, name: "Mr Bikki Ch Sangma", role: null },
    ],
  },
  {
    name: "ADMISSION COMMITTEE",
    description:
      "The Admission Committee plans and executes the admission process under the supervision and with the knowledge of the Principal. It frames and implements policies in line with the norms of the University Grants Commission and the affiliating university. It ensures transparency, merit, and equity in seat allocation. It verifies documents, finalizes admission lists, and resolves related grievances. It maintains records and submits reports for accountability and audit.",
    members: [
      { slNo: 1, name: "Dr (Fr) Jogesh B Sangma", role: "Principal, Chairman" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Dr Arindam Ghosh", role: null },
      { slNo: 4, name: "Dr Uma Roy Bhowmik", role: null },
      { slNo: 5, name: "Mrs Nokme M Marak", role: null },
      { slNo: 6, name: "Mr Jesterfield D Sangma", role: null },
      { slNo: 7, name: "Mrs Barcelona Ch Momin", role: null },
      { slNo: 8, name: "Mr Ringrang M Sangma", role: null },
      { slNo: 9, name: "Dr Meuller Beul M Sangma", role: null },
      { slNo: 10, name: "Dr Yubaraj Sharma", role: null },
    ],
  },
  {
    name: "CAMPUS BUILDING and INFRASTRUCTURE DEVELOPMENT and MAINTENANCE COMMITTEE",
    description:
      "The committee looks into all major constructions and infrastructural needs of the college, college hostels, sporting and other facilities. The committee helps draw up project proposals and discusses ways of meeting the needs. It suggests sources of funding for the infrastructure needs from government and non-governmental sources as well as from management and the college's own funds. It sees to the calling of tenders, examining the proposals, merits of the contractors and builders, cost factor etc. prior to approving the awarding of contracts. It serves as a Screening Committee for all the major constructions of the college. It follows up the timeline and qualitative nature of the projects once the work commences. It seeks to the timely completion of the projects, approves delays if any, and other eventualities that may arise. The Committee also sees to the fulfilment of legal and financial requirements such as obtaining of permissions, completion reports, electrifications, safety and security systems, auditing of financial statements, preparation and submission of reports etc. This committee also assist the Principal in allotting rooms, assessing departmental requirements and ensuring regular maintenance to avoid inconvenience to staff and students.",
    members: [
      { slNo: 1, name: "Dr (Fr) Jogesh B Sangma", role: "Principal – Coordinator" },
      { slNo: 2, name: "Fr Pius Varghese", role: "Rector and External Member" },
      { slNo: 3, name: "Fr John Paul Tirkey", role: "Vice Principal – Advisor" },
      { slNo: 4, name: "RUSA Members", role: "DHTE Shillong" },
      { slNo: 5, name: "Mr Silchi Sangma", role: "Architect" },
      { slNo: 6, name: "Mr Basudeo Bhagat", role: "Contractor" },
      { slNo: 7, name: "Ex-Officio members", role: null },
      { slNo: 8, name: "Dr Colnat B Marak", role: null },
      { slNo: 9, name: "Mr Susai Sagayaraj", role: null },
    ],
  },
  {
    name: "ACADEMIC COMMITTEE",
    description:
      "The Academic Committee prepares, approves, and enforces the monthly and annual academic calendars and class routines. It ensures timely completion of the syllabus in conformity with the norms of the University Grants Commission and the affiliating university. It conducts periodic syllabus reviews to sustain academic rigor and relevance. It undertakes academic audits to assess teaching standards, schedule adherence, and learning outcomes. It enforces compliance, maintains records, and directs corrective action to uphold institutional quality. The Committee also enforces student attendance in accordance with institutional rules and the affiliating university. It monitors and verifies attendance records regularly to ensure accuracy and compliance. It identifies shortages, issues notices, and recommends appropriate action, including ineligibility for examinations where required. It maintains authenticated records and submits periodic reports to the Principal. It promotes attendance discipline and ensures transparency and accountability in enforcement.",
    members: [
      { slNo: 1, name: "Dr Madhusudhan Saha", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Dr Uma Roy Bhowmik", role: "Calendar, Routine" },
      { slNo: 4, name: "Mr Habul Das", role: "Attendance, Routine" },
      { slNo: 5, name: "Dr Sugata Debnath", role: "Routine, Syllabus coverage review" },
      { slNo: 6, name: "Mr Sengprang A Sangma", role: "Routine, Syllabus coverage review" },
      { slNo: 7, name: "Mr Jesterfield D Sangma", role: "Attendance, Routine" },
      { slNo: 8, name: "Mrs Rani Aruldass", role: "Syllabus coverage review" },
      { slNo: 9, name: "Mr Ringrang M Sangma", role: "Attendance" },
      { slNo: 10, name: "Mr Savio A Sangma", role: null },
      { slNo: 11, name: "Mr Sengkam Sangma", role: null },
      { slNo: 12, name: "Dr Meuller Beul M Sangma", role: "Calendar, Routine" },
      { slNo: 13, name: "Dr Yubaraj Sharma", role: "Calendar, Routine" },
    ],
  },
  {
    name: "NEP CUM INTERNSHIP CELL",
    description:
      "The NEP cum Internship Cell is a committee constituted to facilitate the effective implementation of the National Education Policy 2020 and to institutionalise internship/ apprenticeship as an integral part of undergraduate programs. The NEP Cell coordinate with departments to introduce MajorMinor combinations, vocational courses and skill-based courses, conduct interaction sessions for faculty, students and parents on NEP guidelines, credit requirements and course choices. The Internship Cell identify and partner with government bodies, NGOs, industries for internship opportunities. It supervises internship proposals, faculty mentorship, organise pre-internship workshops on report writing, workplace ethics and professional communication. The Internship cell ensures that post-internship presentations are conducted by students as part of their evaluation. The cell is responsible for scheduling and documenting these presentations to meet NEP and University requirements.",
    members: [
      { slNo: 1, name: "Mr Tapsreng Jones K Sangma", role: "Coordinator (NEP)" },
      { slNo: 2, name: "Dr Meuller Beul M Sangma", role: "Nodal officer, Internship Cell" },
      { slNo: 3, name: "Ex-Officio members", role: null },
      { slNo: 4, name: "Mrs Kimberley Nokimbe G Momin", role: null },
      { slNo: 5, name: "Mr Toijam Sanjeev Lyngdoh", role: null },
      { slNo: 6, name: "Mr Jesterfield D Sangma", role: null },
    ],
  },
  {
    name: "SWAYAM/MOOCS COMMITTEE",
    description:
      "The objective of this cell is to promote blended learning by facilitating student and faculty enrolment in SWAYAM/MOOCs courses, and to integrate them into the credit framework as per UGC and NEP 2020 guidelines. This cell will organise sessions for students and faculty on SWAYAM, NPTEL, AICTE, CEC and other UGC approved MOOCs platforms. It will assist students in registration, selection of courses and timely submission of assignments on the SWAYAM portal, monitor students' progress, completion rates and certification, maintain records of enrolments, credits earned for NAAC, NIRF and university audits, submit periodic reports to IQAC.",
    members: [
      { slNo: 1, name: "Mr Toijam Sanjeev Lyngdoh", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Mrs Tusumika Adhikary", role: null },
      { slNo: 4, name: "Mr Bravewell Mawthoh", role: null },
      { slNo: 5, name: "Dr Sugata Debnath", role: null },
      { slNo: 6, name: "Mr Brilliant N Marak", role: null },
    ],
  },
  {
    name: "ACADEMIC & ADMINISTRATIVE AUDIT CELL",
    description:
      "The Academic & Administrative Audit Cell ensures institutional accountability and quality by systematically reviewing academic and administrative performance and recommending measures for continuous improvement.",
    members: [
      { slNo: 1, name: "Mr Bravewell Mawthoh", role: "Coordinator" },
      { slNo: 2, name: "Dr Sabindra Barman", role: null },
      { slNo: 3, name: "Ms Westerley R Marak", role: null },
      { slNo: 4, name: "Mr Namsang K Marak", role: null },
    ],
  },
  {
    name: "LIBRARY ADVISORY COMMITTEE",
    description:
      "The Library Advisory Committee plans and oversees the development and effective functioning of the college library. It recommends procurement of books, journals, and digital resources in line with academic needs and the norms of the University Grants Commission. It formulates policies for access, circulation, and optimal utilization of library resources. It monitors services, infrastructure, and user satisfaction, and recommends improvements. It ensures proper record-keeping, compliance, and accountability in library operations.",
    members: [
      { slNo: 1, name: "Dr Colnat B Marak", role: "Coordinator" },
      { slNo: 2, name: "Mrs Rehny A Sangma", role: "Librarian – Asst Coordinator" },
      { slNo: 3, name: "Ex-Officio members", role: null },
      { slNo: 4, name: "Ms Jordana Dipera R Marak", role: null },
      { slNo: 5, name: "Mr Bravewell Mawthoh", role: null },
      { slNo: 6, name: "Mr Stephen T Sangma", role: "Asst Librarian" },
    ],
  },
  {
    name: "STUDENTS WELFARE ASSOCIATION",
    description:
      "The Students Welfare Association promotes student wellbeing, representation, and engagement under the authority of the Principal. It organizes welfare initiatives, activities, and programmes in line with institutional policy and the norms of the University Grants Commission. It serves as a channel for student voice, coordination, and leadership. It supports inclusive participation, discipline, and campus harmony. It maintains records and ensures transparency, accountability, and effective functioning.",
    members: [
      { slNo: 1, name: "Fr John Paul Tirkey", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Mr Binendro N Marak", role: null },
      { slNo: 4, name: "Mr Ksanbor Kharkongor", role: null },
      { slNo: 5, name: "Mr Gaurav Biswas", role: null },
      { slNo: 6, name: "Ms Bonme A Sangma", role: null },
      { slNo: 7, name: "Ms Estania D Shira", role: null },
      { slNo: 8, name: "All SWA members", role: null },
    ],
  },
  {
    name: "STUDENT SUPPORT AND PROGRESSION COMMITTEE",
    description:
      "The Student Support and Progression Committee oversees student welfare, guidance, and advancement under the authority of the Principal. It ensures support services in line with the norms of the University Grants Commission and institutional policy. It facilitates mentoring, counselling, scholarships, placements, and progression to higher studies. It tracks student performance, progression, and outcomes for continuous improvement. It maintains records and ensures transparency, accountability, and effective student support systems.",
    members: [
      { slNo: 1, name: "Fr John Paul Tirkey", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Dr Meuller Beul M Sangma", role: "Mentoring" },
      { slNo: 4, name: "Mrs Rubitha A Sangma", role: "Mentoring" },
      { slNo: 5, name: "Mr Kaushik Paul", role: "Computer Skills" },
      { slNo: 6, name: "Mr John Sathish", role: "Computer Skills" },
      { slNo: 7, name: "Mr Jevelline A Sangma", role: "Computer Skills" },
      { slNo: 8, name: "Mrs Tusumika Adhikary", role: "Soft Skills and Personality Development" },
      { slNo: 9, name: "Ms Dolina R Sangma", role: "Soft Skills and Personality Development" },
      { slNo: 10, name: "Mrs Bristina D Shira", role: "Student Exposure" },
      { slNo: 11, name: "Mrs Arantxa Shannon R Marak", role: "Student Exposure" },
      { slNo: 12, name: "Ms Genevive A Sangma", role: "English Improvement" },
      { slNo: 13, name: "Ms Jessy T Sangma", role: "English Improvement" },
    ],
  },
  {
    name: "ANTI RAGGING, DRESS CODE AND DISCIPLINE COMMITTEE",
    description:
      "The Anti-Ragging, Dress Code and Discipline Committee enforces campus discipline under the authority of the Principal. It ensures strict compliance with anti-ragging regulations, institutional dress code, and codes of conduct in line with the norms of the University Grants Commission. It monitors, prevents, and takes action against violations, including ragging and indiscipline. It conducts awareness programmes to promote a safe, respectful, and orderly campus environment. It maintains records and ensures transparency, due process, and accountability in all disciplinary matters.",
    members: [
      { slNo: 1, name: "Mr Sengprang A Sangma", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Mr Bindarash R Marak", role: null },
      { slNo: 4, name: "Dr Arindam Ghosh", role: null },
      { slNo: 5, name: "Mr Abhimanyu Sharma", role: null },
      { slNo: 6, name: "Dr Madhusudhan Saha", role: null },
      { slNo: 7, name: "Ms Jessy T Sangma", role: null },
      { slNo: 8, name: "Mrs Rani Aruldass", role: null },
      { slNo: 9, name: "Mrs Anitha Ch Momin", role: null },
      { slNo: 10, name: "Dr Tamara Sangma", role: null },
      { slNo: 11, name: "Mr Gripseng G Momin", role: null },
      { slNo: 12, name: "Ms Friangky M Marak", role: null },
      { slNo: 13, name: "Mr Thomas M Marak", role: null },
      { slNo: 14, name: "Dr Meuller Beul M Sangma", role: null },
      { slNo: 15, name: "Mr Salman Ch Marak", role: null },
    ],
  },
  {
    name: "PLACEMENT, CAREER GUIDANCE & COUNSELLING COMMITTEE",
    description:
      "The Placement, Career Guidance & Counselling Committee plans, coordinates, and oversees student career progression under the authority of the Principal. It facilitates campus recruitment drives, industry-institute partnerships, and corporate collaborations to create diverse employment opportunities. It designs and implements capacity-building programmes, professional skill development workshops, and coaching for competitive examinations in line with the norms of the University Grants Commission.",
    members: [
      { slNo: 1, name: "Dr Wanphai Mary K Japang", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Mr Gaurav Biswas", role: null },
      { slNo: 4, name: "Mr Ksanbor Kharkongor", role: null },
      { slNo: 5, name: "Mr Tapsreng Jones K Sangma", role: null },
      { slNo: 6, name: "Dr Tamara Sangma", role: null },
    ],
  },
  {
    name: "CELL FOR PERSONS WITH DISABILITIES",
    description:
      "The Cell for Persons with Disabilities ensures inclusive education and support for differently-abled students under the authority of the Principal. It facilitates access, reasonable accommodation, and assistive services in line with the Rights of Persons with Disabilities Act, 2016 and University Grants Commission guidelines. It identifies needs, coordinates support services, and removes barriers to participation. It promotes awareness and sensitization within the campus community. It maintains records and ensures compliance, equity, and accountability.",
    members: [
      { slNo: 1, name: "Mrs Bristina D Shira", role: "Coordinator" },
      { slNo: 2, name: "Mrs Popy Dey", role: "Asst Coordinator" },
      { slNo: 3, name: "Ex-Officio members", role: null },
      { slNo: 4, name: "Mr Ferick Salnang D Sangma", role: null },
      { slNo: 5, name: "Mrs Tusumika Adhikary", role: null },
    ],
  },
  {
    name: "PAST PUPILS' ASSOCIATION",
    description:
      "The Past Pupils Association fosters a strong and active network between the college and its alumni under the guidance of the Principal. It promotes unity, mutual support, and engagement in line with institutional values. It organizes meetings, events, and outreach activities, and mobilizes alumni contributions for institutional development. It maintains an updated alumni database and ensures effective communication. It ensures proper documentation, transparency, and accountability in all its activities.",
    members: [
      { slNo: 1, name: "Mr Binendro N Marak", role: "Coordinator" },
      { slNo: 2, name: "Mr Sengprang A Sangma", role: "Asst Coordinator" },
      { slNo: 3, name: "Ex-Officio members", role: null },
      { slNo: 4, name: "Mrs Rubitha A Sangma", role: null },
      { slNo: 5, name: "Ms Tengme K Marak", role: null },
      { slNo: 6, name: "Ms Jasmine Sylvera Ch Marak", role: null },
      { slNo: 7, name: "Mrs Nokme M Marak", role: null },
      { slNo: 8, name: "Mr Jesterfield D Sangma", role: null },
      { slNo: 9, name: "Mrs Popy Dey", role: null },
      { slNo: 10, name: "Mr Dhiraj Kumar Rabha", role: null },
      { slNo: 11, name: "Mr Abhimanyu Sharma", role: null },
      { slNo: 12, name: "Ms Kasan Chokchim M Sangma", role: null },
    ],
  },
  {
    name: "STAFF WELFARE AND DEVELOPMENT",
    description:
      "The Staff Welfare and Development Committee functions under the overall authority and guidance of the Principal to promote staff well-being and professional growth. It plans and implements welfare measures, support systems, and development programmes in line with institutional policy and the norms of the University Grants Commission. It organizes training, capacity-building, and career advancement initiatives with the approval of the Principal. It addresses staff concerns and places recommendations before the Principal for appropriate action. It maintains records and submits reports to the Principal to ensure accountability and continuous improvement. This committee also help staff resolve NPS-related issues.",
    members: [
      { slNo: 1, name: "Ms Zinnia K Marak", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Ms Tengme K Marak", role: "Staff Development Programmes" },
      { slNo: 4, name: "Mr Mahidhar Rajbongshi", role: "Staff Welfare" },
      { slNo: 5, name: "Dr Sugata Debnath", role: "Staff Welfare" },
      { slNo: 6, name: "Dr Yubaraj Sharma", role: "NPS implementation" },
      { slNo: 7, name: "Mrs Kimberley Nokimbe G Momin", role: "NPS implementation" },
    ],
  },
  {
    name: "RESEARCH AND DEVELOPMENT CELL",
    description:
      "The Research and Development Cell promotes and coordinates research activities under the authority of the Principal. It ensures compliance with the norms of the University Grants Commission and relevant regulatory bodies. It facilitates research proposals, funding, collaborations, and publications. It monitors research output, ethics, and quality standards. It maintains records and recommends measures to strengthen a sustained research culture and innovation.",
    members: [
      { slNo: 1, name: "Dr Madhusudhan Saha", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Dr Uma Roy Bhowmik", role: null },
      { slNo: 4, name: "Dr Arindam Ghosh", role: null },
      { slNo: 5, name: "Dr Pranita Hajong", role: null },
      { slNo: 6, name: "Dr Sugata Debnath", role: null },
      { slNo: 7, name: "Dr Colnat B Marak", role: null },
      { slNo: 8, name: "Dr Tamara Sangma", role: null },
      { slNo: 9, name: "Dr Sabindra Barman", role: null },
      { slNo: 10, name: "Dr Lilybell Ch Marak", role: null },
      { slNo: 11, name: "Dr Sanggra A Sangma", role: null },
      { slNo: 12, name: "Dr Wanphai Mary K Japang", role: null },
      { slNo: 13, name: "Dr Meuller Beul M Sangma", role: null },
      { slNo: 14, name: "Dr Yubaraj Sharma", role: null },
    ],
  },
  {
    name: "PUBLICATION CELL",
    description:
      "The Publication Cell plans, reviews, and oversees all institutional publications under the authority of the Principal. It ensures quality, accuracy, and compliance with the norms of the University Grants Commission and applicable copyright standards. It coordinates editing, design, and timely release of newsletters, journals, reports, and official documents. It promotes faculty and student publications and upholds academic integrity. It maintains publication records and ensures accountability and proper dissemination.",
    members: [
      { slNo: 1, name: "Mr Tenang R Marak", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Mrs Arantxa Shannon R Marak", role: null },
      { slNo: 4, name: "Mr Susai Sagayaraj", role: "Circulation Manager" },
    ],
  },
  {
    name: "SOURCE JOURNAL - SOCIAL SCIENCES",
    description:
      "The Source Journal (Social Sciences) Committee manages the planning, review, and publication of the college's social sciences journal under the authority of the Principal. It ensures rigorous peer review, academic integrity, and compliance with the norms of the University Grants Commission. It invites, screens, edits, and curates quality research articles for publication. It ensures timely release, proper indexing, and wide dissemination of the journal. It maintains records and upholds transparency, ethics, and accountability in the publication process.",
    members: [
      { slNo: 1, name: "Dr Colnat B Marak", role: "Chief Editor" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Dr Wanphai Mary K Japang", role: null },
      { slNo: 4, name: "Dr Meuller Beul M Sangma", role: null },
      { slNo: 5, name: "Mrs Rubitha A Sangma", role: null },
      { slNo: 6, name: "Ms Tengme K Marak", role: null },
      { slNo: 7, name: "Mr Namsang K Marak", role: null },
      { slNo: 8, name: "Ms Chare N Sangma", role: null },
    ],
  },
  {
    name: "TRANSIENT - JOURNAL NATURAL SCIENCES",
    description:
      "The Transient Journal (Natural Sciences) Committee plans, reviews, and publishes the college's natural sciences journal under the authority of the Principal. It ensures rigorous peer review, research ethics, and compliance with the norms of the University Grants Commission. It invites, screens, and edits quality manuscripts for publication. It ensures timely release, proper indexing, and effective dissemination. It maintains records and upholds transparency, integrity, and accountability in the publication process.",
    members: [
      { slNo: 1, name: "Dr Arindam Ghosh", role: "Chief Editor" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Dr Lilybell Ch Marak", role: null },
      { slNo: 4, name: "Mr Toijam Sanjeev Lyngdoh", role: null },
      { slNo: 5, name: "Dr Pranita Hajong", role: null },
      { slNo: 6, name: "Dr Yubaraj Sharma", role: null },
    ],
  },
  {
    name: "COLLEGE MAGAZINE",
    description:
      "The College Magazine Committee plans, compiles, and publishes the college magazine under the authority of the Principal. It invites, screens, and edits student and staff contributions to ensure quality and originality. It oversees design, layout, and timely publication. It ensures proper representation of academic, cultural, and institutional activities. It maintains records and ensures accountability and wide dissemination.",
    members: [
      { slNo: 1, name: "Ms Tengme K Marak", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Ms Genevive A Sangma", role: null },
      { slNo: 4, name: "Ms Jessy T Sangma", role: null },
      { slNo: 5, name: "Mrs Cherimchi M Sangma", role: null },
      { slNo: 6, name: "Ms Chakme R Marak", role: null },
      { slNo: 7, name: "Mrs Anitha Ch Momin", role: null },
      { slNo: 8, name: "Mr Marcus B Sangma", role: null },
    ],
  },
  {
    name: "WEBSITE, PUBLICITY AND DOCUMENTATION",
    description:
      "The Website, Publicity & Documentation Committee manages and updates the official college website and all institutional communications under the authority of the Principal. It ensures accurate, timely, and compliant dissemination of information in line with the norms of the University Grants Commission. It handles publicity, media relations, and branding of academic and co-curricular activities. It maintains digital content, archives, and records with due authentication. It ensures transparency, consistency, and accountability in all public communications. This committee also manages the systematic collection, verification and preservation of all institutional records through accurate and timely documentation.",
    members: [
      { slNo: 1, name: "Ms Jordana Dipera R Marak", role: "Coordinator" },
      { slNo: 2, name: "Ms Genevive A Sangma", role: "Asst. Coordinator" },
      { slNo: 3, name: "Mr Kaushik Paul", role: "Asst. Coordinator" },
      { slNo: 4, name: "Ex-Officio members", role: null },
      { slNo: 5, name: "Mr John Sathish", role: null },
      { slNo: 6, name: "Mr Jevelline A Sangma", role: null },
      { slNo: 7, name: "Ms Chichi Ch Sangma", role: null },
      { slNo: 8, name: "Mr Zakkur D Sangma", role: null },
      { slNo: 9, name: "Mr Brilliant N Marak", role: null },
    ],
  },
  {
    name: "IPR AND BIOSAFETY COMMITTEE",
    description:
      "The IPR and Biosafety Committee regulates intellectual property and biosafety matters under the authority of the Principal. It ensures compliance with national laws, institutional policy, and the norms of the University Grants Commission. It facilitates patenting, copyright, and protection of research outputs. It enforces biosafety protocols, ethical standards, and risk management in laboratories. It maintains records and ensures accountability, compliance, and responsible research practices.",
    members: [
      { slNo: 1, name: "Dr Pranita Hajong", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Dr Sanggra A Sangma", role: null },
      { slNo: 4, name: "Ms Dolina R Sangma", role: null },
      { slNo: 5, name: "Ms Suzan Maryl S Marak", role: null },
      { slNo: 6, name: "Ms Zinnia K Marak", role: null },
      { slNo: 7, name: "Mr Bravewell Mawthoh", role: null },
    ],
  },
  {
    name: "DISASTER MANAGEMENT COMMITTEE",
    description:
      "The Disaster Management Committee plans, implements, and oversees disaster preparedness and response under the authority of the Principal. It ensures compliance with the Disaster Management Act, 2005 and institutional safety protocols. It conducts risk assessment, mock drills, and awareness programmes for the campus community. It coordinates emergency response, evacuation, and recovery measures. It maintains records and ensures readiness, safety, and accountability at all times.",
    members: [
      { slNo: 1, name: "Mr Binendro N Marak", role: "Coordinator" },
      { slNo: 2, name: "Mr Nicholas M Sangma", role: "Asst Coordinator" },
      { slNo: 3, name: "Ms Jasmine Sylvera Ch Marak", role: "NCC CTO" },
      { slNo: 4, name: "Ex-Officio members", role: null },
      { slNo: 5, name: "Ms Chichi Ch Sangma", role: null },
      { slNo: 6, name: "Mr Bindarash R Marak", role: "NSS PO" },
      { slNo: 7, name: "Mr Nikjrang A Sangma", role: null },
    ],
  },
  {
    name: "STAKEHOLDERS APPRAISAL COMMITTEE",
    description:
      "The Stakeholders Appraisal Committee oversees structured feedback and appraisal of academic and institutional performance under the authority of the Principal. It designs and administers appraisal tools for students, teachers, and parents in line with the norms of the University Grants Commission. It collects, analyses, and validates feedback to assess teaching quality, student experience, and institutional effectiveness. It ensures confidentiality, fairness, and data integrity in the appraisal process. It submits reports and recommends corrective measures for continuous improvement and accountability.",
    members: [
      { slNo: 1, name: "Fr John Paul Tirkey", role: "Coordinator" },
      { slNo: 2, name: "Ms Genevive A Sangma", role: "Asst Coordinator" },
      { slNo: 3, name: "Ex-Officio members", role: null },
      { slNo: 4, name: "Mrs Benobitha M Sangma", role: "Parents Appraisal" },
      { slNo: 5, name: "Mrs Chanchi Aman R Marak", role: "Parents Appraisal" },
      { slNo: 6, name: "Mr Thomas M Marak", role: "Student's Appraisal" },
      { slNo: 7, name: "Ms Nenzebi Ch Sangma", role: "Student's Appraisal" },
      { slNo: 8, name: "Mr Abhimanyu Sharma", role: "Staff Appraisal" },
      { slNo: 9, name: "Ms Estania D Shira", role: "Staff Appraisal" },
    ],
  },
  {
    name: "GAMES AND SPORTS COMMITTEE",
    description:
      "The Games and Sports Committee plans and promotes sports and physical education activities under the authority of the Principal. It organizes tournaments, training, and participation in intercollege events in line with the norms of the University Grants Commission. It develops sports infrastructure and encourages student participation for fitness and teamwork. It ensures discipline, safety, and proper conduct in all activities. It maintains records and ensures accountability and effective management of sports programmes.",
    members: [
      { slNo: 1, name: "Fr John Paul Tirkey", role: "Vice Principal – Advisor" },
      { slNo: 2, name: "Mr Nicholas M Sangma", role: "Coordinator" },
      { slNo: 3, name: "Mr Sengprang A Sangma", role: "Asst Coordinator" },
      { slNo: 4, name: "Ex-Officio members", role: null },
      { slNo: 5, name: "Mr Binendro N Marak", role: null },
      { slNo: 6, name: "Mrs Cherimchi M Sangma", role: null },
      { slNo: 7, name: "Ms Alwisha T Sangma", role: null },
      { slNo: 8, name: "Mr Bindarash R Marak", role: null },
      { slNo: 9, name: "Mr Surjoron Hajong", role: null },
      { slNo: 10, name: "Mr Gaurav Biswas", role: null },
      { slNo: 11, name: "Mrs Judalin Kharsandi", role: null },
      { slNo: 12, name: "Mr Dhiraj Kumar Rabha", role: null },
      { slNo: 13, name: "Mr Bikki Ch Sangma", role: null },
      { slNo: 14, name: "Mr Susai Sagayaraj", role: null },
      { slNo: 15, name: "SWA Sports Secretary", role: null },
    ],
  },
  {
    name: "LITERARY, CULTURAL, AND SOCIAL COMMITTEE",
    description:
      "The Literary, Cultural, Choir and Social Committee plans and conducts literary, cultural, musical, and social activities of the college. It promotes student participation, talent development, and holistic formation in line with institutional values. It organizes events, competitions, and outreach programmes with due discipline and coordination. It ensures proper scheduling, supervision, and documentation under the authority of the Principal. It maintains records and reports, ensuring accountability and continuity of activities.",
    members: [
      { slNo: 1, name: "Ms Friangky M Marak", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Mr Nicholas M Sangma", role: null },
      { slNo: 4, name: "Mrs Rani Aruldass", role: null },
      { slNo: 5, name: "Mr Namsang K Marak", role: null },
      { slNo: 6, name: "Ms Jessy T Sangma", role: null },
      { slNo: 7, name: "Mrs Cherimchi M Sangma", role: null },
      { slNo: 8, name: "Mr Surjoron Hajong", role: null },
      { slNo: 9, name: "Ms Alwisha T Sangma", role: null },
      { slNo: 10, name: "Mr Bindarash R Marak", role: null },
      { slNo: 11, name: "Mr Uzziel S Momin", role: null },
      { slNo: 12, name: "Mr Marcus B Sangma", role: null },
      { slNo: 13, name: "Dr Meuller Beul M Sangma", role: null },
      { slNo: 14, name: "SWA President and Cultural Secretary", role: null },
    ],
  },
  {
    name: "UBA – UNNAT BHARAT ABHIYAN COMMITTEE",
    description:
      "Unnat Bharat Abhiyan (UBA) aims to connect higher education institutions with rural India to drive sustainable development through knowledge and innovation. It mobilizes faculty and students to identify local challenges in villages and design practical, community-based solutions. UBA promotes participatory development by working closely with Panchayats and rural communities rather than imposing external models. It encourages the application of academic research, technology, and traditional wisdom to improve livelihoods, sanitation, education, and infrastructure. Ultimately, UBA builds socially responsible graduates while fostering inclusive, self-reliant, and sustainable rural transformation.",
    members: [
      { slNo: 1, name: "Mr Namsang K Marak", role: "Coordinator" },
      { slNo: 2, name: "Ms Chichi Ch Sangma", role: "Asst Coordinator" },
      { slNo: 3, name: "Ex-Officio members", role: null },
      { slNo: 4, name: "Mr Tenang R Marak", role: null },
      { slNo: 5, name: "Mr Bikki Ch Sangma", role: null },
      { slNo: 6, name: "Mrs Cherimchi M Sangma", role: null },
      { slNo: 7, name: "Mrs Rehny A Sangma", role: null },
    ],
  },
  {
    name: "NSS AND RED RIBBON CLUB",
    description:
      "National Service Scheme (NSS) aims to develop students' personality through community service by engaging them in activities like village development, cleanliness drives, health awareness, and social outreach. It instills values of social responsibility, leadership, and national integration through active participation in real-life community issues. NSS volunteers work closely with local communities to promote education, environmental protection, and civic consciousness. Red Ribbon Club (RRC) focuses on creating awareness about HIV/AIDS, promoting safe and healthy lifestyles, and reducing stigma and discrimination. It encourages voluntary blood donation, peer education, and youth-led campaigns on health and hygiene. RRC empowers young people to act as responsible citizens and health ambassadors within their institutions and communities.",
    members: [
      { slNo: 1, name: "Mr Surjoron Hajong", role: "NSS PO" },
      { slNo: 2, name: "Ms Jordana Dipera R Marak", role: "Nodal officer, RRC" },
      { slNo: 3, name: "Mr Dhiraj Kumar Rabha", role: "Asst Coordinator – NSS" },
      { slNo: 4, name: "Ex-Officio members", role: null },
      { slNo: 5, name: "Mrs Sengmatchi M Sangma", role: "RRC" },
      { slNo: 6, name: "Ms Bristina D Shira", role: "RRC" },
      { slNo: 7, name: "Ms Renchi Ch Sangma", role: "NSS" },
      { slNo: 8, name: "Mrs Chanchi Aman R Marak", role: "NSS" },
      { slNo: 9, name: "Mr Zakkur D Sangma", role: "NSS" },
    ],
  },
  {
    name: "NATIONAL CADET CORPS",
    description:
      "National Cadet Corps (NCC) aims to develop disciplined, confident, and responsible citizens through basic military training and character-building activities. It instills values of leadership, patriotism, teamwork, and selfless service among young students. NCC provides training in drills, adventure activities, disaster management, and community service. It prepares cadets for potential careers in the armed forces while fostering a spirit of national unity and integrity. Overall, NCC shapes youth into capable leaders committed to the nation and society.",
    members: [
      { slNo: 1, name: "Ms Jasmine Sylvera Ch Marak", role: "CTO NCC" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Mr Abhimanyu Sharma", role: null },
      { slNo: 4, name: "Mr Isaac Kadimwasa", role: null },
      { slNo: 5, name: "Mr Ferick Salnang D Sangma", role: null },
      { slNo: 6, name: "Mr Shiv R Marak", role: null },
      { slNo: 7, name: "Mr Joseph M Marak", role: null },
    ],
  },
  {
    name: "GREEN CLUB",
    description:
      "The Green Club promotes environmental awareness and sustainable practices under the authority of the Principal. It plans and implements eco-friendly initiatives in line with the norms of the University Grants Commission. It organizes activities such as tree plantation, waste management, and energy conservation. It fosters student participation and environmental responsibility across the campus. It maintains records and ensures accountability and continuity of green initiatives.",
    members: [
      { slNo: 1, name: "Mrs Rani Aruldass", role: "Coordinator" },
      { slNo: 2, name: "Ex-Officio members", role: null },
      { slNo: 3, name: "Ms Sengbachi G Momin", role: null },
      { slNo: 4, name: "Ms Bristina D Shira", role: null },
      { slNo: 5, name: "Ms Estania D Shira", role: null },
      { slNo: 6, name: "Mrs Popy Dey", role: null },
      { slNo: 7, name: "Ms Nenzebi Ch Sangma", role: null },
      { slNo: 8, name: "Ms Chanchi Aman R Marak", role: null },
    ],
  },
]
