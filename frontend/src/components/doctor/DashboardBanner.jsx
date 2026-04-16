export default function DashboardBanner() {
  return (
    <section className="doctor-banner card">
      <div>
        <p className="topbar-kicker">Clinical Operations</p>
        <h2>Doctor Management and Telemedicine Center</h2>
        <p>
          Review appointment requests, manage your availability calendar, issue prescriptions, and
          monitor uploaded patient reports from one polished healthcare workspace.
        </p>
      </div>

      <div className="medical-visual">
        <div className="pulse-orbit" />
        <div className="medical-cross">+</div>
        <div className="visual-chip">Telemedicine</div>
        <div className="visual-chip alt">Prescription</div>
        <div className="visual-chip light">Calendar</div>
      </div>
    </section>
  );
}
