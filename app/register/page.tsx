"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRegistrationCaptchaAction,
  registerVendorAction,
} from "./actions";

const steps = [
  "Company",
  "Business",
  "Contact",
  "Address",
  "Security",
];

const organizationTypes = [
  "Buyer",
  "Seller",
  "Service Provider",
];

const participantTypes = [
  "Buyer",
  "Seller",
  "Service Provider",
  "Buyer & Seller",
];

const businessCategories = [
  "Angles / Channels",
  "Automobile",
  "Bank Acquired Property / Assets",
  "Cement",
  "Chemicals",
  "Coal",
  "Construction Material",
  "Electrical & Electronics",
  "Ferrous Scrap",
  "IT & Technology",
  "Logistics & Transport",
  "Machinery & Equipment",
  "Metals & Steel",
  "Non-Ferrous Metals",
  "Oil & Gas",
  "Paper",
  "Plastic & Rubber",
  "Real Estate",
  "Services",
  "Textiles",
  "Vehicles",
  "Other",
];

const countries = [
  "India",
  "United Arab Emirates",
  "Singapore",
  "United Kingdom",
  "United States",
  "Other",
];

const currencies = [
  "INR - Indian Rupee",
  "USD - US Dollar",
  "EUR - Euro",
  "GBP - British Pound",
  "AED - UAE Dirham",
  "SGD - Singapore Dollar",
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

type RegistrationForm = {
  organizationName: string;
  organizationType: string;
  panNumber: string;
  gstNumber: string;
  website: string;

  participantType: string;
  businessCategories: string[];
  otherCategory: string;

  firstName: string;
  lastName: string;
  designation: string;
  mobile: string;
  email: string;
  fax: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  currency: string;

  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState<RegistrationForm>({
    organizationName: "",
    organizationType: "",
    panNumber: "",
    gstNumber: "",
    website: "",

    participantType: "",
    businessCategories: [],
    otherCategory: "",

    firstName: "",
    lastName: "",
    designation: "",
    mobile: "",
    email: "",
    fax: "",

    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    currency: "INR - Indian Rupee",

    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistrationSubmitted, setIsRegistrationSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);

  const loadCaptcha = async () => {
    setIsCaptchaLoading(true);

    try {
      const result = await createRegistrationCaptchaAction();

      if (!result.success || !result.question || !result.token) {
        setError(result.message || "Could not load CAPTCHA. Please refresh and try again.");
        return;
      }

      setCaptchaQuestion(result.question);
      setCaptchaToken(result.token);
      setCaptchaAnswer("");
      setError("");
    } catch (captchaError) {
      console.error("CAPTCHA loading failed:", captchaError);
      setError("Could not load CAPTCHA. Please refresh and try again.");
    } finally {
      setIsCaptchaLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCaptcha();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const updateField = (
    field: keyof Omit<RegistrationForm, "businessCategories">,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  const toggleCategory = (category: string) => {
    setForm((current) => {
      const alreadySelected = current.businessCategories.includes(category);

      return {
        ...current,
        businessCategories: alreadySelected
          ? current.businessCategories.filter((item) => item !== category)
          : [...current.businessCategories, category],
      };
    });

    setError("");
  };

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();

    if (!search) {
      return businessCategories;
    }

    return businessCategories.filter((category) =>
      category.toLowerCase().includes(search),
    );
  }, [categorySearch]);

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;

  const passwordStrength =
    passwordScore <= 2
      ? "Weak"
      : passwordScore <= 4
        ? "Medium"
        : "Strong";

  const passwordStrengthWidth =
    passwordScore === 0
      ? "w-0"
      : passwordScore === 1
        ? "w-1/5"
        : passwordScore === 2
          ? "w-2/5"
          : passwordScore === 3
            ? "w-3/5"
            : passwordScore === 4
              ? "w-4/5"
              : "w-full";

  const validateStepOne = () => {
    if (!form.organizationName.trim()) {
      setError("Please enter your company or organization name.");
      return false;
    }

    if (!form.organizationType) {
      setError("Please select your organization type.");
      return false;
    }

    if (form.panNumber.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

      if (!panRegex.test(form.panNumber.trim().toUpperCase())) {
        setError("Please enter a valid PAN number.");
        return false;
      }
    }

    if (form.gstNumber.trim()) {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/;

      if (!gstRegex.test(form.gstNumber.trim().toUpperCase())) {
        setError("Please enter a valid GST number.");
        return false;
      }
    }

    if (form.website.trim()) {
      try {
        new URL(form.website.trim());
      } catch {
        setError("Please enter a valid website URL.");
        return false;
      }
    }

    return true;
  };

  const validateStepTwo = () => {
    if (!form.participantType) {
      setError("Please select how your organization participates.");
      return false;
    }

    if (form.businessCategories.length === 0) {
      setError("Please select at least one product or service category.");
      return false;
    }

    if (
      form.businessCategories.includes("Other") &&
      !form.otherCategory.trim()
    ) {
      setError("Please enter your other product or service category.");
      return false;
    }

    return true;
  };

  const validateStepThree = () => {
    if (!form.firstName.trim()) {
      setError("Please enter the contact person's first name.");
      return false;
    }

    if (!form.lastName.trim()) {
      setError("Please enter the contact person's last name.");
      return false;
    }

    if (!form.designation.trim()) {
      setError("Please enter the contact person's designation.");
      return false;
    }

    const mobileRegex = /^[6-9][0-9]{9}$/;

    if (!mobileRegex.test(form.mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const validateStepFour = () => {
    if (!form.addressLine1.trim()) {
      setError("Please enter your address.");
      return false;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return false;
    }

    if (!form.state) {
      setError("Please select your state.");
      return false;
    }

    if (!form.country) {
      setError("Please select your country.");
      return false;
    }

    if (!form.postalCode.trim()) {
      setError("Please enter your PIN / postal code.");
      return false;
    }

    if (!/^[0-9A-Za-z -]{4,10}$/.test(form.postalCode.trim())) {
      setError("Please enter a valid PIN / postal code.");
      return false;
    }

    if (!form.currency) {
      setError("Please select your preferred currency.");
      return false;
    }

    return true;
  };

  const validateStepFive = () => {
    if (!passwordChecks.length) {
      setError("Password must contain at least 8 characters.");
      return false;
    }

    if (!passwordChecks.uppercase) {
      setError("Password must contain at least one uppercase letter.");
      return false;
    }

    if (!passwordChecks.lowercase) {
      setError("Password must contain at least one lowercase letter.");
      return false;
    }

    if (!passwordChecks.number) {
      setError("Password must contain at least one number.");
      return false;
    }

    if (!passwordChecks.special) {
      setError("Password must contain at least one special character.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (!form.termsAccepted) {
      setError("Please accept the Terms and Conditions to continue.");
      return false;
    }

    return true;
  };

  const handleContinue = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (isSubmitting) {
      return;
    }

    if (currentStep === 1) {
      if (!validateStepOne()) return;

      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 2) {
      if (!validateStepTwo()) return;

      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 3) {
      if (!validateStepThree()) return;

      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 4) {
      if (!validateStepFour()) return;

      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 5) {
      if (!validateStepFive()) return;

      if (!captchaAnswer.trim()) {
        setError("Please solve the CAPTCHA before submitting.");
        return;
      }

      if (isCaptchaLoading || !captchaToken) {
        setError("CAPTCHA is still loading. Please wait a moment and try again.");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await registerVendorAction({
          organizationName: form.organizationName,
          organizationType: form.organizationType,
          participantType: form.participantType,
          website: form.website,
          panNumber: form.panNumber,
          gstNumber: form.gstNumber,
          businessCategories: form.businessCategories,
          otherBusinessCategory: form.otherCategory,
          firstName: form.firstName,
          lastName: form.lastName,
          designation: form.designation,
          mobile: form.mobile,
          email: form.email,
          fax: form.fax,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
          currency: form.currency,
          password: form.password,
          confirmPassword: form.confirmPassword,
          termsAccepted: form.termsAccepted,
          captchaToken,
          captchaAnswer: captchaAnswer.trim(),
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        setError("");
        setCaptchaAnswer("");
        setIsRegistrationSubmitted(true);
        setShowSuccessModal(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } catch (registrationError) {
        console.error("Registration submission failed:", registrationError);
        setError(
          "We could not submit your registration right now. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setError("");

    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold tracking-wide text-white shadow-sm">
            EA
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create Your Account
          </h1>

          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Register your organization and start participating in auctions.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const active = stepNumber === currentStep;
              const completed = stepNumber < currentStep;

              return (
                <div
                  key={step}
                  className="flex flex-1 items-start last:flex-none"
                >
                  <div className="flex min-w-0 flex-col items-center">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : completed
                            ? "bg-slate-700 text-white"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {completed ? "✓" : stepNumber}
                    </div>

                    <span
                      className={`mt-2 hidden text-xs font-medium sm:block ${
                        active || completed
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 mt-[18px] h-px flex-1 transition ${
                        completed ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm font-medium text-slate-700">
              Step {currentStep} of {steps.length} —{" "}
              {steps[currentStep - 1]} Details
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleContinue}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* Header */}
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
              <h2 className="text-xl font-semibold text-slate-900">
                {currentStep === 1 && "Tell us about your organization"}
                {currentStep === 2 && "Business Profile"}
                {currentStep === 3 && "Authorized Contact"}
                {currentStep === 4 && "Business Address"}
                {currentStep === 5 && "Account Security & Submit"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {currentStep === 1 &&
                  "Enter the basic details of the organization that will use the platform."}

                {currentStep === 2 &&
                  "Tell us whether you are buying, selling, providing services, and what you deal in."}

                {currentStep === 3 &&
                  "Enter the details of the primary person responsible for this account."}

                {currentStep === 4 &&
                  "Provide the registered or primary business address for your organization."}

                {currentStep === 5 &&
                  "Create a strong password, accept the terms, complete the CAPTCHA, and submit your registration."}
              </p>
            </div>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">

                <div className="sm:col-span-2">
                  <label
                    htmlFor="organizationName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Company / Organization Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="organizationName"
                    type="text"
                    value={form.organizationName}
                    onChange={(e) =>
                      updateField("organizationName", e.target.value)
                    }
                    placeholder="Enter company or organization name"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="organizationType"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Organization Type *
                  </label>

                  <select
                    id="organizationType"
                    value={form.organizationType}
                    onChange={(e) =>
                      updateField("organizationType", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="">Select organization type</option>

                    {organizationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="website"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Website
                    <span className="ml-2 text-xs text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    id="website"
                    type="url"
                    value={form.website}
                    onChange={(e) =>
                      updateField("website", e.target.value)
                    }
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="panNumber"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    PAN Number
                    <span className="ml-2 text-xs text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    id="panNumber"
                    type="text"
                    maxLength={10}
                    value={form.panNumber}
                    onChange={(e) =>
                      updateField(
                        "panNumber",
                        e.target.value
                          .replace(/[^a-zA-Z0-9]/g, "")
                          .toUpperCase(),
                      )
                    }
                    placeholder="ABCDE1234F"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gstNumber"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    GST Number
                    <span className="ml-2 text-xs text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    id="gstNumber"
                    type="text"
                    maxLength={15}
                    value={form.gstNumber}
                    onChange={(e) =>
                      updateField(
                        "gstNumber",
                        e.target.value
                          .replace(/[^a-zA-Z0-9]/g, "")
                          .toUpperCase(),
                      )
                    }
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="px-6 py-7 sm:px-8">

                <label className="mb-3 block text-sm font-medium text-slate-700">
                  How will you use the platform? *
                </label>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {participantTypes.map((type) => {
                    const selected = form.participantType === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          updateField("participantType", type)
                        }
                        className={`rounded-xl border px-4 py-4 text-left transition ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {type}
                          </span>

                          <span>{selected ? "✓" : "○"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="my-8 border-t border-slate-100" />

                <h3 className="text-base font-semibold text-slate-900">
                  Products / Services You Supply or Purchase
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Select all categories relevant to your organization.
                </p>

                <input
                  type="search"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search products or services..."
                  className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCategories.map((category) => {
                    const selected =
                      form.businessCategories.includes(category);

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`rounded-xl border px-4 py-4 text-left text-sm font-medium transition ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{category}</span>
                          <span>{selected ? "✓" : "○"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {form.businessCategories.includes("Other") && (
                  <input
                    type="text"
                    value={form.otherCategory}
                    onChange={(e) =>
                      updateField("otherCategory", e.target.value)
                    }
                    placeholder="Enter your product or service"
                    className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                )}

                <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <strong>{form.businessCategories.length}</strong>{" "}
                  categories selected
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    First Name *
                  </label>

                  <input
                    value={form.firstName}
                    onChange={(e) =>
                      updateField("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Last Name *
                  </label>

                  <input
                    value={form.lastName}
                    onChange={(e) =>
                      updateField("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Designation *
                  </label>

                  <input
                    value={form.designation}
                    onChange={(e) =>
                      updateField("designation", e.target.value)
                    }
                    placeholder="e.g. Procurement Manager"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Mobile Number *
                  </label>

                  <input
                    type="tel"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) =>
                      updateField(
                        "mobile",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    This email will later be used for verification and account
                    notifications.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Fax
                    <span className="ml-2 text-xs text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    value={form.fax}
                    onChange={(e) =>
                      updateField("fax", e.target.value)
                    }
                    placeholder="Enter fax number if applicable"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Address Line 1 *
                  </label>

                  <input
                    value={form.addressLine1}
                    onChange={(e) =>
                      updateField("addressLine1", e.target.value)
                    }
                    placeholder="Building, street or registered address"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Address Line 2
                    <span className="ml-2 text-xs text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    value={form.addressLine2}
                    onChange={(e) =>
                      updateField("addressLine2", e.target.value)
                    }
                    placeholder="Area, landmark, floor, etc."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    City *
                  </label>

                  <input
                    value={form.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    placeholder="Enter city"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    State *
                  </label>

                  <select
                    value={form.state}
                    onChange={(e) =>
                      updateField("state", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="">Select state</option>

                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Country *
                  </label>

                  <select
                    value={form.country}
                    onChange={(e) =>
                      updateField("country", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    PIN / Postal Code *
                  </label>

                  <input
                    value={form.postalCode}
                    maxLength={10}
                    onChange={(e) =>
                      updateField(
                        "postalCode",
                        e.target.value
                          .replace(/[^0-9A-Za-z -]/g, "")
                          .slice(0, 10),
                      )
                    }
                    placeholder="Enter PIN / postal code"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Preferred Currency *
                  </label>

                  <select
                    value={form.currency}
                    onChange={(e) =>
                      updateField("currency", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <div className="px-6 py-7 sm:px-8">

                <div className="mx-auto max-w-2xl">

                  <div className="mb-7 rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">
                      Create a strong password
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Use a unique password that you do not use on other
                      websites.
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Password
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
                        placeholder="Create your password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((visible) => !visible)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* Strength */}
                    <div className="mt-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Password strength
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            passwordScore >= 5
                              ? "text-emerald-600"
                              : passwordScore >= 3
                                ? "text-amber-600"
                                : "text-red-500"
                          }`}
                        >
                          {form.password ? passwordStrength : "Not set"}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            passwordScore >= 5
                              ? "bg-emerald-500"
                              : passwordScore >= 3
                                ? "bg-amber-500"
                                : "bg-red-500"
                          } ${passwordStrengthWidth}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                    <p className="mb-3 text-sm font-semibold text-slate-800">
                      Password requirements
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        ["length", "At least 8 characters"],
                        ["uppercase", "One uppercase letter"],
                        ["lowercase", "One lowercase letter"],
                        ["number", "One number"],
                        ["special", "One special character"],
                      ].map(([key, label]) => {
                        const passed =
                          passwordChecks[key as keyof typeof passwordChecks];

                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-2 text-xs ${
                              passed
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                                passed
                                  ? "bg-emerald-100"
                                  : "bg-slate-100"
                              }`}
                            >
                              {passed ? "✓" : "•"}
                            </span>

                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mt-6">
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Confirm Password
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) =>
                          updateField("confirmPassword", e.target.value)
                        }
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((visible) => !visible)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {form.confirmPassword && (
                      <p
                        className={`mt-2 text-xs font-medium ${
                          form.password === form.confirmPassword
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {form.password === form.confirmPassword
                          ? "Passwords match."
                          : "Passwords do not match."}
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={form.termsAccepted}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          termsAccepted: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />

                    <span className="text-xs leading-5 text-slate-600">
                      I confirm that the information provided is accurate and I
                      agree to the platform&apos;s Terms and Conditions and
                      Privacy Policy.
                    </span>
                  </label>

                  {/* CAPTCHA */}
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Security Check</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Solve the simple CAPTCHA before submitting your registration.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void loadCaptcha()}
                        disabled={isCaptchaLoading || isSubmitting}
                        className="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                      >
                        ↻ New CAPTCHA
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
                      <div className="flex min-h-12 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-lg font-bold tracking-widest text-slate-900">
                        {isCaptchaLoading ? "Loading…" : captchaQuestion || "—"}
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={captchaAnswer}
                        onChange={(event) => {
                          setCaptchaAnswer(event.target.value.replace(/\D/g, "").slice(0, 3));
                          setError("");
                        }}
                        placeholder="Answer"
                        disabled={isCaptchaLoading || isSubmitting}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}
            {/* Error */}
            {error && (
              <div className="px-6 pb-5 sm:px-8">
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              </div>
            )}

            {isRegistrationSubmitted && (
              <div className="border-t border-slate-100 bg-emerald-50 px-6 py-6 sm:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <p className="text-base font-semibold text-emerald-800">
                    Your registration is successfully submitted.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    Your registration is saved successfully and is waiting for
                    activation. You can proceed to the login page.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
                  >
                    Click for Login
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting || currentStep === 1 || isRegistrationSubmitted}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isRegistrationSubmitted}
                className={`rounded-xl px-7 py-3 text-sm font-semibold shadow-sm transition ${
                  isSubmitting || isRegistrationSubmitted
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
                }`}
              >
                {isRegistrationSubmitted
                  ? "Registration Submitted"
                  : isSubmitting
                    ? "Submitting..."
                    : currentStep === 5
                      ? "Submit Registration"
                      : "Next →"}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Your registration information will be handled securely.
        </p>
      </div>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-success-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
              ✓
            </div>

            <div className="mt-5 text-center">
              <h2
                id="registration-success-title"
                className="text-xl font-bold text-slate-900"
              >
                Registration Successfully Done
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your registration has been submitted successfully. Please wait
                for activation.
              </p>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}