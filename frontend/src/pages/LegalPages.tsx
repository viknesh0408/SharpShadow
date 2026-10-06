import React from 'react';
import { Shield, FileText, RefreshCw, Award, Mail } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="flex items-center gap-3 text-sharp-400">
      <Shield className="w-8 h-8" />
      <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
    </div>
    <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
      <p>Last updated: October 2026</p>
      <h3 className="text-lg font-bold text-white">1. Information We Collect</h3>
      <p>
        SharpShadows collects necessary personal information including your full name, email address, IP address for secure digital download auditing, and encrypted transaction metadata processed via Razorpay. We do not store full credit card numbers or banking passwords on our servers.
      </p>
      <h3 className="text-lg font-bold text-white">2. Use of Information</h3>
      <p>
        Your information is used solely to authenticate your account, authorize temporary download tokens for purchased Photoshop templates, process billing transactions, and provide customer support.
      </p>
      <h3 className="text-lg font-bold text-white">3. Security & Encryption</h3>
      <p>
        All communications are encrypted using standard 256-bit TLS/SSL encryption. PSD asset files are stored on isolated, private storage infrastructure accessible only via time-limited HMAC signatures.
      </p>
    </div>
  </div>
);

export const Terms: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="flex items-center gap-3 text-sharp-400">
      <FileText className="w-8 h-8" />
      <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
    </div>
    <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
      <p>Last updated: October 2026</p>
      <h3 className="text-lg font-bold text-white">1. Acceptance of Terms</h3>
      <p>
        By accessing SharpShadows and purchasing any digital design asset, template, or Photoshop file, you agree to abide by these Terms of Service and our Licensing Agreement.
      </p>
      <h3 className="text-lg font-bold text-white">2. Nature of Digital Goods</h3>
      <p>
        Products sold on SharpShadows are digital, downloadable Adobe Photoshop PSD files and ZIP archives. Delivery is immediate and electronic upon confirmed payment.
      </p>
      <h3 className="text-lg font-bold text-white">3. Prohibited Conduct</h3>
      <p>
        You may not sublicense, resell, redistribute, give away for free, or include any raw PSD files or layered graphics as part of another digital marketplace or template generator.
      </p>
    </div>
  </div>
);

export const RefundPolicy: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="flex items-center gap-3 text-sharp-400">
      <RefreshCw className="w-8 h-8" />
      <h1 className="text-3xl font-extrabold text-white">Digital Product Refund Policy</h1>
    </div>
    <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
      <p>Last updated: October 2026</p>
      <div className="p-4 rounded-2xl bg-sharp-500/10 border border-sharp-500/20 text-sharp-300 text-xs">
        <strong>Important Notice on Digital Goods:</strong> Because digital Photoshop files (.psd) are non-returnable once download access is authorized, standard physical goods return rules do not apply.
      </div>
      <h3 className="text-lg font-bold text-white">1. Eligibility for Refunds or Replacements</h3>
      <p>We provide full refunds or corrected file replacements under the following verified conditions:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>The downloaded PSD file is corrupted, unreadable, or missing critical promised layers, and our technical support cannot provide a working replacement within 48 hours.</li>
        <li>You were charged multiple times for the same transaction due to a gateway error.</li>
        <li>The product description demonstrably misrepresented the dimensions or format of the file.</li>
      </ul>
      <h3 className="text-lg font-bold text-white">2. Ineligible Situations</h3>
      <p>Refunds will not be granted if:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>You simply changed your mind after downloading the full PSD asset.</li>
        <li>You lack Adobe Photoshop or compatible software to open .PSD files (all listings explicitly state software requirements).</li>
      </ul>
    </div>
  </div>
);

export const License: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="flex items-center gap-3 text-sharp-400">
      <Award className="w-8 h-8" />
      <h1 className="text-3xl font-extrabold text-white">Commercial License Agreement</h1>
    </div>
    <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
      <h3 className="text-lg font-bold text-white">What You Can Do:</h3>
      <ul className="list-disc pl-5 space-y-2 text-slate-300">
        <li>Use the PSD template in unlimited personal and commercial client projects.</li>
        <li>Modify, customize typography, colors, smart objects, and imagery to produce final raster/vector deliverables (e.g. JPG, PNG, PDF).</li>
        <li>Print physical flyers, wedding stationery, business cards, posters, and menus for retail or promotional distribution.</li>
        <li>Publish rendered digital graphics on client websites, Instagram, YouTube, and digital billboards.</li>
      </ul>

      <h3 className="text-lg font-bold text-white pt-4">What You Cannot Do:</h3>
      <ul className="list-disc pl-5 space-y-2 text-sharp-300">
        <li>You cannot re-sell, license, share, or redistribute the source layered PSD file.</li>
        <li>You cannot claim original copyright authorship of the underlying PSD layout structure.</li>
        <li>You cannot upload our PSD assets to print-on-demand competitor websites or stock libraries.</li>
      </ul>
    </div>
  </div>
);

import { settingService } from '../services/settingService';

export const Contact: React.FC = () => {
  const [contactEmail, setContactEmail] = React.useState('sharpshadowss@gmail.com');

  React.useEffect(() => {
    let isMounted = true;
    settingService
      .getPublicSettings()
      .then((settings) => {
        if (isMounted && settings?.public_contact_email) {
          setContactEmail(settings.public_contact_email);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="flex items-center gap-3 text-sharp-400">
        <Mail className="w-8 h-8" />
        <h1 className="text-3xl font-extrabold text-white">Contact & Support</h1>
      </div>
      <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <p>
          Have questions regarding a PSD purchase, payment verification, custom licensing, or technical template support? Our team is here to assist you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-dark-950 border border-dark-800 space-y-2">
            <h4 className="font-bold text-white text-base">Customer Support</h4>
            <p className="text-xs text-slate-400">For download issues, invoices, or payment inquiries:</p>
            <a
              href={`mailto:${contactEmail}`}
              className="text-sharp-400 hover:text-sharp-300 font-mono font-semibold block text-sm transition-colors"
            >
              {contactEmail}
            </a>
          </div>
          <div className="p-5 rounded-2xl bg-dark-950 border border-dark-800 space-y-2">
            <h4 className="font-bold text-white text-base">Licensing & Partnerships</h4>
            <p className="text-xs text-slate-400">For enterprise licensing or creative collaborations:</p>
            <a
              href={`mailto:${contactEmail}`}
              className="text-sharp-400 hover:text-sharp-300 font-mono font-semibold block text-sm transition-colors"
            >
              {contactEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
