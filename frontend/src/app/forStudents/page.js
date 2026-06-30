export const metadata = {
  title: "For Students | Teachifyy",
  description:
    "Redesigning the future of learning for Classes 5 to 10 with concept-first learning, AI readiness, and Math & Science masterclasses.",
};

export default function ForStudentsPage() {
  return (
    <main style={{ width: "100vw", minHeight: "100vh", margin: 0, padding: 0, overflow: "hidden", background: "#FAF8F5" }}>
      <iframe
        src="/forStudents/index.html"
        title="Teachifyy For Students landing page"
        style={{ width: "100vw", height: "100vh", border: 0, display: "block" }}
      />
    </main>
  );
}
