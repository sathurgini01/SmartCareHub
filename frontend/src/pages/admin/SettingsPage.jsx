import ShellLayout from '../../components/common/ShellLayout';
import { adminNavItems } from '../../utils/navigation';

export default function SettingsPage() {
  return (
    <ShellLayout
      title="Admin Settings"
      subtitle="Presentation-ready settings panel for future platform controls."
      navItems={adminNavItems}
    >
      <section className="card settings-grid">
        <div>
          <h2>Verification Rules</h2>
          <p>Configure license review rules, audit policies, and approval thresholds.</p>
        </div>
        <div>
          <h2>Notification Center</h2>
          <p>Manage email alerts for new registrations, suspensions, and live sessions.</p>
        </div>
        <div>
          <h2>Integration Readiness</h2>
          <p>Prepare future connections for video consultation, reporting, and analytics tools.</p>
        </div>
      </section>
    </ShellLayout>
  );
}
