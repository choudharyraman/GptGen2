"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import ThemeToggle from "@/components/ui/ThemeToggle";

const features = [
  {
    icon: "⚡",
    title: "Streaming Responses",
    desc: "Watch AI responses appear token by token in real time, just like ChatGPT.",
  },
  {
    icon: "🧠",
    title: "Multiple AI Personas",
    desc: "Switch between PM, Engineer, Teacher, or Security Expert personas instantly.",
  },
  {
    icon: "📝",
    title: "Markdown & Code",
    desc: "Full markdown rendering with syntax-highlighted code blocks and copy buttons.",
  },
  {
    icon: "💬",
    title: "Chat History",
    desc: "All conversations saved locally and in the cloud. Search, rename, export.",
  },
  {
    icon: "🌙",
    title: "Dark Mode",
    desc: "Elegant dark and light themes with system preference detection.",
  },
  {
    icon: "📱",
    title: "Fully Responsive",
    desc: "Works beautifully on desktop, tablet, and mobile devices.",
  },
];

const steps = [
  {
    number: "01",
    title: "Start a Conversation",
    desc: "Click 'Start Chatting' and create your first chat. No signup required.",
  },
  {
    number: "02",
    title: "Choose Your AI Persona",
    desc: "Select from 5 expert personas: PM, Engineer, Teacher, Security Expert, or Default.",
  },
  {
    number: "03",
    title: "Get Instant Answers",
    desc: "Watch responses stream in real time, beautifully formatted with markdown.",
  },
];

const demoMessages = [
  { role: "user", content: "Explain microservices vs monolith" },
  {
    role: "assistant",
    content: `## Microservices vs Monolith

**Monolith**: Single deployable unit with all functionality tightly coupled.
✅ Simple to develop initially
❌ Hard to scale independently

**Microservices**: Independent services communicating via APIs.
✅ Scale each service independently  
✅ Technology flexibility per service
❌ More operational complexity

\`\`\`
User Request → API Gateway → [Auth Service] [Chat Service] [DB Service]
\`\`\`

**Recommendation**: Start with a monolith. Migrate to microservices when specific scaling needs arise.`,
  },
];

