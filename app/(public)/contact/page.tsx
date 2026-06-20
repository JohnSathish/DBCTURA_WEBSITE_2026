import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import ContactView from "@/components/contact/ContactView"

export const metadata = {
  title: "Contact Us | Don Bosco College, Tura",
  description:
    "Get in touch with Don Bosco College, Tura — phone, email, campus address, office hours, and contact form.",
}

export default function ContactPage() {
  return (
    <>
      <BreadcrumbTitleSetter title="Contact Us" />
      <ContactView />
    </>
  )
}
