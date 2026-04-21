import { useCallback, useEffect, useState } from 'react';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import TelemedicinePanel from '../../components/doctor/TelemedicinePanel';
import { useAuth } from '../../context/AuthContext';
import { saveTelemedicineSession } from '../../services/doctorService';
import { getDoctorTelemedicineHistory } from '../../services/telemedicineService';
import { doctorNavItems } from '../../utils/navigation';

export default function TelemedicinePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);

  const loadData = useCallback(async () => {
    const history = await getDoctorTelemedicineHistory(user.id);
    setSessions(history);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAction(action, sessionId) {
    await saveTelemedicineSession(user.id, action, sessionId);
    loadData();
  }

  return (
    <ShellLayout
      title="Telemedicine Session UI"
      subtitle="Realistic video consultation layout with side summary and uploaded report context."
      navItems={doctorNavItems}
    >
      <PageBanner
        eyebrow="Telemedicine Center"
        title="Online consultation workspace"
        subtitle="Prepare secure doctor-patient sessions with live notes, patient summary, and report context."
        variant="telemedicine"
      />
      <TelemedicinePanel sessions={sessions} onAction={handleAction} />
    </ShellLayout>
  );
}
