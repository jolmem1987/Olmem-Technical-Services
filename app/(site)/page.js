import Link from 'next/link';
import Image from 'next/image';

const services = [
  ['01','Industrial Maintenance Coverage','Qualified maintenance support for scheduled blocks of time, individual shifts, shutdowns, temporary staffing gaps, and longer-term assignments.'],
  ['02','Contract Preventive Maintenance','Recurring PM agreements built around your equipment, maintenance frequency, expected labor hours, and contract duration.'],
  ['03','Industrial Troubleshooting & Repair','Hands-on mechanical, electrical, and electromechanical troubleshooting focused on safe recovery and keeping production equipment running.'],
  ['04','CNC & Machine Tool Support','Mechanical and electromechanical troubleshooting, auxiliary equipment support, recovery work, and practical fault isolation.'],
  ['05','Maintenance Program Development','PM creation, PM review, inspections, task development, labor estimates, and documentation built around the equipment you actually run.'],
  ['06','Shutdowns, Assessments & Projects','Planned shutdown support, equipment assessments, prioritized punch lists, backlog reduction, startup support, and project maintenance.']
];

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-gear gear-one"></div><div className="hero-gear gear-two"></div>
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">INDUSTRIAL MAINTENANCE COVERAGE • CONTRACT PM • MACHINE SUPPORT</span>
          <h1>Qualified maintenance support for the hours, shifts, and projects your facility needs.</h1>
          <p>Olmem Technical Services provides industrial maintenance coverage for manufacturers that need additional skilled maintenance capacity. Support can be scheduled by the block, shift, week, shutdown, or longer-term assignment and can include troubleshooting, breakdown response, preventive maintenance, repairs, and production-line support.</p>
          <div className="hero-actions"><Link className="button" href="/contact">Request Maintenance Coverage</Link><Link className="button button-outline" href="/services">View Capabilities</Link></div>
          <div className="trust-row"><span>✓ Shift & block coverage</span><span>✓ Troubleshooting & repairs</span><span>✓ Contract PM support</span></div>
        </div>
        <div className="hero-card">
          <Image src="/olmem-technical-services-logo.png" width={460} height={460} alt="Olmem Technical Services" priority />
          <div className="hero-card-note"><strong>Maintenance capacity when you need it.</strong><span>Use Olmem for scheduled shift coverage, temporary staffing gaps, recurring PM work, shutdown support, difficult machine issues, or longer-term maintenance assignments.</span></div>
        </div>
      </div>
    </section>

    <section className="strip"><div className="container strip-grid"><div><strong>Shift Coverage</strong><span>Scheduled maintenance support</span></div><div><strong>Contract PM</strong><span>Recurring maintenance agreements</span></div><div><strong>Troubleshooting</strong><span>Breakdown & line support</span></div><div><strong>Projects & Shutdowns</strong><span>Planned maintenance capacity</span></div></div></section>

    <section className="section"><div className="container"><div className="section-head"><span className="eyebrow dark">CAPABILITIES</span><h2>Industrial maintenance support built around real plant-floor needs.</h2><p>Some facilities need another qualified technician for a shift. Others need several weeks of temporary coverage, recurring PM execution, shutdown support, or help troubleshooting a difficult machine problem. Olmem can be structured around the actual maintenance hours and skills your operation needs.</p></div><div className="service-grid">{services.map(([n,t,d])=><article className="service-card" key={n}><span className="service-number">{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div><div className="center"><Link href="/services" className="text-link">See full service details →</Link></div></div></section>

    <section className="section dark-section"><div className="container split"><div><span className="eyebrow">INDUSTRIAL MAINTENANCE COVERAGE</span><h2>Add qualified maintenance capacity without adding permanent headcount.</h2><p>Olmem Technical Services can provide hands-on industrial maintenance support for scheduled blocks of time, full shifts, weekly coverage, shutdowns, temporary staffing gaps, or longer-term assignments.</p><div className="steps"><div><b>1</b><span><strong>Define the need</strong>Identify the schedule, equipment, shift, expected responsibilities, required skills, and duration.</span></div><div><b>2</b><span><strong>Build the coverage</strong>Structure the assignment around the estimated hours, shift schedule, travel, and scope of work.</span></div><div><b>3</b><span><strong>Support production</strong>Provide troubleshooting, repairs, PM execution, inspections, and day-to-day maintenance support alongside your team.</span></div></div><Link href="/services#coverage" className="text-link light-link">How industrial maintenance coverage works →</Link></div><aside className="quote-card"><p>“The goal is simple: give manufacturers access to qualified maintenance hours when internal staffing cannot cover the workload.”</p><span>Olmem Technical Services</span></aside></div></section>

    <section className="section"><div className="container split reverse"><div className="feature-panel"><span className="panel-label">COVERAGE CAN INCLUDE</span><div className="tag-cloud"><span>Breakdown Response</span><span>Mechanical Repairs</span><span>Electrical Troubleshooting</span><span>Preventive Maintenance</span><span>Production Line Support</span><span>CNC Machines</span><span>Conveyors</span><span>Packaging Lines</span><span>Palletizers</span><span>Motors & Drives</span><span>Inspections</span><span>Shutdown Work</span></div></div><div><span className="eyebrow dark">FLEXIBLE CONTRACT SUPPORT</span><h2>From one shift to an ongoing maintenance assignment.</h2><ul className="check-list"><li><strong>Block coverage:</strong> scheduled maintenance hours for backlog, repairs, PMs, or focused plant-floor support.</li><li><strong>Shift coverage:</strong> qualified maintenance support for a designated production shift.</li><li><strong>Temporary coverage:</strong> vacations, vacancies, hiring gaps, leaves, or periods of unusually high maintenance demand.</li><li><strong>Longer-term assignments:</strong> dedicated maintenance support for weeks or months when the operation needs sustained capacity.</li><li><strong>Shutdown and project coverage:</strong> additional maintenance resources for planned outages, installations, startups, and major maintenance events.</li></ul></div></div></section>

    <section className="cta-section"><div className="container cta-wrap"><div><span className="eyebrow">NEED ADDITIONAL MAINTENANCE COVERAGE?</span><h2>Tell us what shift, schedule, or maintenance workload you need covered.</h2><p>Include the facility location, desired schedule, expected duration, equipment involved, required skill set, and whether the need is temporary, recurring, or project-based.</p></div><Link className="button button-light" href="/contact">Request Maintenance Coverage</Link></div></section>
  </>;
}
