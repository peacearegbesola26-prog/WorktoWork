import { useWebsite, WebsiteText } from "@/features/website/context";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell, Field, StatusBadge, ActionLink } from "./shared";
export function HowItWorks() {
  return (
    <PublicShell>
      <div className="site-container">
        <header className="public-page-head">
          <p className="eyebrow">
            <WebsiteText page="public" id="1" fallback="FROM POSSIBILITY TO YOUR NEXT CHAPTER" />
          </p>
          <h1>
            <WebsiteText page="public" id="2" fallback="How Work to Work works." />
          </h1>
          <p>
            <WebsiteText
              page="public"
              id="3"
              fallback="A focused workspace for discovering opportunities and preparing your next application."
            />
          </p>
        </header>
        <section className="section">
          <div className="steps">
            <div>
              <span className="step-number">
                <WebsiteText page="public" id="4" fallback="01" />
              </span>
              <h3>
                <WebsiteText page="public" id="5" fallback="Choose what you’re looking for" />
              </h3>
              <p>
                <WebsiteText
                  page="public"
                  id="6"
                  fallback="Search by skills, service, country, source, date and work location. Social Discovery and Web Discovery offer separate search experiences."
                />
              </p>
            </div>
            <div>
              <span className="step-number">
                <WebsiteText page="public" id="7" fallback="02" />
              </span>
              <h3>
                <WebsiteText page="public" id="8" fallback="Discover with context" />
              </h3>
              <p>
                <WebsiteText
                  page="public"
                  id="9"
                  fallback="See the source, skills and available information alongside each opportunity. Missing details are marked Unknown, not guessed."
                />
              </p>
            </div>
            <div>
              <span className="step-number">
                <WebsiteText page="public" id="10" fallback="03" />
              </span>
              <h3>
                <WebsiteText page="public" id="11" fallback="Organise your next move" />
              </h3>
              <p>
                <WebsiteText
                  page="public"
                  id="12"
                  fallback="Save promising opportunities, track application stages and prepare your resume. No automatic outreach or application submission."
                />
              </p>
            </div>
          </div>
        </section>
        <p className="legal-note">
          <WebsiteText
            page="public"
            id="13"
            fallback="Accounts, profiles, application tracking, saved resumes and AI resume suggestions are available. Live discovery and other AI career tools are not connected."
          />
        </p>
        <section className="section narrow-content">
          <h2 className="text-2xl mb-5">
            <WebsiteText page="public" id="14" fallback="Discovery, with clear boundaries." />
          </h2>
          <p className="legal-note">
            <WebsiteText
              page="public"
              id="15"
              fallback="Future opportunity discovery will use official APIs, authorised feeds, licensed search services and other permitted sources. Public visibility does not automatically grant collection rights. Each platform’s access and policies must be validated separately."
            />
          </p>
          <p className="legal-note">
            <WebsiteText
              page="public"
              id="16"
              fallback="AI career tools will prepare suggestions for you to review, never silently send applications or publish changes on your behalf."
            />
          </p>
          <ActionLink to="/app/dashboard">
            <WebsiteText page="public" id="17" fallback="Open your workspace" />
          </ActionLink>
        </section>
      </div>
    </PublicShell>
  );
}
export function Pricing() {
  const plans = [
    {
      name: "Free",
      description: "A starting point for your opportunity search.",
      features: ["Basic discovery", "Saved opportunities", "Basic career tools"],
    },
    {
      name: "Pro",
      description: "More depth for a more focused search.",
      features: [
        "Advanced discovery filters",
        "Opportunity alerts",
        "Resume optimisation",
        "Application organisation",
      ],
    },
    {
      name: "Premium",
      description: "A broader toolkit for your next chapter.",
      features: [
        "Advanced matching",
        "Job-specific resume tailoring",
        "Multiple opportunity alerts",
        "Career analytics",
      ],
    },
  ];
  return (
    <PublicShell>
      <div className="site-container">
        <header className="public-page-head">
          <StatusBadge>
            <WebsiteText page="pricing" id="18" fallback="Planned pricing" />
          </StatusBadge>
          <h1>
            <WebsiteText page="pricing" id="19" fallback="A plan for your next chapter." />
          </h1>
          <p>
            <WebsiteText
              page="pricing"
              id="20"
              fallback="These are proposed plans, not available subscriptions. Prices, limits and features will be confirmed before launch."
            />
          </p>
        </header>
        <div className="pricing-grid">
          {plans.map((p, i) => (
            <article className={`price-card ${i === 1 ? "featured" : ""}`} key={p.name}>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <p className="price">
                <WebsiteText page="pricing" id="21" fallback="To be announced" />
              </p>
              <span className="sample-label">
                <WebsiteText
                  page="pricing"
                  id="22"
                  fallback="Planned · Not available for purchase"
                />
              </span>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={i === 1 ? "default" : "outline"}>
                <Link to="/app/dashboard">
                  <WebsiteText page="pricing" id="23" fallback="Open workspace" />
                  <ArrowUpRight />
                </Link>
              </Button>
            </article>
          ))}
        </div>
        <p className="legal-note text-center mb-12">
          <WebsiteText
            page="pricing"
            id="24"
            fallback="No checkout, billing or subscriptions are connected in this stage."
          />
        </p>
      </div>
    </PublicShell>
  );
}
export function Contact() {
  const [message, setMessage] = useState("");
  const { settings } = useWebsite();
  return (
    <PublicShell>
      <div className="site-container">
        <header className="public-page-head">
          <p className="eyebrow">
            <WebsiteText page="contact" id="25" fallback="LET’S TALK ABOUT WHAT’S NEXT" />
          </p>
          <h1>
            <WebsiteText page="contact" id="26" fallback="Get in touch." />
          </h1>
          <p>
            <WebsiteText
              page="contact"
              id="27"
              fallback="Questions, ideas, or feedback about Work to Work?"
            />
          </p>
        </header>
        <div className="contact-layout">
          <div>
            <h2>
              <WebsiteText
                page="contact"
                id="28"
                fallback="A better next chapter starts with a conversation."
              />
            </h2>
            <p>
              <WebsiteText
                page="contact"
                id="29"
                fallback="Our contact channel is not connected yet. No messages can be sent."
              />
            </p>
            <StatusBadge>
              <WebsiteText page="contact" id="30" fallback="Contact delivery not connected" />
            </StatusBadge>
          </div>
          {settings.supportEmail && (
            <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
          )}
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage("Message not sent. Contact delivery is not connected.");
            }}
          >
            <Field label="Name">
              <input required placeholder="Your name" disabled autoComplete="off" />
            </Field>
            <Field label="Email address">
              <input
                required
                type="email"
                placeholder="Email address"
                disabled
                autoComplete="off"
              />
            </Field>
            <Field label="Message">
              <textarea disabled placeholder="Contact delivery not connected" />
            </Field>
            <Button type="submit" disabled>
              <WebsiteText page="contact" id="31" fallback="Contact not connected" />
              <ArrowRight />
            </Button>
            {message && (
              <p role="status" className="error-inline">
                {message}
              </p>
            )}
            <p className="legal-note">
              <WebsiteText
                page="contact"
                id="32"
                fallback="No contact details or messages are stored or transmitted."
              />
            </p>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}
