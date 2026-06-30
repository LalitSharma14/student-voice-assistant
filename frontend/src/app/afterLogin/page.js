export const metadata = {
  title: "Student Dashboard Preview | Teachifyy",
  description:
    "Local preview of the after-login Teachifyy student dashboard design.",
};

export default function AfterLoginPreviewPage() {
  return (
    <main style={{ width: "100vw", minHeight: "100vh", margin: 0, padding: 0, overflow: "hidden", background: "#f7f9fc" }}>
      <iframe
        src="/afterLogin/index.html"
        title="Teachifyy after-login dashboard preview"
        style={{ width: "100vw", height: "100vh", border: 0, display: "block" }}
      />
    </main>
  );
}
