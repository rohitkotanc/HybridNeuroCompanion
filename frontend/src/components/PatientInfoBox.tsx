type Patient = {
  name?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  diagnoses?: string[];
  allergies?: string[];
  care_setting?: string;
};

function ageFromDob(dob?: string) {
  if (!dob) return "Unknown";
  const birth = new Date(dob);
  const today = new Date("2026-03-19T00:00:00");
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return String(age);
}

export function PatientInfoBox({ patient }: { patient?: Patient }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Patient Snapshot</h2>
        <span className="eyebrow">Important clinical context</span>
      </div>
      <div className="info-grid">
        <div>
          <strong>Age</strong>
          <p>{ageFromDob(patient?.date_of_birth)}</p>
        </div>
        <div>
          <strong>Gender</strong>
          <p>{patient?.gender ?? "Unknown"}</p>
        </div>
        <div>
          <strong>Height</strong>
          <p>{patient?.height_cm ? `${patient.height_cm} cm` : "Unknown"}</p>
        </div>
        <div>
          <strong>Weight</strong>
          <p>{patient?.weight_kg ? `${patient.weight_kg} kg` : "Unknown"}</p>
        </div>
        <div>
          <strong>Diagnosis</strong>
          <p>{patient?.diagnoses?.join(", ") ?? "None listed"}</p>
        </div>
        <div>
          <strong>Allergies</strong>
          <p>{patient?.allergies?.join(", ") ?? "None listed"}</p>
        </div>
        <div className="info-span">
          <strong>Care setting</strong>
          <p>{patient?.care_setting ?? "Unknown"}</p>
        </div>
      </div>
    </section>
  );
}
