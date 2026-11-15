import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell, Field, DemoBadge, DemoNotice, ActionLink } from "./shared";
export function HowItWorks() {
  return (
    <PublicShell>
      <div className="site-container">
        <header className="public-page-head">
          <p className="eyebrow">FROM POSSIBILITY TO YOUR NEXT CHAPTER</p>
          <h1>How Work to Work works.</h1>
          <p>
            A focused workspace for discovering opportunities and preparing your next application.
          </p>
        </header>
        <section className="section">
          <div className="steps">
            <div>
              <span className="step-number">01</span>
              <h3>Choose what you’re looking for</h3>
              <p>
                Search by skills, service, country, source, date and work location. Social Discovery
                and Web Discovery offer separate search experiences.
              </p>
            </div>
            <div>
              <span className="step-number">02</span>
              <h3>Discover with context</h3>
              <p>
                See the source, skills and available information alongside each opportunity. Missing
                details are marked Unknown, not guessed.
              </p>
            </div>
            <div>
              <span className="step-number">03</span>
              <h3>Organise your next move</h3>
              <p>
                Save promising opportunities, track application stages and prepare your resume. No
                automatic outreach or application submission.
              </p>
            </div>
          </div>
        </section>
        <DemoNotice>
          Stage 1 searches fictional demonstration records only. Live discovery and AI require later
          integrations.
        </DemoNotice>
        <section className="section narrow-content">
          <h2 className="text-2xl mb-5">Discovery, with clear boundaries.</h2>
          <p className="legal-note">
            Future opportunity discovery will use official APIs, authorised feeds, licensed search
            services and other permitted sources. Public visibility does not automatically grant
            collection rights. Each platform’s access and policies must be validated separately.
          </p>
          <p className="legal-note">
            AI career tools will prepare suggestions for you to review, never silently send
            applications or publish changes on your behalf.
          </p>
          <ActionLink to="/demo/dashboard">Explore the Demo</ActionLink>
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
          <DemoBadge>Planned pricing</DemoBadge>
          <h1>A plan for your next chapter.</h1>
          <p>
            These are proposed plans, not available subscriptions. Prices, limits and features will
            be confirmed before launch.
          </p>
        </header>
        <div className="pricing-grid">
          {plans.map((p, i) => (
            <article className={`price-card ${i === 1 ? "featured" : ""}`} key={p.name}>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <p className="price">To be announced</p>
              <span className="sample-label">Planned · Not available for purchase</span>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={i === 1 ? "default" : "outline"}>
                <Link to="/demo/dashboard">
                  Explore the free demo <ArrowUpRight />
                </Link>
              </Button>
            </article>
          ))}
        </div>
        <p className="legal-note text-center mb-12">
          No checkout, billing or subscriptions are connected in this stage.
        </p>
      </div>
    </PublicShell>
  );
}
export function Contact() {
  const [message, setMessage] = useState("");
  return (
    <PublicShell>
      <div className="site-container">
        <header className="public-page-head">
          <p className="eyebrow">LET’S TALK ABOUT WHAT’S NEXT</p>
          <h1>Get in touch.</h1>
          <p>Questions, ideas, or feedback about Work to Work?</p>
        </header>
        <div className="contact-layout">
          <div>
            <h2>A better next chapter starts with a conversation.</h2>
            <p>
              Our contact channel will be available when messaging is connected. For now, you can
              review the form in demonstration mode.
            </p>
            <DemoBadge>Contact delivery not connected</DemoBadge>
          </div>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(
                "Message not sent. Contact delivery is not connected in this demonstration.",
              );
            }}
          >
            <Field label="Name">
              <input required placeholder="Demo name" autoComplete="off" />
            </Field>
            <Field label="Email address">
              <input
                required
                type="email"
                placeholder="Use a fictional demo email"
                autoComplete="off"
              />
            </Field>
            <Field label="Message">
              <textarea required placeholder="Your question or feedback" />
            </Field>
            <Button type="submit">
              Preview contact request <ArrowRight />
            </Button>
            {message && (
              <p role="status" className="error-inline">
                {message}
              </p>
            )}
            <p className="legal-note">No contact details or messages are stored or transmitted.</p>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}