export default function LandingPage() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Your AI Assistant for the Next Generation";
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
            }}
          >
            ✨
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.2rem",
              background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            GptGen2
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ThemeToggle />
          <Link
            href="/chat"
            style={{
              background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
              color: "white",
              borderRadius: 10,
              padding: "0.5rem 1.25rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.9";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(108,99,255,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Launch App →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8rem 2rem 4rem",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Animated gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)",
            filter: "blur(40px)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
            filter: "blur(40px)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--accent-glow)",
            border: "1px solid rgba(108,99,255,0.3)",
            borderRadius: 100,
            padding: "0.375rem 1rem",
            fontSize: "0.8rem",
            color: "var(--accent)",
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent)",
              animation: "pulse-glow 2s infinite",
            }}
          />
          Powered by Google Gemma via OpenRouter
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            maxWidth: 800,
            letterSpacing: "-0.02em",
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #6c63ff 0%, #8b5cf6 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "300% 300%",
              animation: "gradient-shift 4s ease infinite",
            }}
          >
            GptGen2
          </span>
          <br />
          <span style={{ color: "var(--text-primary)" }}>
            {typedText}
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: "0.85em",
                background: "var(--accent)",
                marginLeft: 3,
                borderRadius: 2,
                animation: "blink 1s step-end infinite",
              }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          A premium AI chatbot experience with streaming responses, multiple
          expert personas, markdown rendering, and persistent chat history.
          Free. No login required.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          <Link
            href="/chat"
            style={{
              background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
              color: "white",
              borderRadius: 14,
              padding: "0.875rem 2rem",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
              boxShadow: "0 4px 24px rgba(108,99,255,0.35)",
            }}
            id="cta-start-chatting"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(108,99,255,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(108,99,255,0.35)";
            }}
          >
            ✨ Start Chatting — Free
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              borderRadius: 14,
              padding: "0.875rem 2rem",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "1px solid var(--border)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            ⭐ View on GitHub
          </a>
        </motion.div>

        {/* Demo preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            marginTop: "4rem",
            width: "100%",
            maxWidth: 900,
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {["#ef4444", "#f59e0b", "#10b981"].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            ))}
            <div
              style={{
                flex: 1,
                background: "var(--bg-tertiary)",
                borderRadius: 6,
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                textAlign: "center",
                marginLeft: "0.5rem",
              }}
            >
              localhost:3000/chat
            </div>
          </div>

          {/* Mockup content */}
          <div
            style={{
              display: "flex",
              height: 420,
              background: "var(--bg-primary)",
            }}
          >
            {/* Mini sidebar */}
            <div
              style={{
                width: 200,
                background: "var(--bg-secondary)",
                borderRight: "1px solid var(--border)",
                padding: "1rem 0.75rem",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                  borderRadius: 8,
                  padding: "0.5rem 0.75rem",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                + New Chat
              </div>
              {["Microservices Guide", "React Hooks Deep Dive", "PRD Template"].map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: "0.5rem",
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    color: i === 0 ? "var(--text-primary)" : "var(--text-muted)",
                    background: i === 0 ? "var(--accent-glow)" : "transparent",
                    border: i === 0 ? "1px solid var(--accent)" : "1px solid transparent",
                    marginBottom: "3px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* Mini chat */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, padding: "1rem", overflowY: "hidden" }}>
                {demoMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "0.875rem",
                      flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background:
                          msg.role === "user"
                            ? "linear-gradient(135deg, #6c63ff, #8b5cf6)"
                            : "#1a1a2e",
                        flexShrink: 0,
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        border: msg.role === "assistant" ? "1px solid rgba(108,99,255,0.3)" : "none",
                      }}
                    >
                      {msg.role === "user" ? "U" : "✨"}
                    </div>
                    <div
                      style={{
                        background:
                          msg.role === "user"
                            ? "linear-gradient(135deg, #6c63ff, #8b5cf6)"
                            : "var(--ai-bubble)",
                        color: msg.role === "user" ? "white" : "var(--text-primary)",
                        borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.72rem",
                        lineHeight: 1.5,
                        maxWidth: "70%",
                        border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini input */}
              <div
                style={{
                  padding: "0.75rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Message GptGen2...
                </div>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section
        ref={featuresRef}
        style={{
          padding: "6rem 2rem",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Everything you need in an{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI assistant
            </span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: 500, margin: "0 auto" }}>
            Built with modern tech for a premium, production-quality experience
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="feature-card"
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.05rem" }}>
                {feature.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        ref={stepsRef}
        style={{
          padding: "5rem 2rem",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              marginBottom: "3rem",
            }}
          >
            Get started in seconds
          </motion.h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "2rem",
            }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "white",
                    margin: "0 auto 1rem",
                    boxShadow: "0 4px 20px rgba(108,99,255,0.35)",
                  }}
                >
                  {step.number}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.05rem" }}>
                  {step.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
            Built With
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
            {["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand", "Supabase", "OpenRouter", "Google Gemma"].map((tech) => (
              <span
                key={tech}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 100,
                  padding: "0.375rem 0.875rem",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          padding: "5rem 2rem",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Ready to chat?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1rem" }}>
            No account needed. Start chatting with your AI assistant right now, for free.
          </p>
          <Link
            href="/chat"
            style={{
              background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
              color: "white",
              borderRadius: 14,
              padding: "1rem 2.5rem",
              fontWeight: 700,
              fontSize: "1.05rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 24px rgba(108,99,255,0.4)",
              transition: "all 0.2s",
            }}
            id="cta-final"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(108,99,255,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(108,99,255,0.4)";
            }}
          >
            ✨ Start Chatting for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ marginBottom: "0.5rem" }}>
          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>GptGen2</span> —
          Built as a portfolio showcase. Powered by{" "}
          <a href="https://openrouter.ai" style={{ color: "var(--accent)" }}>OpenRouter</a> &{" "}
          <a href="https://supabase.com" style={{ color: "var(--accent)" }}>Supabase</a>.
        </div>
        <div>© 2026 GptGen2. Made with ❤️ for demos and interviews.</div>
      </footer>
    </div>
  );
}
