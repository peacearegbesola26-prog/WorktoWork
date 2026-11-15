import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Globe2,
  Sparkles,
  Bookmark,
  LayoutDashboard,
  BriefcaseBusiness,
  Bell,
  ShieldCheck,
} from "lucide-react";
import workspace from "@/assets/workspace.jpg";
import { PublicShell, Brand, SourceIcon, EmptyState, StatusBadge, ActionLink } from "./shared";
import { Button } from "@/components/ui/button";
export function DashboardPreview() {
  return (
    <div className="preview-window">
      <aside className="preview-sidebar">
        <Brand />
        <div className="preview-nav">
          {[
            [LayoutDashboard, "Dashboard"],
            [Search, "Social Discovery"],
            [Globe2, "Web Discovery"],
            [Bookmark, "Saved Opportunities"],
            [BriefcaseBusiness, "Application Tracker"],
            [Bell, "Alerts"],
            [Sparkles, "Career Toolkit"],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof Search;
            return (
              <div className={i === 0 ? "active" : ""} key={String(label)}>
                <I size={14} />
                {String(label)}
              </div>
            );
          })}
        </div>
      </aside>
      <div className="preview-body">
        <div className="preview-toolbar">
          <span>YOUR OPPORTUNITY WORKSPACE</span>
          <StatusBadge>Workspace overview</StatusBadge>
        </div>
        <div className="preview-greeting">
          <div>
            <h3>A world of possibilities.</h3>
            <p>Your next opportunity could be just one search away.</p>
          </div>
          <Button asChild size="sm">
            <Link to="/app/social">
              <Search /> Find opportunities
            </Link>
          </Button>
        </div>
        <EmptyState
          title="Your opportunities, in one place"
          description="Sign in to view your saved opportunities and applications. Live discovery is not connected yet."
        />
      </div>
    </div>
  );
}
export function Landing() {
  return (
    <PublicShell>
      <section className="hero">
        <img
          src={workspace}
          width={1920}
          height={1024}
          alt="Professional working in a bright creative workspace"
          className="hero-image"
        />
        <div className="site-container hero-content">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <Sparkles size={12} /> YOUR NEXT CHAPTER STARTS HERE
            </span>
            <h1>
              Find Your Next
              <br />
              Opportunity.
              <br />
              <span>Everywhere.</span>
            </h1>
            <p className="hero-description">
              Organise your skills, work preferences and applications in a private workspace. Live
              discovery and AI career tools are not connected yet.
            </p>
            <div className="hero-actions">
              <ActionLink to="/signup">Start Finding Opportunities</ActionLink>
              <Button asChild variant="outline" size="lg">
                <Link to="/app/dashboard">
                  <ArrowUpRight size={14} /> Open workspace
                </Link>
              </Button>
            </div>
            <p className="hero-note">
              <ShieldCheck size={13} /> Real accounts. Private profiles and application tracking.
            </p>
          </div>
        </div>
      </section>
      <section className="source-band">
        <div className="site-container">
          <div className="source-band-inner">
            <p>
              More places to discover.
              <br />
              <strong>One place to move forward.</strong>
            </p>
            <div className="source-logos">
              {["LinkedIn", "Facebook", "Instagram", "TikTok", "Reddit", "Web"].map((s) => (
                <span className="source-logo" key={s}>
                  <SourceIcon source={s} />
                  {s === "Web" ? "The wider web" : s}
                </span>
              ))}
            </div>
          </div>
          <p className="source-band-note">
            Planned discovery sources. Live connectors are not configured; access depends on each
            platform’s permissions and policies.
          </p>
        </div>
      </section>
      <section className="section section-muted">
        <div className="site-container">
          <div className="section-title center">
            <p className="eyebrow">LESS SEARCHING. MORE POSSIBILITY.</p>
            <h2>Your next move, all in one place.</h2>
            <p>
              Discover opportunities, keep your shortlist organised, and prepare for what comes
              next.
            </p>
          </div>
          <DashboardPreview />
          <p className="legal-note text-center">
            Your workspace shows only your actual account records.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container">
          <div className="section-title">
            <p className="eyebrow">BUILT FOR YOUR NEXT CHAPTER</p>
            <h2>Great work can start anywhere.</h2>
            <p>Give your opportunity search a little more direction.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <Search size={21} />
              </div>
              <h3>Discover beyond the job board</h3>
              <p>
                Explore social discovery and the wider web in separate, focused searches. Narrow
                your results by skills, location, and work preferences.
              </p>
              <Link to="/app/social">
                Explore discovery <ArrowRight size={14} />
              </Link>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Bookmark size={21} />
              </div>
              <h3>Keep your next steps together</h3>
              <p>
                Save the opportunities that stand out and follow each application from your first
                shortlist through to an offer.
              </p>
              <Link to="/app/tracker">
                See the application tracker <ArrowRight size={14} />
              </Link>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Sparkles size={21} />
              </div>
              <h3>Put your best work forward</h3>
              <p>
                Draft your resume for this session. Resume optimisation and application preparation
                will be available when AI is connected.
              </p>
              <Link to="/app/toolkit">
                Discover your career toolkit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-muted">
        <div className="site-container">
          <div className="section-title center">
            <p className="eyebrow">FROM DISCOVERY TO YOUR NEXT STEP</p>
            <h2>A more intentional way to find work.</h2>
          </div>
          <div className="steps">
            <div>
              <span className="step-number">01</span>
              <h3>Tell us what you do</h3>
              <p>
                Choose your skills, preferred countries, and the kind of opportunity you’re looking
                for.
              </p>
            </div>
            <div>
              <span className="step-number">02</span>
              <h3>Explore the possibilities</h3>
              <p>
                Live discovery is not connected yet. Future discovery will use official APIs,
                licensed services, and other permitted sources.
              </p>
            </div>
            <div>
              <span className="step-number">03</span>
              <h3>Make your next move</h3>
              <p>
                Save your shortlist, track applications, and build a resume that brings your
                experience together.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <p className="eyebrow">A NEW CHAPTER AWAITS</p>
        <h2>Make room for your next opportunity.</h2>
        <p>Take a look around your future workspace.</p>
        <ActionLink to="/app/dashboard">Open your workspace</ActionLink>
      </section>
    </PublicShell>
  );
}
