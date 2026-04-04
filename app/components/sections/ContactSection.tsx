"use client";

import type { ContactInfo } from "../../types/resume";

interface Props {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
}

const inputClass =
  "w-full px-3 py-2 border border-zinc-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";

const labelClass = "block text-sm font-medium text-zinc-700 mb-1";

export default function ContactSection({ contact, onChange }: Props) {
  const handleChange = (field: keyof ContactInfo, value: string) => {
    onChange({ ...contact, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Contact Information</h2>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="contact-name">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={contact.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      <div className="bg-white rounded-xl border border-zinc-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="contact-email">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={contact.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="contact-phone">
            Phone Number
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={contact.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="contact-linkedin">
            LinkedIn URL
          </label>
          <input
            id="contact-linkedin"
            type="url"
            value={contact.linkedin}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="contact-github">
            GitHub URL
          </label>
          <input
            id="contact-github"
            type="url"
            value={contact.github}
            onChange={(e) => handleChange("github", e.target.value)}
            placeholder="https://github.com/username"
            className={inputClass}
          />
        </div>
      </div>
    </div>
    </div>
  );
}
