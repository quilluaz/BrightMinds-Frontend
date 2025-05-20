import React from "react";
import { ShieldCheck } from "lucide-react"; // Example icon

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = "May 21, 2025"; // Update this date

  return (
    <div className="min-h-screen flex flex-col bg-primary-background dark:bg-primary-background-dark">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-primary-card-dark shadow-lg rounded-xl p-6 md:p-10 border dark:border-gray-700">
          <div className="text-center mb-8">
            <ShieldCheck className="text-primary-interactive dark:text-primary-interactive-dark h-16 w-16 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-text dark:text-primary-text-dark">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last Updated: {lastUpdated}
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p>
              Welcome to BrightMinds ("us", "we", or "our"). We are committed to
              protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              use our educational platform (the "Service"). Please read this
              privacy policy carefully. If you do not agree with the terms of
              this privacy policy, please do not access the Service.
            </p>
            <h2 className="text-primary-text dark:text-primary-text-dark">
              Information We Collect
            </h2>
            <p>
              We may collect information about you in a variety of ways. The
              information we may collect via the Service includes:
            </p>
            <ul>
              <li>
                <strong>Personal Data:</strong> Personally identifiable
                information, such as your name, email address, and user role
                (student or teacher), that you voluntarily give to us when you
                register with the Service. For student users, if enrolling via a
                teacher's classroom code, we may associate you with that
                classroom.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about your use of the
                Service, such as games played, scores achieved, progress within
                activities, and time spent on the platform. This data is
                primarily used to provide feedback to you and your teacher (if
                applicable) and to improve the Service.
              </li>
              <li>
                <strong>Derivative Data:</strong> Information our servers
                automatically collect when you access the Service, such as your
                IP address, browser type, operating system, access times, and
                the pages you have viewed directly before and after accessing
                the Service. (Note: Specify if you actually collect this much
                detail).
              </li>
            </ul>
            <h2 className="text-primary-text dark:text-primary-text-dark">
              Use of Your Information
            </h2>
            <p>
              Having accurate information about you permits us to provide you
              with a smooth, efficient, and customized experience. Specifically,
              we may use information collected about you via the Service to:
            </p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Provide educational content and track your progress.</li>
              <li>
                Enable teacher-student interactions within a classroom context.
              </li>
              <li>Personalize your experience on the platform.</li>
              <li>
                Monitor and analyze usage and trends to improve your experience
                with the Service.
              </li>
              <li>
                Respond to your comments and questions and provide customer
                support.
              </li>
              <li>(Add any other uses specific to BrightMinds)</li>
            </ul>
            <h2 className="text-primary-text dark:text-primary-text-dark">
              Disclosure of Your Information
            </h2>
            <p>
              We may share information we have collected about you in certain
              situations. Your information may be disclosed as follows:
            </p>
            <ul>
              <li>
                <strong>By Law or to Protect Rights:</strong> If we believe the
                release of information about you is necessary to respond to
                legal process, to investigate or remedy potential violations of
                our policies, or to protect the rights, property, and safety of
                others, we may share your information as permitted or required
                by any applicable law, rule, or regulation.
              </li>
              <li>
                <strong>Teachers and Students:</strong> If you are a student,
                your progress and performance data will be visible to your
                teacher(s) within the classroom(s) you are enrolled in. If you
                are a teacher, your name will be visible to students in your
                classrooms.
              </li>
              <li>
                <strong>Third-Party Service Providers:</strong> We may share
                your information with third parties that perform services for us
                or on our behalf, including data analysis, hosting services,
                customer service, and marketing assistance. (Specify if you use
                any, e.g., for analytics or hosting).
              </li>
              <li>
                <strong>With Your Consent:</strong> We may disclose your
                personal information for any other purpose with your consent.
              </li>
            </ul>
            <p>We do not sell your personal information.</p>
            <h2 className="text-primary-text dark:text-primary-text-dark">
              Security of Your Information
            </h2>
            <p>
              We use administrative, technical, and physical security measures
              to help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to
              us, please be aware that despite our efforts, no security measures
              are perfect or impenetrable, and no method of data transmission
              can be guaranteed against any interception or other type of
              misuse.
            </p>
            <h2 className="text-primary-text dark:text-primary-text-dark">
              Children's Privacy
            </h2>
            <p>
              Our Service is targeted towards Grade 3 students, who are
              typically under the age of 13. We are committed to complying with
              the Children's Online Privacy Protection Act (COPPA) and other
              applicable laws. We only collect personal information from
              children with appropriate consent, typically obtained through
              their school or teacher acting as an agent for the
              parent/guardian, or directly from a parent/guardian if a child
              registers independently (specify your consent mechanism).
            </p>
            <p>
              Parents and guardians can review their child's personal
              information, ask to have it deleted, and refuse to allow any
              further collection or use of the child's information. To do so,
              please contact us at the contact information below.
            </p>{" "}
            <h2 className="text-primary-text dark:text-primary-text-dark">
              Your Data Rights
            </h2>
            <p>
              Depending on your location, you may have the following rights
              regarding your personal data:
            </p>
            <ul>
              <li>
                The right to access – You have the right to request copies of
                your personal data.
              </li>
              <li>
                The right to rectification – You have the right to request that
                we correct any information you believe is inaccurate or complete
                information you believe is incomplete.
              </li>
              <li>
                The right to erasure – You have the right to request that we
                erase your personal data, under certain conditions.
              </li>
              <li>
                (Consult local regulations like the Philippines Data Privacy Act
                for specific rights to list).
              </li>
            </ul>
            <h2 className="text-primary-text dark:text-primary-text-dark">
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date. You are advised to
              review this Privacy Policy periodically for any changes.
            </p>
            <h2 className="text-primary-text dark:text-primary-text-dark">
              Contact Us
            </h2>
            <p>
              If you have questions or comments about this Privacy Policy,
              please contact us at:
            </p>
            <p>
              BrightMinds Support
              <br />
              Email:{" "}
              <a
                href="mailto:privacy@brightminds.ph"
                className="text-primary-interactive hover:underline">
                privacy@brightminds.ph
              </a>
              <br />
              {/* Address: [Your Fictional or Actual Address Here] */}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
