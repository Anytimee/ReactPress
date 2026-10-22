import type { Config } from "@puckeditor/core";
import { ArrowRight, Check, Sparkles, Zap, Shield, Plus } from "lucide-react";
import React from "react";

export const puckConfig: Config = {
  categories: {
    navigation: { title: "NAVIGATION", components: ["HeaderBlock", "FooterBlock"] },
    introduction: { title: "INTRODUCTION", components: ["HeroSection", "BentoBlock"] },
    content: { title: "CONTENT", components: ["ImageBlock", "FeatureCards", "SectionBlock", "HeadingBlock", "ParagraphBlock", "ButtonBlock"] },
    socialProof: { title: "SOCIAL PROOF", components: ["TestimonialsBlock", "StatsBlock"] },
    business: { title: "BUSINESS", components: ["PricingBlock", "CtaBlock", "FaqBlock"] },
  },
  components: {
    // 1. HEADER
    HeaderBlock: {
      fields: {
        logoText: { type: "text" },
        navLinks: {
          type: "array",
          arrayFields: { label: { type: "text" }, href: { type: "text" } },
          defaultItemProps: { label: "Link", href: "#" },
        },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
      },
      defaultProps: {
        logoText: "ReactPress",
        navLinks: [
          { label: "Home", href: "/" },
          { label: "Product", href: "/product" },
          { label: "Company", href: "/company" },
        ],
        ctaLabel: "Get Started",
        ctaHref: "#",
      },
      render: ({ logoText, navLinks, ctaLabel, ctaHref }) => (
        <header className="flex items-center justify-between border-b border-[var(--line)] bg-white px-8 py-4">
          <a href="/" className="text-xl font-bold tracking-tight text-[var(--ink)]">{logoText}</a>
          <nav className="hidden gap-6 text-sm font-medium text-[var(--muted)] md:flex">
            {navLinks?.map((link, i) => (
              <a key={i} href={link.href} className="hover:text-[var(--ink)] transition-colors">{link.label}</a>
            ))}
          </nav>
          <a href={ctaHref} className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors">
            {ctaLabel}
          </a>
        </header>
      ),
    },

    // 2. HERO SECTION
    HeroSection: {
      fields: {
        heading: { type: "text" },
        description: { type: "textarea" },
        primaryCta: { type: "text" },
        primaryHref: { type: "text" },
        secondaryCta: { type: "text" },
        secondaryHref: { type: "text" },
      },
      defaultProps: {
        heading: "Bangun website modern tanpa batas",
        description: "Editor visual, blok kustom, dan performa tinggi. Semua dalam satu tempat.",
        primaryCta: "Mulai Sekarang",
        primaryHref: "#",
        secondaryCta: "Pelajari lebih lanjut",
        secondaryHref: "#",
      },
      render: ({ heading, description, primaryCta, primaryHref, secondaryCta, secondaryHref }) => (
        <section className="flex flex-col items-center justify-center px-8 py-24 text-center bg-white">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight text-[var(--ink)] md:text-6xl">{heading}</h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">{description}</p>
          <div className="mt-10 flex items-center gap-4">
            <a href={primaryHref} className="flex items-center gap-2 rounded-md bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white hover:bg-black transition-colors">
              {primaryCta} <ArrowRight size={16}/>
            </a>
            <a href={secondaryHref} className="rounded-md border border-[var(--line)] bg-white px-6 py-3 text-sm font-medium text-[var(--ink)] hover:bg-gray-50 transition-colors">
              {secondaryCta}
            </a>
          </div>
        </section>
      ),
    },

    // 3. BENTO GRID (Bisa Tambah/Hapus Card)
    BentoBlock: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        cards: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            desc: { type: "textarea" },
            buttonText: { type: "text" },
            buttonHref: { type: "text" },
            size: { 
              type: "select", 
              options: [
                { label: "Kecil (1 Kolom)", value: "col-span-1" }, 
                { label: "Besar (2 Kolom)", value: "col-span-2" }
              ] 
            }
          },
          defaultItemProps: { 
            title: "Card Baru", 
            desc: "Deskripsi card.", 
            buttonText: "Pelajari", 
            buttonHref: "#",
            size: "col-span-1"
          }
        }
      },
      defaultProps: {
        title: "Something new!",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        cards: [
          { title: "Card 1", desc: "Deskripsi fitur utama.", buttonText: "Pelajari", buttonHref: "#", size: "col-span-2" },
          { title: "Card 2", desc: "Deskripsi fitur tambahan.", buttonText: "Mulai", buttonHref: "#", size: "col-span-1" },
        ],
      },
      render: ({ title, description, cards }) => (
        <section className="px-8 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-medium text-white mb-4">Platform</span>
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">{title}</h2>
            <p className="mt-3 max-w-xl text-[var(--muted)]">{description}</p>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards?.map((c, i) => (
                <div 
                  key={i} 
                  className={`${c.size || "col-span-1"} rounded-2xl bg-gray-50 p-8 border border-[var(--line)] min-h-[250px] flex flex-col justify-end`}
                >
                  <h3 className="text-xl font-semibold text-[var(--ink)]">{c.title}</h3>
                  <p className="text-sm text-[var(--muted)] mt-2 mb-4">{c.desc}</p>
                  {c.buttonText && (
                    <a href={c.buttonHref} className="inline-flex items-center text-sm font-medium text-[var(--ink)] hover:underline">
                      {c.buttonText} <ArrowRight size={14} className="ml-1"/>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    // 4. IMAGE BLOCK
    ImageBlock: {
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
        width: { 
          type: "select", 
          options: [
            { label: "Full Width", value: "100%" },
            { label: "Large (75%)", value: "75%" },
            { label: "Medium (50%)", value: "50%" },
            { label: "Small (25%)", value: "25%" }
          ] 
        },
        align: {
          type: "select",
          options: [
            { label: "Kiri", value: "left" },
            { label: "Tengah", value: "center" },
            { label: "Kanan", value: "right" }
          ]
        }
      },
      defaultProps: {
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
        alt: "Placeholder Image",
        width: "100%",
        align: "center"
      },
      render: ({ src, alt, width, align }) => {
        if (!src) return null;
        const alignClass = align === "left" ? "mr-auto" : align === "right" ? "ml-auto" : "mx-auto";
        return (
          <section className="px-8 py-4 bg-white">
            <div style={{ width }} className={`${alignClass} max-w-full`}>
              <img src={src} alt={alt} className="w-full rounded-lg object-cover shadow-sm border border-[var(--line)]" />
            </div>
          </section>
        );
      },
    },

    // 5. FEATURE CARDS
    FeatureCards: {
      fields: { features: { type: "array", arrayFields: { icon: { type: "select", options: [{label:"Zap",value:"zap"},{label:"Shield",value:"shield"}] }, title: { type: "text" }, desc: { type: "textarea" } }, defaultItemProps: { icon: "zap", title: "Fitur", desc: "Deskripsi" } } },
      defaultProps: { features: [{ icon: "zap", title: "Performa Tinggi", desc: "Halaman dimuat dalam hitungan milidetik." }, { icon: "shield", title: "Aman", desc: "Data tersimpan di server Anda sendiri." }] },
      render: ({ features }) => (
        <section className="px-8 py-16 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {features?.map((f, i) => {
              const Icon = f.icon === "zap" ? Zap : Shield;
              return (
                <div key={i} className="flex flex-col items-start">
                  <div className="mb-4 rounded-lg bg-[var(--ink)] p-2 text-white"><Icon size={20}/></div>
                  <h3 className="text-lg font-semibold text-[var(--ink)]">{f.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      ),
    },

    // 6. TESTIMONIALS
    TestimonialsBlock: {
      fields: { heading: { type: "text" }, testimonials: { type: "array", arrayFields: { quote: { type: "textarea" }, author: { type: "text" } }, defaultItemProps: { quote: "Best decision we made.", author: "Jane Doe" } } },
      defaultProps: { heading: "Trusted by hundreds of businesses", testimonials: [{ quote: "Best decision 0. Our goal was to streamline.", author: "Jane Janson" }, { quote: "Best decision 1. Our goal was to streamline.", author: "Jane Janson" }] },
      render: ({ heading, testimonials }) => (
        <section className="px-8 py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--ink)] mb-12">{heading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials?.map((t, i) => (
                <div key={i} className="rounded-xl bg-white p-8 border border-[var(--line)]">
                  <p className="text-lg text-[var(--ink)]">"{t.quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <span className="text-sm font-medium text-[var(--muted)]">By {t.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    // 7. STATS
    StatsBlock: {
      fields: { heading: { type: "text" }, desc: { type: "textarea" }, stats: { type: "array", arrayFields: { value: { type: "text" }, label: { type: "text" } }, defaultItemProps: { value: "500", label: "Monthly active users" } } },
      defaultProps: { heading: "The numbers speak for themselves", desc: "Lorem ipsum dolor sit amet.", stats: [{ value: "500", label: "Monthly active users" }, { value: "20.1", label: "Daily active users" }, { value: "$523.520", label: "Monthly recurring revenue" }] },
      render: ({ heading, desc, stats }) => (
        <section className="px-8 py-20 bg-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
            <div className="flex-1">
              <span className="inline-block rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-medium text-white mb-4">Platform</span>
              <h2 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">{heading}</h2>
              <p className="mt-4 text-[var(--muted)]">{desc}</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {stats?.map((s, i) => (
                <div key={i} className="rounded-xl border border-[var(--line)] p-6 bg-gray-50">
                  <div className="text-3xl font-semibold text-[var(--ink)]">{s.value}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    // 8. PRICING
    PricingBlock: {
      fields: { heading: { type: "text" }, plans: { type: "array", arrayFields: { name: { type: "text" }, price: { type: "text" }, features: { type: "textarea" }, cta: { type: "text" }, href: { type: "text" } }, defaultItemProps: { name: "Plan 1", price: "$40", features: "Feature 1\nFeature 2", cta: "Sign up", href: "#" } } },
      defaultProps: { heading: "Something new!", plans: [{ name: "Plan 1", price: "$40", features: "Feature 1\nFeature 2", cta: "Sign up", href: "#" }, { name: "Plan 2", price: "$40", features: "Feature 1\nFeature 2", cta: "Sign up", href: "#" }, { name: "Plan 3", price: "$40", features: "Feature 1\nFeature 2", cta: "Sign up", href: "#" }] },
      render: ({ heading, plans }) => (
        <section className="px-8 py-20 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">{heading}</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {plans?.map((p, i) => (
                <div key={i} className="rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm">
                  <h3 className="text-lg font-medium text-[var(--muted)]">{p.name}</h3>
                  <div className="mt-4 text-4xl font-semibold text-[var(--ink)]">{p.price} <span className="text-sm font-normal text-[var(--muted)]">/ month</span></div>
                  <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
                    {p.features?.split("\n").map((f, j) => (
                      <li key={j} className="flex items-center gap-2"><Check size={16} className="text-[var(--ink)]"/> {f}</li>
                    ))}
                  </ul>
                  <a href={p.href} className="mt-8 block w-full rounded-md border border-[var(--line)] py-2 text-center text-sm font-medium text-[var(--ink)] hover:bg-gray-50 transition-colors">
                    {p.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    // 9. CTA
    CtaBlock: {
      fields: { heading: { type: "text" }, desc: { type: "textarea" }, cta: { type: "text" }, href: { type: "text" } },
      defaultProps: { heading: "Try our platform today!", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", cta: "Sign up here", href: "#" },
      render: ({ heading, desc, cta, href }) => (
        <section className="px-8 py-24 bg-gray-50 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">{heading}</h2>
            <p className="mt-4 text-lg text-[var(--muted)]">{desc}</p>
            <a href={href} className="mt-8 inline-flex items-center gap-2 rounded-md bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white hover:bg-black transition-colors">
              {cta} <ArrowRight size={16} />
            </a>
          </div>
        </section>
      ),
    },

    // 10. FAQ
    FaqBlock: {
      fields: { heading: { type: "text" }, faqs: { type: "array", arrayFields: { q: { type: "text" }, a: { type: "textarea" } }, defaultItemProps: { q: "Question?", a: "Answer." } } },
      defaultProps: { heading: "Frequently Asked Questions", faqs: [{ q: "Apa itu ReactPress?", a: "CMS modern berbasis React." }, { q: "Apakah gratis?", a: "Ya, open source." }] },
      render: ({ heading, faqs }) => (
        <section className="px-8 py-20 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-[var(--ink)] mb-8 text-center">{heading}</h2>
            <div className="space-y-4">
              {faqs?.map((f, i) => (
                <div key={i} className="border-b border-[var(--line)] pb-4">
                  <div className="flex justify-between items-center cursor-pointer">
                    <h3 className="text-lg font-medium text-[var(--ink)]">{f.q}</h3>
                    <Plus size={16} className="text-[var(--muted)]" />
                  </div>
                  <p className="mt-2 text-[var(--muted)]">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    // 11. FOOTER
    FooterBlock: {
      fields: { logoText: { type: "text" }, links: { type: "array", arrayFields: { label: { type: "text" }, href: { type: "text" } }, defaultItemProps: { label: "Link", href: "#" } } },
      defaultProps: { logoText: "ReactPress", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
      render: ({ logoText, links }) => (
        <footer className="border-t border-[var(--line)] bg-white px-8 py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-lg font-bold tracking-tight text-[var(--ink)]">{logoText}</div>
            <div className="flex gap-6 text-sm text-[var(--muted)]">
              {links?.map((l, i) => (
                <a key={i} href={l.href} className="hover:text-[var(--ink)]">{l.label}</a>
              ))}
            </div>
            <div className="text-sm text-[var(--muted)]">© 2026 ReactPress. All rights reserved.</div>
          </div>
        </footer>
      ),
    },

    // 12. BASIC BLOCKS
    SectionBlock: {
      fields: { content: { type: "slot" }, background: { type: "select", options: [{ label: "Putih", value: "white" }, { label: "Abu", value: "gray" }] } },
      defaultProps: { background: "white", content: [] },
      render: ({ content: Content, background }) => (
        <div className={`px-8 py-12 ${background === "gray" ? "bg-gray-50" : "bg-white"}`}><Content /></div>
      ),
    },
    HeadingBlock: {
      fields: { text: { type: "text" } },
      defaultProps: { text: "Judul Baru" },
      render: ({ text }) => <h2 className="text-2xl font-semibold text-[var(--ink)]">{text}</h2>,
    },
    ParagraphBlock: {
      fields: { text: { type: "textarea" } },
      defaultProps: { text: "Tulis paragraf di sini..." },
      render: ({ text }) => <p className="text-[15px] text-[var(--ink)]">{text}</p>,
    },
    ButtonBlock: {
      fields: { label: { type: "text" }, href: { type: "text" } },
      defaultProps: { label: "Klik", href: "#" },
      render: ({ label, href }) => <a href={href} className="inline-block rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-white">{label}</a>,
    },
  },
};
