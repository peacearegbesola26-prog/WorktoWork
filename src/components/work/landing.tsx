import { useWebsite, WebsiteText } from "@/features/website/context";
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
          <span>
            <WebsiteText page="home" id="1" fallback="YOUR OPPORTUNITY WORKSPACE" />
          </span>
          <StatusBadge>
            <WebsiteText page="home" id="2" fallback="Workspace overview" />
          </StatusBadge>
        </div>
        <div className="preview-greeting">
          <div>
            <h3>
              <WebsiteText page="home" id="3" fallback="A world of possibilities." />
            </h3>
            <p>
              <WebsiteText
                page="home"
                id="4"
                fallback="Your next opportunity could be just one search away."
              />
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/app/social">
              <Search />
              <WebsiteText page="home" id="5" fallback="Find opportunities" />
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
  const { pages } = useWebsite();
  const home = pages["home"];
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
              <Sparkles size={12} />
              <WebsiteText page="home" id="6" fallback="YOUR NEXT CHAPTER STARTS HERE" />
            </span>
            <h1>
              <WebsiteText page="home" id="7" fallback="Find Your Next" />
              <br />
              <WebsiteText page="home" id="8" fallback="Opportunity." />
              <br />
              <span>
                <WebsiteText page="home" id="9" fallback="Everywhere." />
              </span>
            </h1>
            <p className="hero-description">
              <WebsiteText
                page="home"
                id="10"
                fallback="Organise your applications, save private resumes and request AI resume suggestions. Live discovery is not connected yet."
              />
            </p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <a href={home?.primaryCta || "/signup"}>
                  <WebsiteText page="home" id="11" fallback="Start Finding Opportunities" />
                  <ArrowRight />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={home?.secondaryCta || "/app/dashboard"}>
                  <ArrowUpRight size={14} />
                  <WebsiteText page="home" id="12" fallback="Open workspace" />
                </a>
              </Button>
            </div>
            <p className="hero-note">
              <ShieldCheck size={13} />
              <WebsiteText
                page="home"
                id="13"
                fallback="Real accounts. Private profiles and application tracking."
              />
            </p>
          </div>
        </div>
      </section>
      <section className="source-band">
        <div className="site-container">
          <div className="source-band-inner">
            <p>
              <WebsiteText page="home" id="14" fallback="More places to discover." />
              <br />
              <strong>
                <WebsiteText page="home" id="15" fallback="One place to move forward." />
              </strong>
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
            <WebsiteText
              page="home"
              id="16"
              fallback="Planned discovery sources. Live connectors are not configured; access depends on each platform’s permissions and policies."
            />
          </p>
        </div>
      </section>
      <section className="section section-muted">
        <div className="site-container">
          <div className="section-title center">
            <p className="eyebrow">
              <WebsiteText page="home" id="17" fallback="LESS SEARCHING. MORE POSSIBILITY." />
            </p>
            <h2>
              <WebsiteText page="home" id="18" fallback="Your next move, all in one place." />
            </h2>
            <p>
              <WebsiteText
                page="home"
                id="19"
                fallback="Discover opportunities, keep your shortlist organised, and prepare for what comes next."
              />
            </p>
          </div>
          <DashboardPreview />
          <p className="legal-note text-center">
            <WebsiteText
              page="home"
              id="20"
              fallback="Your workspace shows only your actual account records."
            />
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container">
          <div className="section-title">
            <p className="eyebrow">
              <WebsiteText page="home" id="21" fallback="BUILT FOR YOUR NEXT CHAPTER" />
            </p>
            <h2>
              <WebsiteText page="home" id="22" fallback="Great work can start anywhere." />
            </h2>
            <p>
              <WebsiteText
                page="home"
                id="23"
                fallback="Give your opportunity search a little more direction."
              />
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <Search size={21} />
              </div>
              <h3>
                <WebsiteText page="home" id="24" fallback="Discover beyond the job board" />
              </h3>
              <p>
                <WebsiteText
                  page="home"
                  id="25"
                  fallback="Explore social discovery and the wider web in separate, focused searches. Narrow your results by skills, location, and work preferences."
                />
              </p>
              <Link to="/app/social">
                <WebsiteText page="home" id="26" fallback="Explore discovery" />
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Bookmark size={21} />
              </div>
              <h3>
                <WebsiteText page="home" id="27" fallback="Keep your next steps together" />
              </h3>
              <p>
                <WebsiteText
                  page="home"
                  id="28"
                  fallback="Save the opportunities that stand out and follow each application from your first shortlist through to an offer."
                />
              </p>
              <Link to="/app/tracker">
                <WebsiteText page="home" id="29" fallback="See the application tracker" />
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Sparkles size={21} />
              </div>
              <h3>
                <WebsiteText page="home" id="30" fallback="Put your best work forward" />
              </h3>
              <p>
                <WebsiteText
                  page="home"
                  id="31"
                  fallback="Save your resumes and review AI suggestions grounded in your own experience. Other application preparation tools are not connected yet."
                />
              </p>
              <Link to="/app/toolkit">
                <WebsiteText page="home" id="32" fallback="Discover your career toolkit" />
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-muted">
        <div className="site-container">
          <div className="section-title center">
            <p className="eyebrow">
              <WebsiteText page="home" id="33" fallback="FROM DISCOVERY TO YOUR NEXT STEP" />
            </p>
            <h2>
              <WebsiteText page="home" id="34" fallback="A more intentional way to find work." />
            </h2>
          </div>
          <div className="steps">
            <div>
              <span className="step-number">
                <WebsiteText page="home" id="35" fallback="01" />
              </span>
              <h3>
                <WebsiteText page="home" id="36" fallback="Tell us what you do" />
              </h3>
              <p>
                <WebsiteText
                  page="home"
                  id="37"
                  fallback="Choose your skills, preferred countries, and the kind of opportunity you’re looking for."
                />
              </p>
            </div>
            <div>
              <span className="step-number">
                <WebsiteText page="home" id="38" fallback="02" />
              </span>
              <h3>
                <WebsiteText page="home" id="39" fallback="Explore the possibilities" />
              </h3>
              <p>
                <WebsiteText
                  page="home"
                  id="40"
                  fallback="Live discovery is not connected yet. Future discovery will use official APIs, licensed services, and other permitted sources."
                />
              </p>
            </div>
            <div>
              <span className="step-number">
                <WebsiteText page="home" id="41" fallback="03" />
              </span>
              <h3>
                <WebsiteText page="home" id="42" fallback="Make your next move" />
              </h3>
              <p>
                <WebsiteText
                  page="home"
                  id="43"
                  fallback="Save your shortlist, track applications, and build a resume that brings your experience together."
                />
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <p className="eyebrow">
          <WebsiteText page="home" id="44" fallback="A NEW CHAPTER AWAITS" />
        </p>
        <h2>
          <WebsiteText page="home" id="45" fallback="Make room for your next opportunity." />
        </h2>
        <p>
          <WebsiteText page="home" id="46" fallback="Take a look around your future workspace." />
        </p>
        <ActionLink to="/app/dashboard">
          <WebsiteText page="home" id="47" fallback="Open your workspace" />
        </ActionLink>
      </section>
    </PublicShell>
  );
}
