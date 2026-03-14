// ── services/certificateService.js ────────────────────────────────────────────
const PDFDocument = require('pdfkit');
const { v4: uuidv4 }  = require('uuid');
const { Certificate } = require('../models/index');
const User            = require('../models/User');
const Internship      = require('../models/Internship');
const notificationService = require('./notificationService');

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeCertId = () => {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = uuidv4().split('-')[0].toUpperCase();
  return `CX-${ts}-${rnd}`;
};

const makeOfferId = () => {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = uuidv4().split('-')[0].toUpperCase().slice(0, 4);
  return `CXOL-${ts}-${rnd}`;
};

const docToBuffer = (fn) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: [842, 595], layout: 'landscape', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    const chunks = [];
    doc.on('data',  c => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    fn(doc);
    doc.end();
  });

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATE PDF
// ─────────────────────────────────────────────────────────────────────────────
const buildCertificatePDF = ({ studentName, internshipTitle, completedAt, certificateId, verificationUrl, finalScore, grade }) =>
  docToBuffer(doc => {
    const W = 842, H = 595;

    // Background
    doc.rect(0, 0, W, H).fill('#0a0a12');

    // Dot-grid pattern
    doc.fillColor('#ffffff').opacity(0.03);
    for (let x = 28; x < W; x += 28) for (let y = 28; y < H; y += 28) doc.circle(x, y, 1.2).fill();
    doc.opacity(1);

    // Full border bars (top / bottom / sides)
    doc.rect(0, 0, W, 6).fill('#6366f1');
    doc.rect(0, H - 6, W, 6).fill('#6366f1');
    doc.rect(0, 0, 6, H).fill('#6366f1');
    doc.rect(W - 6, 0, 6, H).fill('#6366f1');

    // Inner frame
    doc.rect(20, 20, W - 40, H - 40).strokeColor('#6366f1').lineWidth(0.5).opacity(0.4).stroke();
    doc.opacity(1);

    // Corner L-brackets
    [[32, 32, 1, 1], [W - 32, 32, -1, 1], [32, H - 32, 1, -1], [W - 32, H - 32, -1, -1]].forEach(([x, y, dx, dy]) => {
      doc.moveTo(x, y).lineTo(x + dx * 36, y).strokeColor('#6366f1').lineWidth(2).stroke();
      doc.moveTo(x, y).lineTo(x, y + dy * 36).strokeColor('#6366f1').lineWidth(2).stroke();
    });

    // Left decorative band
    doc.rect(0, 0, 160, H).fillOpacity(0.06).fill('#6366f1').fillOpacity(1);

    // Vertical label in left band
    doc.save();
    doc.translate(46, H / 2);
    doc.rotate(-90);
    doc.fillColor('#6366f1').fontSize(7).font('Helvetica-Bold').opacity(0.6)
       .text('CODINGX INTERNSHIP & CERTIFICATION PORTAL', -160, 0, { width: 320, align: 'center', characterSpacing: 3 });
    doc.restore();
    doc.opacity(1);

    // Decorative circles on left band
    doc.circle(80, H * 0.28, 30).strokeColor('#6366f1').lineWidth(0.5).opacity(0.2).stroke().opacity(1);
    doc.circle(80, H * 0.72, 20).strokeColor('#6366f1').lineWidth(0.5).opacity(0.2).stroke().opacity(1);

    // --- Main content ---
    const CX = 510; // content width
    const SX = 185; // start x

    // Brand
    doc.fillColor('#6366f1').fontSize(9).font('Helvetica-Bold').opacity(0.9)
       .text('C O D I N G X', SX, 60, { width: CX, align: 'center', characterSpacing: 8 });
    doc.opacity(1);

    // Title
    doc.fillColor('#ffffff').fontSize(31).font('Helvetica-Bold')
       .text('Certificate of Completion', SX, 82, { width: CX, align: 'center' });

    // Decorative separator
    const midX  = SX + CX / 2;
    const sepY  = 126;
    doc.moveTo(midX - 160, sepY).lineTo(midX + 160, sepY).strokeColor('#6366f1').lineWidth(1).stroke();
    doc.circle(midX - 160, sepY, 3).fill('#6366f1');
    doc.circle(midX + 160, sepY, 3).fill('#6366f1');
    doc.circle(midX, sepY, 5).fill('#6366f1');

    // Presented to text
    doc.fillColor('#8888aa').fontSize(11).font('Helvetica')
       .text('This is to certify that', SX, 142, { width: CX, align: 'center' });

    // Student name
    const nameY = 162;
    doc.fillColor('#ffffff').fontSize(36).font('Helvetica-Bold')
       .text(studentName, SX, nameY, { width: CX, align: 'center' });

    // Underline name
    const nameW = Math.min(doc.widthOfString(studentName) * 0.9, 380);
    const ulY   = nameY + 45;
    doc.moveTo(midX - nameW / 2, ulY).lineTo(midX + nameW / 2, ulY)
       .strokeColor('#6366f1').lineWidth(0.8).stroke();

    // Sub texts
    doc.fillColor('#8888aa').fontSize(11).font('Helvetica')
       .text('has successfully completed the internship program', SX, ulY + 10, { width: CX, align: 'center' });

    doc.fillColor('#6366f1').fontSize(20).font('Helvetica-Bold')
       .text(internshipTitle, SX, ulY + 30, { width: CX, align: 'center' });

    const dateStr = new Date(completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fillColor('#8888aa').fontSize(10).font('Helvetica')
       .text(`Awarded on ${dateStr}`, SX, ulY + 64, { width: CX, align: 'center' });

    // Score pill
    if (finalScore != null) {
      const scoreLabel = `Score: ${finalScore}%${grade ? '   Grade: ' + grade : ''}`;
      const pillW = 150, pillH = 24, pillX = midX - pillW / 2, pillY = ulY + 82;
      doc.roundedRect(pillX, pillY, pillW, pillH, 12).fillColor('#6366f1').fillOpacity(0.12).fill();
      doc.fillOpacity(1).fillColor('#6366f1').fontSize(9).font('Helvetica-Bold')
         .text(scoreLabel, pillX, pillY + 7, { width: pillW, align: 'center' });
    }

    // Signature line
    const sigX = W - 220, sigY = H - 90;
    doc.moveTo(sigX, sigY).lineTo(sigX + 120, sigY).strokeColor('#444460').lineWidth(0.8).stroke();
    doc.fillColor('#6366f1').fontSize(9).font('Helvetica-Bold').text('CodingX', sigX + 20, sigY + 5, { width: 80, align: 'center' });
    doc.fillColor('#8888aa').fontSize(8).font('Helvetica').text('Authorized Signatory', sigX + 5, sigY + 16, { width: 110, align: 'center' });

    // Footer meta
    doc.fillColor('#33334a').fontSize(7).font('Helvetica')
       .text(`Certificate ID: ${certificateId}`, SX, H - 32)
       .text(`Verify at: ${verificationUrl}`, SX, H - 22);
  });

// ─────────────────────────────────────────────────────────────────────────────
// OFFER LETTER PDF  (A4 Portrait)
// ─────────────────────────────────────────────────────────────────────────────
const buildOfferLetterPDF = ({ studentName, internshipTitle, duration, startDate, offerRef, category, skills = [] }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    const chunks = [];
    doc.on('data',  c => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = 595, H = 842;
    const PL = 56, PR = 56;  // horizontal padding
    const CW = W - PL - PR;  // content width

    // ── Background
    doc.rect(0, 0, W, H).fill('#ffffff');

    // Purple header block
    doc.rect(0, 0, W, 200).fill('#6366f1');

    // Subtle pattern in header
    doc.fillColor('#ffffff').opacity(0.04);
    for (let x = 0; x < W; x += 22) for (let y = 0; y < 200; y += 22) doc.circle(x, y, 1).fill();
    doc.opacity(1);

    // Bottom-left corner decoration in header
    doc.circle(0, 200, 120).fillColor('#8b5cf6').fillOpacity(0.3).fill().fillOpacity(1);

    // Brand name
    doc.fillColor('rgba(255,255,255,0.5)').fontSize(8).font('Helvetica-Bold')
       .text('C O D I N G X', PL, 48, { characterSpacing: 6 });

    // Offer letter title
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold')
       .text('Offer Letter', PL, 70);

    // Sub-headline
    doc.fillColor('rgba(255,255,255,0.75)').fontSize(13).font('Helvetica')
       .text('Internship & Certification Program', PL, 108);

    // Ref + Date bar (white pill)
    const barY = 148;
    doc.roundedRect(PL, barY, CW, 36, 8).fillColor('rgba(255,255,255,0.12)').fill();
    doc.fillColor('rgba(255,255,255,0.55)').fontSize(9).font('Helvetica')
       .text('REF NO.', PL + 14, barY + 6);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
       .text(offerRef, PL + 14, barY + 17);
    const issuedStr = `Date: ${new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    doc.fillColor('rgba(255,255,255,0.8)').fontSize(10).font('Helvetica')
       .text(issuedStr, PL, barY + 13, { width: CW - 14, align: 'right' });

    // ── Body (white area)
    let y = 226;

    // Greeting
    doc.fillColor('#1a1a2e').fontSize(13).font('Helvetica-Bold')
       .text(`Dear ${studentName},`, PL, y);
    y += 22;

    doc.fillColor('#555570').fontSize(11).font('Helvetica').lineGap(4)
       .text(
         `We are pleased to offer you a position as an ${category ? category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' ' : ''}Intern with the `,
         PL, y, { continued: true }
       );
    doc.fillColor('#6366f1').font('Helvetica-Bold').text('CodingX Internship & Certification Program', { continued: true });
    doc.fillColor('#555570').font('Helvetica').text('.');
    y += 34;

    // Detail cards row
    const cardData = [
      { label: 'Program', value: internshipTitle },
      { label: 'Duration', value: duration || '8 Weeks' },
      { label: 'Start Date', value: new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
      { label: 'Mode', value: 'Online / Remote' },
    ];
    const cardW = (CW - 12) / 2;

    cardData.forEach((card, i) => {
      const cx = PL + (i % 2) * (cardW + 12);
      const cy = y + Math.floor(i / 2) * 56;
      doc.roundedRect(cx, cy, cardW, 46, 8).fillColor('#f4f4ff').fill();
      doc.rect(cx, cy, 3, 46).fillColor('#6366f1').fill();
      doc.fillColor('#8888aa').fontSize(8.5).font('Helvetica').text(card.label.toUpperCase(), cx + 12, cy + 8, { characterSpacing: 0.5 });
      doc.fillColor('#1a1a2e').fontSize(11).font('Helvetica-Bold').text(card.value, cx + 12, cy + 22, { width: cardW - 20 });
    });
    y += 120;

    // Terms section
    doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold').text('Terms & Conditions', PL, y);
    y += 20;

    const terms = [
      'This internship is offered on a voluntary basis and does not constitute employment.',
      'Interns are expected to complete all assigned tasks and adhere to submission deadlines.',
      'Interns must maintain professional conduct and confidentiality of any proprietary information.',
      'Successful completion of the program will result in issuance of a Certificate of Completion.',
      'CodingX reserves the right to modify the program structure with prior notice.',
    ];

    terms.forEach(term => {
      doc.fillColor('#6366f1').fontSize(10).text('•', PL, y);
      doc.fillColor('#555570').fontSize(10).font('Helvetica').text(term, PL + 14, y, { width: CW - 14, lineGap: 2 });
      y += 22;
    });
    y += 8;

    // Skills section
    if (skills.length > 0) {
      doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold').text('Skills You Will Develop', PL, y);
      y += 16;
      let tagX = PL;
      skills.slice(0, 8).forEach(skill => {
        const tw = doc.widthOfString(skill, { fontSize: 9 }) + 18;
        if (tagX + tw > W - PR) { tagX = PL; y += 22; }
        doc.roundedRect(tagX, y, tw, 18, 9).fillColor('#ede9fe').fill();
        doc.fillColor('#6366f1').fontSize(9).font('Helvetica-Bold').text(skill, tagX + 9, y + 4);
        tagX += tw + 8;
      });
      y += 30;
    }

    // Acceptance section
    y += 4;
    doc.moveTo(PL, y).lineTo(W - PR, y).strokeColor('#e0e0f0').lineWidth(1).stroke();
    y += 16;

    doc.fillColor('#1a1a2e').fontSize(11).font('Helvetica-Bold').text('Acceptance', PL, y);
    y += 16;
    doc.fillColor('#555570').fontSize(10).font('Helvetica')
       .text('By accessing the CodingX dashboard and beginning your tasks, you confirm acceptance of this offer.', PL, y, { width: CW });
    y += 32;

    // Signature area
    doc.fillColor('#1a1a2e').fontSize(10).font('Helvetica-Bold').text('For CodingX Platform', PL, y);
    y += 14;
    doc.moveTo(PL, y).lineTo(PL + 140, y).strokeColor('#6366f1').lineWidth(1).stroke();
    y += 10;
    doc.fillColor('#8888aa').fontSize(9).font('Helvetica').text('Authorized Signatory / Platform Admin', PL, y);

    // Footer strip
    doc.rect(0, H - 40, W, 40).fill('#6366f1');
    doc.fillColor('rgba(255,255,255,0.5)').fontSize(8).font('Helvetica')
       .text('www.codingx.com  ·  CodingX Internship & Certification Platform  ·  This is a system-generated document.',
         PL, H - 26, { width: CW, align: 'center' });

    doc.end();
  });

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/** Generate offer letter PDF buffer */
exports.buildOfferLetterPDF = buildOfferLetterPDF;

/** Generate certificate PDF buffer */
exports.buildCertificatePDF = buildCertificatePDF;

/**
 * Create certificate DB record and (optionally) lock behind payment.
 * Payment amount is read from internship.certificatePrice.
 */
exports.generateCertificate = async ({ studentId, internshipId, issuedById, finalScore, grade }) => {
  const student    = await User.findById(studentId);
  const internship = await Internship.findById(internshipId);
  if (!student || !internship) throw new Error('Student or internship not found');

  // Idempotent
  const existing = await Certificate.findOne({ student: studentId, internship: internshipId });
  if (existing) return existing;

  const certificateId   = makeCertId();
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${certificateId}`;
  const completedAt     = new Date();
  const priceInPaise    = internship.certificatePrice || 0;
  const requirePayment  = priceInPaise > 0;

  const certificate = await Certificate.create({
    certificateId,
    student:         studentId,
    internship:      internshipId,
    studentName:     student.name,
    internshipTitle: internship.title,
    issuedAt:        completedAt,
    completedAt,
    verificationUrl,
    finalScore,
    grade,
    issuedBy:        issuedById,
    paymentStatus:   requirePayment ? 'pending' : 'not_required',
    paymentAmount:   priceInPaise,
  });

  await notificationService.create({
    recipientId:  studentId,
    type:         'certificate-ready',
    title:        '🎓 Your Certificate is Ready!',
    message:      `Congratulations! Your certificate for "${internship.title}" is ready.${requirePayment ? ` Pay ₹${Math.round(priceInPaise / 100)} to download.` : ''}`,
    refModel:     'Certificate',
    refId:        certificate._id,
    actionUrl:    '/dashboard/certificates',
    actionLabel:  requirePayment ? 'Pay & Download' : 'Download Certificate',
  });

  return certificate;
};

/**
 * Stream certificate PDF directly to HTTP response.
 * Checks isValid and paymentStatus before allowing download.
 */
exports.streamCertificatePDF = async (certificateId, res) => {
  const cert = await Certificate.findOne({ certificateId })
    .populate('student',    'name')
    .populate('internship', 'title');

  if (!cert)         return res.status(404).json({ success: false, message: 'Certificate not found' });
  if (!cert.isValid) return res.status(403).json({ success: false, message: 'This certificate has been revoked' });
  if (cert.paymentStatus === 'pending')
    return res.status(402).json({ success: false, message: 'Payment required', paymentRequired: true, certificateId });

  const pdfBuffer = await buildCertificatePDF({
    studentName:     cert.studentName     || cert.student?.name,
    internshipTitle: cert.internshipTitle || cert.internship?.title,
    completedAt:     cert.completedAt     || cert.issuedAt,
    certificateId:   cert.certificateId,
    verificationUrl: cert.verificationUrl,
    finalScore:      cert.finalScore,
    grade:           cert.grade,
  });

  res.setHeader('Content-Type',        'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="CodingX-Certificate-${certificateId}.pdf"`);
  res.setHeader('Content-Length',      pdfBuffer.length);
  res.end(pdfBuffer);
};

/** Verify certificate (public) */
exports.verifyCertificate = async (certificateId) =>
  Certificate.findOne({ certificateId })
    .populate('student',    'name email avatar')
    .populate('internship', 'title category duration');