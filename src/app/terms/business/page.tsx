"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/app/lib/api";

export default function BusinessTermsPage() {
  const [signatureName, setSignatureName] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [signedDate, setSignedDate] = useState<string>("");
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const effectiveDate = signedDate || todayLabel;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("business:register");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.name) setBusinessName(data.name);
      }
      const sig = localStorage.getItem("business:signatureName");
      if (sig) setSignatureName(sig);
      const sigUrl = localStorage.getItem("business:signatureUrl");
      if (sigUrl) setSignatureUrl(sigUrl);
      const date = localStorage.getItem("business:signatureDate");
      if (date) setSignedDate(date);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const businessId = localStorage.getItem("businessId");
    if (!token || !businessId) return;
    apiGet(`/business/${businessId}`, token)
      .then((res: any) => {
        if (res?.name) setBusinessName(res.name);
        if (res?.termsSignatureName) setSignatureName(res.termsSignatureName);
        if (res?.termsSignatureUrl) setSignatureUrl(res.termsSignatureUrl);
        if (res?.termsAcceptedAt) {
          setSignedDate(new Date(res.termsAcceptedAt).toLocaleDateString());
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow p-6 sm:p-8 space-y-6 border border-gray-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          QLUTCHGRID PARTNER AGREEMENT
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Effective Date: {effectiveDate}
        </p>

        <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300 leading-6">
          <p>
            This Partner Agreement (“Agreement”) is entered into on{" "}
            {effectiveDate} (“Effective Date”) by and between:
          </p>
          <p>
            RideLink Innovations Private Limited, a company incorporated under
            the Companies Act, 2013, having its registered office at Chennai,
            Tamil Nadu, India, operating under the brand name “QlutchGrid”
            (hereinafter referred to as “QlutchGrid”, “Company”, “We”, or “Us”),
            which expression shall, unless it be repugnant to the context or
            meaning thereof, be deemed to mean and include its successors and
            permitted assigns, of the FIRST PART; AND the undersigned service
            provider, being a corporation having its principal place of business
            at [Partner's Address] (hereinafter referred to as the “Partner” or
            “You”), which expression shall, unless it be repugnant to the context
            or meaning thereof, be deemed to mean and include its successors and
            permitted assigns, of the SECOND PART.
          </p>
          <p>
            QlutchGrid and the Partner are hereinafter collectively referred to
            as the “Parties” and individually as a “Party”.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            WHEREAS
          </h2>
          <p>
            A. QlutchGrid owns and operates a technology platform, including a
            mobile application and website under the brand name ‘QlutchGrid’
            (the “Platform”), which acts as a marketplace to connect vehicle
            owners (“Users”) with verified third-party providers of automotive
            care services.
          </p>
          <p>
            B. The Partner is engaged in the business of providing professional
            automotive care services, including but not limited to car washing,
            detailing, coating, and related services (“Services”).
          </p>
          <p>
            C. The Partner desires to be listed on the Platform to offer its
            Services to Users, and QlutchGrid is willing to list the Partner,
            subject to the terms and conditions set forth in this Agreement.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            1. DEFINITIONS
          </h2>
          <p>
            1.1. “Applicable Law” means any statute, law, regulation, ordinance,
            rule, judgment, order, decree, by-law, approval from the concerned
            authority, government resolution, directive, guideline, policy,
            requirement, or other governmental restriction in force in India.
          </p>
          <p>
            1.2. “Confidential Information” means any information disclosed by
            one Party to the other, whether orally or in writing, that is
            designated as confidential or that reasonably should be understood to
            be confidential given the nature of the information and the
            circumstances of disclosure. It includes, but is not limited to,
            Platform Data, User information, business strategies, financial
            information, and the terms of this Agreement.
          </p>
          <p>
            1.3. “Intellectual Property Rights” means all patents, rights to
            inventions, copyright and related rights, trademarks, service marks,
            trade names, domain names, rights in trade dress or get-up, rights in
            goodwill or to sue for passing off, rights in designs, rights in
            computer software, database rights, rights in confidential
            information (including know-how and trade secrets) and any other
            intellectual property rights, in each case whether registered or
            unregistered and including all applications (or rights to apply) for,
            and renewals or extensions of, such rights and all similar or
            equivalent rights or forms of protection which subsist or will
            subsist now or in the future in any part of the world.
          </p>
          <p>
            1.4. “Platform Data” means all data and information collected,
            generated, or processed through the Platform, including but not
            limited to User personal data, booking details, transaction histories,
            payment data, customer reviews, and any aggregated or anonymized data
            derived therefrom.
          </p>
          <p>
            1.5. “Service Level Agreement” or “SLA” means the service level
            standards and key performance indicators as specified in Annexure B
            hereto, which may be updated by QlutchGrid from time to time upon
            notice to the Partner.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            2. SCOPE OF AGREEMENT & ONBOARDING
          </h2>
          <p>
            2.1. QlutchGrid hereby grants the Partner a non-exclusive, limited,
            non-transferable, and revocable right to access and use the
            Platform’s partner-facing tools (the “Partner Dashboard”) for the
            sole purpose of listing, managing, and providing its Services to
            Users in accordance with this Agreement.
          </p>
          <p>
            2.2. The Partner shall provide all necessary documentation and
            information as required by QlutchGrid for its onboarding and
            verification process, including but not limited to business
            registration certificates, GST registration, PAN card, and bank
            account details.
          </p>
          <p>
            2.3. The approval of the Partner’s listing on the Platform shall be
            at the sole and absolute discretion of QlutchGrid.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            3. PARTNER'S REPRESENTATIONS, WARRANTIES, AND OBLIGATIONS
          </h2>
          <p>
            3.1. The Partner represents and warrants to QlutchGrid that: (a) It
            is a duly organized and validly existing entity under the laws of
            India and has the full power and authority to enter into and perform
            its obligations under this Agreement. (b) It holds all necessary
            licenses, permits, registrations, and approvals required under
            Applicable Law to conduct its business and provide the Services. (c)
            It is in full compliance with all Applicable Laws, including but not
            limited to labor laws, environmental regulations, health and safety
            standards, and tax laws. (d) All information provided to QlutchGrid
            is and will remain true, accurate, and complete.
          </p>
          <p>
            3.2. The Partner covenants and agrees to: (a) Provide the Services in
            a professional, diligent, and workmanlike manner, consistent with
            the highest industry standards. (b) Strictly adhere to all
            performance metrics and standards set forth in the Service Level
            Agreement (Annexure B). (c) Honour all confirmed bookings made by
            Users through the Platform at the price and on the terms agreed upon
            at the time of booking. (d) Ensure that its service facility is
            clean, safe, and compliant with all applicable health and safety
            regulations. (e) Keep all information listed on the Platform,
            including service descriptions, pricing, and availability, accurate
            and up-to-date at all times. (f) Not engage in any activity that is
            fraudulent, illegal, or may, in QlutchGrid’s reasonable opinion,
            harm the brand, reputation, or goodwill of QlutchGrid.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            4. QLUTCHGRID'S OBLIGATIONS
          </h2>
          <p>
            4.1. QlutchGrid shall: (a) Provide the Partner with access to the
            Partner Dashboard to manage its listings and bookings. (b) Use
            commercially reasonable efforts to market the Platform and make the
            Partner’s Services visible to Users. (c) Facilitate the collection
            of payments from Users on behalf of the Partner. (d) Provide
            reasonable technical support to the Partner in relation to the use
            of the Partner Dashboard.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            5. COMMERCIAL TERMS: FEES, PAYMENTS, AND TAXES
          </h2>
          <p>
            5.1. Fees and Commissions: The Partner agrees to pay QlutchGrid the
            onboarding fees, subscription fees, and/or commission fees as
            specified in the commercial plan selected by the Partner, the details
            of which are set forth in Annexure A (“Commercial Terms”). All fees
            are exclusive of applicable taxes, including GST.
          </p>
          <p>
            5.2. Payment Settlement: QlutchGrid shall collect the total service
            fee from the User. Within a defined settlement cycle (e.g., T+7
            business days, where ‘T’ is the date of successful service
            completion), QlutchGrid shall remit to the Partner’s designated bank
            account the amount collected, less: (i) the applicable fees as per
            Annexure A, (ii) any applicable taxes on such fees, (iii) payment
            gateway charges, and (iv) any other amounts due from the Partner to
            QlutchGrid under this Agreement (including refunds, chargebacks,
            etc.).
          </p>
          <p>
            5.3. Refunds and Chargebacks: The Partner shall be solely and fully
            liable for all customer chargebacks, refunds, or payment disputes
            arising from or related to the Services provided by the Partner.
            QlutchGrid shall have the absolute right to debit the full amount of
            any such chargeback or refund from any current or future payments due
            to the Partner.
          </p>
          <p>
            5.4. Taxes: The Partner is an independent contractor and is solely
            responsible for the calculation, collection, and remittance of all
            applicable taxes (including GST) on the Services it provides to
            Users. The Partner shall indemnify QlutchGrid against any claims,
            penalties, or liabilities arising from the Partner's failure to
            comply with its tax obligations.
          </p>
          <p>
            5.5. Right to Modify Commercial Terms: QlutchGrid reserves the right
            to unilaterally modify the Commercial Terms set forth in Annexure A
            by providing the Partner with thirty (30) days' prior written or
            electronic notice. The Partner's continued use of the Platform after
            the expiry of such notice period shall constitute its binding
            acceptance of the revised terms.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            6. INTELLECTUAL PROPERTY RIGHTS
          </h2>
          <p>
            6.1. QlutchGrid's IP: QlutchGrid retains all right, title, and
            interest in and to its Intellectual Property Rights, including the
            Platform, its underlying technology, branding, logos, and all related
            materials. This Agreement does not grant the Partner any rights to
            QlutchGrid’s IP, except for the limited right to display QlutchGrid
            branding as may be expressly permitted in writing.
          </p>
          <p>
            6.2. Partner's IP License Grant: The Partner hereby grants to
            QlutchGrid a non-exclusive, royalty-free, fully paid-up, worldwide,
            sub-licensable license to use, host, display, reproduce, modify, and
            distribute the Partner's name, logos, service marks, trademarks, and
            any content provided by the Partner (including photographs, service
            descriptions, and promotional materials) for the purposes of
            operating the Platform, listing the Partner's Services, and
            conducting marketing and promotional activities for QlutchGrid and
            its Platform.
          </p>
          <p>
            6.3. Use of QlutchGrid Branding by Partner: To promote the Platform
            and the partnership, QlutchGrid hereby grants the Partner a limited,
            non-exclusive, non-transferable, and revocable license during the
            term of this Agreement to display certain QlutchGrid trademarks and
            logos (the “QlutchGrid Marks”) provided or expressly approved in
            writing by QlutchGrid. The Partner may use the QlutchGrid Marks,
            including phrases such as "Powered by QlutchGrid" or "Partnered with
            QlutchGrid," solely in the form and manner prescribed by QlutchGrid
            in its brand usage guidelines. The Partner shall not use any other
            phrases or modify the QlutchGrid Marks in any way without the prior
            written consent of QlutchGrid. All goodwill arising from the use of
            the QlutchGrid Marks shall inure to the sole benefit of QlutchGrid.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            7. DATA OWNERSHIP AND DATA PROTECTION
          </h2>
          <p>
            7.1. Data Ownership: QlutchGrid shall be the sole and exclusive owner
            of all Platform Data. The Partner acknowledges and agrees that it
            has no ownership rights, title, or interest in the Platform Data.
            QlutchGrid grants the Partner a limited, non-transferable right to
            access and use certain Platform Data (e.g., a User's name and booking
            details) solely for the specific and limited purpose of fulfilling a
            confirmed booking made through the Platform.
          </p>
          <p>
            7.2. Data Protection Compliance: (a) For the purposes of the Digital
            Personal Data Protection Act, 2023 (DPDPA) and other applicable data
            privacy laws, QlutchGrid is the “Data Fiduciary” and the Partner is
            a “Data Processor” with respect to any User’s personal data shared
            for service fulfillment. (b) The Partner shall: (i) process such
            personal data strictly in accordance with QlutchGrid's instructions
            and only for the purpose of rendering the booked Service; (ii)
            implement and maintain reasonable administrative, technical, and
            physical security safeguards to protect the personal data; (iii) not
            disclose the personal data to any third party without QlutchGrid's
            prior written consent; (iv) immediately notify QlutchGrid of any
            actual or suspected data breach; (v) provide reasonable assistance
            to QlutchGrid in responding to data subject rights requests; and
            (vi) upon termination of this Agreement, securely delete or return
            all personal data in its possession and certify such deletion in
            writing.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            8. CONFIDENTIALITY AND NON-SOLICITATION
          </h2>
          <p>
            8.1. Confidentiality: Each Party agrees to hold the other Party’s
            Confidential Information in strict confidence and not to disclose
            such information to any third party or use it for any purpose other
            than the performance of this Agreement. This obligation shall
            survive the termination of this Agreement.
          </p>
          <p>
            8.2. Non-Solicitation and Non-Circumvention: (a) For the purposes of
            this clause, a “QlutchGrid User” is any customer who has made a
            booking with the Partner at any time through the Platform. (b) The
            Partner agrees that during the term of this Agreement and for a
            period of twelve (12) months thereafter, it will not, directly or
            indirectly, solicit, induce, encourage, or accept any service booking
            from a QlutchGrid User with the intent to circumvent the Platform.
            This obligation expressly prohibits the Partner from accepting or
            fulfilling direct service requests from a QlutchGrid User, regardless
            of who initiates the communication, if such a transaction would
            bypass the Platform. (c) A breach of this clause shall be deemed a
            material breach of this Agreement, entitling QlutchGrid to immediate
            termination and the right to claim liquidated damages equivalent to
            200% of the commission QlutchGrid would have earned on such
            circumvented transactions.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            9. TERM AND TERMINATION
          </h2>
          <p>
            9.1. Term: This Agreement shall commence on the Effective Date and
            shall continue for an initial term of one (1) year (“Initial Term”).
            Thereafter, this Agreement shall automatically renew for successive
            periods of one (1) year each (each, a “Renewal Term”), unless either
            Party provides the other with written notice of its intent not to
            renew at least ninety (90) days prior to the end of the then-current
            Initial Term or Renewal Term.
          </p>
          <p>
            9.2. Termination by QlutchGrid: (a) For Convenience: QlutchGrid may
            terminate this Agreement for any reason or no reason by providing the
            Partner with thirty (30) days' prior written notice. (b) For Cause:
            QlutchGrid may terminate this Agreement immediately upon written
            notice to the Partner if the Partner: (i) commits a material breach
            of this Agreement (including failure to meet SLA standards); (ii)
            engages in any fraudulent, illegal, or unethical activity; (iii)
            becomes insolvent or bankrupt; or (iv) engages in any conduct that
            harms or may harm the brand or reputation of QlutchGrid.
          </p>
          <p>
            9.3. Termination by Partner: The Partner may terminate this
            Agreement for convenience only by providing QlutchGrid with at least
            ninety (90) days' prior written notice, provided that such
            termination shall only become effective upon the expiry of the then-
            current Initial Term or Renewal Term.
          </p>
          <p>
            9.4. Effect of Termination: Upon termination of this Agreement for
            any reason: (a) the Partner's access to the Platform shall be
            immediately revoked; (b) the Partner shall cease all use of
            QlutchGrid’s IP; (c) all outstanding, undisputed payments shall be
            settled within forty-five (45) days; (d) the Partner shall securely
            delete or return all Confidential Information and User personal data;
            and (e) the provisions of Clauses 6, 7, 8, 10, 11, and 12 shall
            survive termination.
          </p>
          <p>
            9.5. Re-Onboarding After Termination: Should the Partner terminate
            this Agreement and later seek to re-join the Platform, QlutchGrid
            reserves the sole and absolute discretion to approve or deny such
            re-onboarding application.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            10. INDEMNIFICATION AND LIMITATION OF LIABILITY
          </h2>
          <p>
            10.1. Indemnification by Partner: The Partner shall indemnify,
            defend, and hold harmless QlutchGrid, its affiliates, directors,
            officers, employees, and agents from and against any and all third-
            party claims, liabilities, damages, losses, costs, and expenses
            (including reasonable attorneys' fees) arising out of, or in
            connection with: (a) any breach of the Partner's representations,
            warranties, or obligations under this Agreement; (b) the Services
            provided by the Partner, including claims of property damage, bodily
            injury, or unsatisfactory service; (c) any violation of Applicable
            Law by the Partner; (d) any claim that the Partner's content or
            branding infringes a third party's IP Rights; (e) any data breach or
            violation of data protection laws originating from the Partner’s
            systems or negligence; and (f) any claims related to taxes payable
            by the Partner.
          </p>
          <p>
            10.2. Limitation of Liability: TO THE MAXIMUM EXTENT PERMITTED BY
            LAW, IN NO EVENT SHALL QLUTCHGRID'S AGGREGATE LIABILITY ARISING OUT
            OF OR RELATED TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT, OR UNDER
            ANY OTHER THEORY OF LIABILITY, EXCEED THE TOTAL COMMISSIONS ACTUALLY
            PAID BY THE PARTNER TO QLUTCHGRID IN THE SIX (6) MONTHS IMMEDIATELY
            PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
          </p>
          <p>
            10.3. Disclaimer: QlutchGrid provides the Platform on an "as is" and
            "as available" basis. QlutchGrid is a technology intermediary and
            does not provide automotive care services. QlutchGrid makes no
            warranties regarding the quality, safety, or legality of the
            Services provided by the Partner. The contract for the Service is
            between the Partner and the User, and QlutchGrid is not a party to
            that transaction.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            11. GOVERNING LAW AND DISPUTE RESOLUTION
          </h2>
          <p>
            11.1. Governing Law: This Agreement shall be governed by and
            construed in accordance with the laws of India.
          </p>
          <p>
            11.2. Jurisdiction: The Parties hereby agree that any dispute, claim,
            or controversy arising out of or in connection with this Agreement
            shall be subject to the exclusive jurisdiction of the competent
            courts located in Chennai, Tamil Nadu.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            12. MISCELLANEOUS
          </h2>
          <p>
            12.1. Entire Agreement: This Agreement, including its Annexures,
            constitutes the entire understanding between the Parties and
            supersedes all prior agreements or communications.
          </p>
          <p>
            12.2. Relationship of Parties: The Partner is an independent
            contractor of QlutchGrid. Nothing in this Agreement shall be
            construed to create a partnership, joint venture, agency, or
            employment relationship.
          </p>
          <p>
            12.3. Notices: All notices shall be in writing and sent to the
            addresses specified above or via email and shall be deemed given
            upon receipt.
          </p>
          <p>
            12.4. Assignment: The Partner may not assign or transfer this
            Agreement without the prior written consent of QlutchGrid. QlutchGrid
            may freely assign this Agreement.
          </p>

          <p>
            IN WITNESS WHEREOF, the Parties hereto have executed this Agreement
            as of the Effective Date.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <p className="font-semibold text-gray-900 dark:text-slate-100">
              Signatures
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  For QlutchGrid (RideLink Innovations Pvt. Ltd.)
                </div>
                <div className="mt-2 text-gray-800 dark:text-slate-200">
                  Name: Preetham
                </div>
                <div className="text-gray-800 dark:text-slate-200">
                  Designation: Director
                </div>
                <div className="text-gray-800 dark:text-slate-200">Signature:</div>
                <div className="mt-2">
                  <img
                    src="/website_sign.png"
                    alt="RideLink signature"
                    className="h-16 object-contain border border-gray-200 dark:border-slate-700 rounded !bg-white"
                  />
                </div>
              </div>
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  For Partner
                </div>
                <div className="mt-2 text-gray-800 dark:text-slate-200">
                  Business Name: {businessName || "__________________"}
                </div>
                <div className="text-gray-800 dark:text-slate-200">
                  Authorized Signatory: {signatureName || "__________________"}
                </div>
                <div className="text-gray-800 dark:text-slate-200">
                  Signature:
                </div>
                {signatureUrl && (
                  <div className="mt-2">
                    <img
                      src={signatureUrl}
                      alt="Digital signature"
                      className="h-16 object-contain border border-gray-200 dark:border-slate-700 rounded bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            ANNEXURE A – COMMERCIAL TERMS
          </h2>
          <div className="space-y-2">
            <p>
              Starter Plan (Pay-as-you-grow): 20% Flat on Revenue. Quick entry
              plan – simple percentage model. Ideal for small or new businesses.
            </p>
            <p>
              Standard Plan (Flat Monthly): ₹15,000 per Month. Fixed payment
              model – predictable costs. Ideal for steady-volume partners.
            </p>
            <p>
              Growth+ Plan (Performance-based): ₹1,00,000 + 5% of Annual Revenue.
              Revenue reward: cross ₹20 L & get ₹50,000 off next year. Ideal for
              growing partners with large revenue.
            </p>
            <p>
              Premium Partner Plan (Elite Tier): ₹2,00,000 + 1.5% of Annual
              Revenue. Exclusive premium support & priority listing and much
              more. For established businesses above ₹40 L annual revenue.
            </p>
            <p>
              Notes: (1) Partners joining under the Early Access period will be
              exempt from paying the one-time onboarding fee of ₹1,499. (2)
              Partners registering after this period will pay a one-time
              onboarding fee of ₹1,499 along with the plan chosen from Annexure
              A. (3) Commissions and payments will be calculated as per the
              chosen plan above.
            </p>
          </div>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            ANNEXURE B – SERVICE LEVEL AGREEMENT (SLA)
          </h2>
          <p>
            1. Objective: Ensure all users of QlutchGrid receive consistent,
            reliable, and high-quality services and that all Partners uphold
            QlutchGrid’s operating standards and customer-experience benchmarks.
          </p>
          <p>
            2. QlutchGrid Commitments: Ensure platform uptime of 99% (excluding
            planned maintenance). Process settlements within T+7 business days
            from confirmed service completion. Provide accurate and transparent
            reports on bookings, transactions, and commissions. Maintain data
            privacy and user protection as per the Information Technology Act,
            2000 and Digital Personal Data Protection Act, 2023. Offer technical
            and operational support to partners through official communication
            channels.
          </p>
          <p>
            3. Service-Performance Parameters: Booking acknowledgement within 30
            minutes of receiving a booking request. Service timeliness with 95%
            on-time compliance. Maintain average rating of 4.0/5.0 or higher.
            Cancellations not more than 5% of total monthly bookings. Customer
            response time within 1 hour during business hours. Hygiene & safety
            compliance at 100% adherence. Payment & settlement accuracy at 100%.
          </p>
          <p>
            4. Reporting and Monitoring: QlutchGrid shall monitor Partner
            performance through platform data, customer feedback, and periodic
            audits. Reports generated monthly. Partners falling below required
            thresholds may receive written notice for improvement.
          </p>
          <p>
            5. Breach and Consequences: First occurrence: written advisory and a
            14-day corrective period. Second consecutive occurrence: temporary
            suspension of listing or withholding of payouts up to 25% for the
            affected period. Repeated or material breach: permanent de-listing
            or termination in accordance with Clause 9.2(b)(i).
          </p>
          <p>
            6. Continuous Improvement: QlutchGrid reserves the right to review
            and modify SLA parameters periodically to align with operational
            data, market conditions, or customer expectations. Updated SLAs will
            be communicated electronically and continued use constitutes
            acceptance.
          </p>
          <p>
            7. Acknowledgement: By operating through the QlutchGrid platform, the
            Partner acknowledges and agrees to comply with the above SLA
            parameters and understands that failure to do so may affect payouts.
          </p>
        </div>
      </div>
    </div>
  );
}
