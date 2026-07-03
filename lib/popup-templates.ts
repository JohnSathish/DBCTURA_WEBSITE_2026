export type PopupTemplate = {
  id: string
  name: string
  popupType: string
  content: string
}

export const POPUP_TEMPLATES: PopupTemplate[] = [
  {
    id: "fyug-admission-2026",
    name: "FYUG Admission 2026",
    popupType: "admission",
    content: `<div class="popup-fyug">
<div class="popup-fyug-banner">
<p class="popup-fyug-college">Don Bosco College, Tura</p>
<p class="popup-fyug-program">Fourth-Year Undergraduate Honours Programme</p>
<p class="popup-fyug-session">NEP 2020 · Academic Session 2026–2027</p>
</div>
<p class="popup-fyug-status"><span class="popup-fyug-status-dot" aria-hidden="true"></span> Registration is now open for eligible FYUP students</p>
<div class="popup-fyug-eligibility">
<p class="popup-fyug-eligibility-title">Eligibility</p>
<ul class="popup-fyug-list">
<li><span class="popup-fyug-check" aria-hidden="true">✓</span><span>Bona fide student of an NEHU-affiliated college</span></li>
<li><span class="popup-fyug-check" aria-hidden="true">✓</span><span>Pursuing Four-Year Undergraduate Programme (FYUP) under NEP 2020</span></li>
<li><span class="popup-fyug-check" aria-hidden="true">✓</span><span>Successfully completed <strong>Semester V</strong> with <strong>no back papers</strong></span></li>
</ul>
</div>
<div class="popup-fyug-cta">
<a href="/admissions/fyug-2026" class="popup-btn">Register Now</a>
</div>
<p class="popup-fyug-footnote">Affiliated to North Eastern Hill University (NEHU), Shillong<br>Re-accredited with &apos;B&apos; Grade by NAAC, Bangalore</p>
</div>`,
  },
  {
    id: "admission-open",
    name: "Admission Open",
    popupType: "admission",
    content: `<div style="text-align:center">
<h1>Admission Open 2026–27</h1>
<p>Applications are now invited for undergraduate programmes at Don Bosco College, Tura.</p>
<a href="/question-papers" class="popup-btn">Apply Now</a>
</div>`,
  },
  {
    id: "event-announcement",
    name: "Event Announcement",
    popupType: "event",
    content: `<div style="text-align:center">
<h2>Upcoming College Event</h2>
<p>Join us for an exciting programme on campus. All students and staff are welcome.</p>
<a href="/news" class="popup-btn popup-btn-secondary">Read More</a>
</div>`,
  },
  {
    id: "exam-notification",
    name: "Exam Notification",
    popupType: "notice",
    content: `<div>
<h2>Examination Notification</h2>
<p>Please check the notice board for the latest examination schedule and guidelines.</p>
<ul>
<li>Carry your admit card</li>
<li>Report 15 minutes early</li>
<li>Follow dress code</li>
</ul>
<a href="/notice-board" class="popup-btn">View Notice Board</a>
</div>`,
  },
  {
    id: "placement-drive",
    name: "Placement Drive",
    popupType: "announcement",
    content: `<div style="text-align:center">
<h2>Campus Placement Drive</h2>
<p>Eligible final-year students are invited to register for the upcoming placement session.</p>
<a href="/student-services" class="popup-btn">Register Now</a>
</div>`,
  },
  {
    id: "holiday-notice",
    name: "Holiday Notice",
    popupType: "notice",
    content: `<div>
<h2>Holiday Notice</h2>
<p>The college will remain closed on the notified date. Regular classes will resume as per the academic calendar.</p>
<p><em>Stay safe and check the website for updates.</em></p>
</div>`,
  },
]

export const POPUP_CTA_BUTTONS = [
  { label: "Register Now (FYUG)", html: '<a href="/admissions/fyug-2026" class="popup-btn">Register Now</a>' },
  { label: "Apply Now", html: '<a href="/question-papers" class="popup-btn">Apply Now</a>' },
  { label: "Read More", html: '<a href="/news" class="popup-btn popup-btn-secondary">Read More</a>' },
  { label: "Register", html: '<a href="/student-services" class="popup-btn">Register</a>' },
  {
    label: "Custom CTA",
    html: '<a href="/" class="popup-btn" target="_blank" rel="noopener noreferrer">Learn More</a>',
  },
]
