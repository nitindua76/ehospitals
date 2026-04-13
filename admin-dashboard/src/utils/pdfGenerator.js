import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';

const DOC_LABELS = {
  pan: 'PAN Card Copy',
  gst: 'GST Registration',
  mse_certificate: 'MSE Certificate',
  nabh_certificate: 'NABH Accreditation Certificate',
  nabl_certificate: 'NABL Accreditation Certificate',
  jci_certificate: 'JCI Accreditation Certificate',
  fire_safety: 'Fire Safety Clearance',
  biomedical: 'BMW Management Approval',
  pharmacy: 'Pharmacy License',
  aerb_approval: 'AERB Approval Certificate',
  pollution_control: 'Pollution Control Cert.',
  lift_safety: 'Lift Safety Clearance',
  cea_registration: 'CEA Registration Certificate',
  bank_ecs: 'Bank/ECS Details (Signed)',
  tariff: 'Schedule of Charges (Tariff)',
  room_tariffs: 'Room categories available with Tariffs and Facilities',
  schedule_of_charges: 'General Public Schedule of Charges',
  mri_declaration: 'MRI Outsourced Declaration',
  pet_ct_declaration: 'PET-CT Outsourced Declaration'
};

export const generateHospitalPDF = async (form, refId, attachments = {}, token, API_URL, onProgress) => {
  const attachmentRows = Object.entries(attachments || {})
    .filter(([key, file]) => file && (file.id || file._id))
    .map(([key, file]) => [DOC_LABELS[key] || key, 'Attached']);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header - Shifted down for Letterhead
  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80);
  doc.text('HOSPITAL EMPANELMENT APPLICATION', pageWidth / 2, 70, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(52, 152, 219);
  doc.text(`REFERENCE ID: ${refId}`, pageWidth / 2, 82, { align: 'center' });

  doc.setDrawColor(52, 152, 219);
  doc.setLineWidth(1);
  doc.line(20, 88, pageWidth - 20, 88);

  let currentY = 100;

  const addSection = (title, data) => {
    if (currentY > 240) { doc.addPage(); currentY = 60; }

    doc.setFontSize(13);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 20, currentY);
    currentY += 4;

    const rows = Object.entries(data).map(([label, value]) => [label, String(value || 'N/A')]);

    autoTable(doc, {
      startY: currentY,
      head: [['Field', 'Details']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' } },
      margin: { left: 20, right: 20, top: 60 },
      didDrawPage: (d) => { currentY = d.cursor.y + 10; }
    });
    currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 12;
  };

  const addStaticTable = (title, headers, body) => {
    if (currentY > 240) { doc.addPage(); currentY = 60; }
    doc.setFontSize(13);
    doc.setTextColor(44, 62, 80);
    doc.text(title.toUpperCase(), 20, currentY);
    currentY += 4;
    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20, top: 60 }
    });
    currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 12;
  };

  // 1. Organizational Profile (Step A & B)
  addSection('1. Organizational Profile', {
    'Hospital Name': form.name,
    'Brand Name': form.brand_name,
    'Ownership Sector': form.ownership_type,
    'Hospital Category': form.type,
    'PAN Number': form.pan_number,
    'GST Number': form.gst_number,
    'MSME Status': form.msme_status === 'Yes' ? form.msme_type : 'No',
    'Complete Address': form.address,
    'City': form.city,
    'State': form.state,
    'Official Phone': form.contact_phone,
    'Official Email': form.contact_email
  });

  // 2. Nodal Contacts Table (Step B)
  const contactRows = (form.nodal_contacts || []).map(nc => [nc.purpose, nc.name, nc.mobile, nc.email || 'N/A']);
  addStaticTable('2. Nodal Contacts', ['Purpose', 'Name', 'Mobile', 'Email'], contactRows);

  // 3. Bank & Compliance (Step C)
  addSection('3. Bank & Statutory Compliance', {
    'Bank Name': form.bank_name,
    'Account Number': form.account_no,
    'IFSC Code': form.ifsc_code,
    'ECS Mandate Attached': form.ecs_mandate_attached,
    'IT Exemption Status': form.it_exemption,
    'IT Exemption Valid Upto': form.it_exemption === 'Yes'
      ? (form.it_exemption_permanent === 'Yes' ? 'Permanent' : (form.it_exemption_valid_until || 'Not Set'))
      : 'N/A',
    'NABH Accredited': form.nabh_accredited,
    'NABL Accredited': form.nabl_accredited,
    'JCI Accredited': form.jci_accredited,
    'Fire Safety NOC': form.fire_safety_clearance,
    'BMW Clearance': form.biomedical_waste_clearance,
    'AERB Approval': form.aerb_approval,
    'Pharmacy License': form.pharmacy_license,
    'Lift Safety Clearance': form.lift_safety_clearance,
    'CEA Registration': form.cea_registration,
    'Pollution Control Cert': form.pollution_control_certificate
  });

  // 4. Clinical Services (Step D)
  addSection('4. Core Clinical Services', {
    'Emergency Department': form.emergency_department,
    'OPD Services': form.opd_services,
    'IPD Services': form.ipd_services,
    'Blood Bank': form.blood_bank,
    'Dialysis Unit': form.dialysis_unit,
    'Organ Transplant': form.organ_transplant
  });

  // 5. Specialized Infrastructure (Step D)
  addSection('5. Specialized Infrastructure', {
    'Trauma Center': form.trauma_facility,
    'Advanced Trauma Care': form.advanced_trauma_care,
    'Burns Unit': form.burns_unit,
    'CATHLAB': form.cathlab,
    'ICU Facility': form.icu_facility,
    'Ventilator Facility': form.ventilator_facility,
    'NICU / PICU': `${form.nicu_facility}/${form.picu_facility}`,
    'IPD Psychiatry': form.ipd_psychiatry,
    'IVF Facility': form.ivf_facility,
    'Central Oxygen Supply': form.central_oxygen_supply,
    'Interventional Radiology': form.interventional_radiology,
    'Nuclear Medicine': form.nuclear_medicine,
    'Physiotherapy': form.physiotherapy,
    'Pain Management': form.pain_management,
    'Palliative Care': form.palliative_care,
    'Air Ambulance Tie-Up': form.air_ambulance_tieup,
    'Hearse Van Tie-Up': form.hearse_van_tieup
  });

  // 5b. Clinical Support Services (Step D)
  addSection('5b. Clinical Support Services', {
    'Pathology Lab (24x7)': form.pathology_lab,
    'Radiology Services': form.radiology_services,
    'Pharmacy (24x7)': form.pharmacy_24x7,
    'Ambulance Facility': form.ambulance_facility,
    'Free Ambulance Pickup & Drop': form.ambulance_free_pickup
  });

  // 6. Diagnostic Services (Step F)
  addSection('6. Diagnostic Services', {
    'PET-CT Scan': form.pet_ct_scan,
    'MRI Scan': form.mri_scan,
    'CT Scan Type': form.ct_scan,
    'ECHO / CARDIOLOGY': form.echo_cardiology,
    'Digital X-Ray': form.digital_xray,
    'Ultrasound / Doppler': form.ultrasound
  });

  // 7. Bed Capacity (Step G)
  addSection('7. Bed Capacity Breakdown', {
    'General Ward': form.capacity.general,
    'Semi-Private': form.capacity.semi_private,
    'Private Room': form.capacity.private,
    'Private (Single AC)': form.capacity.private_single_ac,
    'Deluxe AC': form.capacity.private_deluxe_ac,
    'Suite': form.capacity.private_suite,
    'ICU / CCU': form.capacity.icu,
    'HDU / Step-down': form.capacity.hdu,
    'TOTAL BEDS': Object.values(form.capacity).reduce((a, b) => a + (parseInt(b) || 0), 0)
  });


  // 8. General Amenities (Step I)
  addSection('8. General Amenities', {
    'Parking Area': form.general_facilities.parking ? 'Yes' : 'No',
    'Power Backup': form.general_facilities.power_backup ? 'Yes' : 'No',
    'Central AC': form.general_facilities.central_ac ? 'Yes' : 'No',
    'Waiting Lounge': form.general_facilities.waiting_lounge ? 'Yes' : 'No',
    'Cafeteria': form.general_facilities.cafeteria ? 'Yes' : 'No',
    'Attendant Lodging': form.general_facilities.attendant_lodging ? 'Yes' : 'No',
    'Mortuary': form.general_facilities.mortuary ? 'Yes' : 'No'
  });

  // 9. Human Resources (Step J)
  addSection('9. Human Resources', {
    'Total Doctors': form.total_doctors,
    'Full-Time Consultants': form.full_time_doctors,
    'Total Nursing Staff': form.total_nursing_staff,
    'Full-Time Nurses': form.full_time_nursing_staff
  });

  // 10. Registered Specialties (Step E)
  if (form.specialties && form.specialties.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(13);
    doc.setTextColor(44, 62, 80);
    doc.text('10. REGISTERED SPECIALTIES', 20, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setTextColor(60);
    const specialtyText = form.specialties.join(', ');
    const splitSpecialties = doc.splitTextToSize(specialtyText, pageWidth - 40);
    doc.text(splitSpecialties, 20, currentY);
    currentY += (splitSpecialties.length * 5) + 8;
  }

  // 11. Association & Historical Impact (Step K)
  addSection('11. Association & Historical Impact', {
    'Hospital Inception Date': form.date_of_inception,
    'Previous ONGC Association?': form.ongc_association,
    'ONGC Association (Years)': form.ongc_association === 'Yes' ? form.ongc_association_years : '0',
    'ONGC Vendor Code': form.ongc_association === 'Yes' ? (form.ongc_vendor_code || 'N/A') : 'N/A',
    'Avg Patients 2023 (Jan-Dec)': form.ongc_patient_count.fy_22_23,
    'Avg Patients 2024 (Jan-Dec)': form.ongc_patient_count.fy_23_24,
    'Avg Patients 2025 (Jan-Dec)': form.ongc_patient_count.fy_24_25
  });

  // 12. Organizations on Panel (Step K)
  if (form.panel_organizations && form.panel_organizations.length > 0) {
    const orgRows = form.panel_organizations.map(o => [o.name, o.since_year]);
    addStaticTable('12. PSUs / Organizations on Panel', ['Organization Name', 'Associated Since'], orgRows);
  }

  // 13. TPA / Insurance Tie-ups (Step K)
  if (form.tpa_tieups && form.tpa_tieups.length > 0) {
    const tpaRows = form.tpa_tieups.map(t => [t.name]);
    addStaticTable('13. TPA / Insurance Tie-Ups', ['TPA / Insurance Name'], tpaRows);
  }

  // 14. Financial Details (Step K)
  addSection('14. Financial Details', {
    'Acceptability of CGHS Rates': form.cghs_rates_acceptable || 'No',
    'General Public Schedule of Charges': form.schedule_of_charges_attached || 'No',
    'Discounts offered to ONGC': form.ongc_discount_percent ? `${form.ongc_discount_percent}%` : '0%'
  });

  // 15. Signatory & Achievements (Step L)
  addSection('15. Final Declaration & Signatory', {
    'Authorized Signatory': form.signatory_name,
    'Signatory Designation': form.signatory_designation,
    'Submission Date': form.signatory_date,
    'Blacklisting Declaration': form.declaration_no_blacklisting ? 'Self-Declared: Not Blacklisted' : 'No'
  });

  if (form.achievements) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(13);
    doc.text('KEY ACHIEVEMENTS & AWARDS', 20, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setTextColor(60);
    const splitAwards = doc.splitTextToSize(form.achievements, pageWidth - 40);
    doc.text(splitAwards, 20, currentY);
    currentY += (splitAwards.length * 5) + 12;
  }

  // 16. Attachments Table (Annexures)
  if (attachmentRows.length > 0) {
    if (currentY > 200) { doc.addPage(); currentY = 60; }
    doc.setFontSize(13);
    doc.setTextColor(44, 62, 80);
    doc.text('16. ANNEXURES (ATTACHED DOCUMENTS)', 20, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      head: [['Document Category', 'Status']],
      body: attachmentRows,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 2.5 },
      margin: { left: 20, right: 20, top: 60 }
    });
    currentY = doc.lastAutoTable.finalY + 12;
  }

  // Final Signature Page for the Application form
  if (currentY > 210) { doc.addPage(); currentY = 70; }
  doc.setFontSize(11);
  doc.setTextColor(50);
  doc.text("I hereby certify that all information provided above is correct and verified against original records.", 20, currentY);
  currentY += 35;
  doc.setFont('helvetica', 'bold');
  doc.text('________________________________', 20, currentY);
  doc.text('________________________________', pageWidth - 85, currentY);
  currentY += 6;
  doc.text('AUTHORIZED SIGNATORY', 20, currentY);
  doc.text('HOSPITAL STAMP & DATE', pageWidth - 85, currentY);
  currentY += 20;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(231, 76, 60);
  doc.text('Instruction: Please print ALL pages (including Annexures), sign and stamp every page.', 20, currentY);

  // Pagination for main form
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Application Form | ${form.name} | Ref: ${refId} | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  // --- BEGIN MERGING ATTACHMENTS ---
  try {
    const mainPdfBytes = doc.output('arraybuffer');
    const finalPdf = await PDFDocument.load(mainPdfBytes);
    const courierFont = await finalPdf.embedFont(StandardFonts.CourierBold);

    const attachmentKeys = Object.keys(attachments || {});

    const validAttachments = [];
    for (const key of attachmentKeys) {
      const file = attachments[key];
      const fileId = file?.id || file?._id;
      if (fileId) {
        validAttachments.push([key, file]);
      }
    }

    validAttachments.sort((a, b) => {
      const order = Object.keys(DOC_LABELS);
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });

    const totalSteps = validAttachments.length;
    if (onProgress) onProgress(5); // Started

    for (let i = 0; i < totalSteps; i++) {
      const [key, file] = validAttachments[i];
      const fileId = file?.id || file?._id;
      if (onProgress) {
        const percent = 5 + Math.round(((i) / totalSteps) * 90);
        onProgress(percent);
      }
      try {
        const response = await axios.get(`${API_URL}/hospitals/files/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer'
        });

        const attachmentBytes = response.data;
        let contentType = response.headers['content-type'];
        const fileName = (file.name || file.filename || '');

        // Case 1: Detect by server header or filename
        if (contentType === 'application/octet-stream' || !contentType) {
          if (fileName.toLowerCase().endsWith('.pdf')) contentType = 'application/pdf';
          else if (fileName.match(/\.(jpg|jpeg|png)$/i)) contentType = 'image/' + fileName.split('.').pop().toLowerCase();
        }

        // Case 2: Deep magic bytes check (Very robust fallback for legacy files)
        if (contentType === 'application/octet-stream' || !contentType) {
          const magic = new Uint8Array(attachmentBytes.slice(0, 4));
          if (magic[0] === 0x25 && magic[1] === 0x50 && magic[2] === 0x44 && magic[3] === 0x46) {
            contentType = 'application/pdf';
          } else if (magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4E && magic[3] === 0x47) {
            contentType = 'image/png';
          } else if (magic[0] === 0xFF && magic[1] === 0xD8) {
            contentType = 'image/jpeg';
          }
        }

        if (contentType === 'application/pdf') {
          const attachmentPdf = await PDFDocument.load(attachmentBytes);
          const copiedPages = await finalPdf.copyPages(attachmentPdf, attachmentPdf.getPageIndices());

          copiedPages.forEach((page, idx) => {
            const { height } = page.getSize();
            page.drawText(`ANNEXURE: ${DOC_LABELS[key]} | Hospital: ${form.name} | Ref: ${refId} | Page ${idx + 1}`, {
              x: 20,
              y: height - 30,
              size: 8,
              font: courierFont,
              color: rgb(0.8, 0, 0),
            });
            finalPdf.addPage(page);
          });
        } else if (contentType && contentType.startsWith('image/')) {
          const image = contentType.includes('png')
            ? await finalPdf.embedPng(attachmentBytes)
            : await finalPdf.embedJpg(attachmentBytes);

          const page = finalPdf.addPage();
          const { width, height } = page.getSize();

          const dims = image.scaleToFit(width - 80, height - 180);
          page.drawImage(image, {
            x: (width - dims.width) / 2,
            y: (height - dims.height) / 2 - 40,
            width: dims.width,
            height: dims.height,
          });

          page.drawText(`ANNEXURE: ${DOC_LABELS[key]} | Hospital: ${form.name} | Ref: ${refId}`, {
            x: 20,
            y: height - 30,
            size: 10,
            font: courierFont,
            color: rgb(0.8, 0, 0),
          });
        }
      } catch (err) {
        console.error(`Failed to merge attachment ${key}:`, err);
      }
    }

    const mergedPdfBytes = await finalPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Application_Package_${form.name.replace(/\s+/g, '_')}_${refId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onProgress) onProgress(100);
    URL.revokeObjectURL(url);
  } catch (err) {
    if (onProgress) onProgress(0);
    console.error('Final PDF Merge failed:', err);
    doc.save(`Application_Basic_${refId}.pdf`); // Fallback to basic PDF
  }
};
