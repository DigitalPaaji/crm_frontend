import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Goal,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Printer,
  Share2,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";

import { base_url } from "../../components/utlis";

const OnBoardFullPage = () => {
  const { token } = useSelector((state) => state.token);
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${base_url}/onboarding/get/${encodeURIComponent(id)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to fetch onboarding details"
          );
        }

        setClient(result.client);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error(error);
        setError(error.message || "Something went wrong");
        setClient(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [token, id]);

  const formatDate = (value) => {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not provided";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sections = useMemo(() => {
    if (!client) return [];

    return [
      {
        title: "Business Information",
        description: "Basic information about the business.",
        icon: BriefcaseBusiness,
        fields: [
          ["Business Name", client.businessName],
          ["Owner Name", client.ownerName],
          ["Business Age", client.businessAge],
          ["Website", client.website, "website"],
          ["Business Description", client.businessDesc, "full"],
        ],
      },
      {
        title: "Target Audience",
        description: "Information about the ideal customers.",
        icon: UsersRound,
        fields: [
          ["Owner Age Range", client.ownerAgeRange],
          ["Gender", client.gender],
          ["Customer Location", client.customersLocation],
          ["Income Level", client.incomeLevel],
          ["Customer Values", client.customersValues, "full"],
          ["Customer Problem", client.customersProblem, "full"],
        ],
      },
      {
        title: "Brand Identity",
        description: "Brand personality and visual preferences.",
        icon: Palette,
        fields: [
          ["Brand Personality", client.brandPersonality, "full"],
          ["Brand Colors", client.brandColors],
          ["Logo Status", client.logoStatus],
          ["Brands Admired", client.brandAdmire],
          ["Desired Brand Feel", client.brandFeel],
        ],
      },
      {
        title: "Social Media",
        description: "Current social media presence and results.",
        icon: Share2,
        fields: [
          ["Platforms", client.platforms, "full"],
          ["Handles", client.handles],
          ["Followers", client.followers],
          ["Post Frequency", client.postFrequency],
          ["Paid Ads Before", client.paidAdsBefore],
          ["What Worked", client.whatWorked, "full"],
        ],
      },
      {
        title: "Competitors and USP",
        description: "Competitive position and unique value.",
        icon: Target,
        fields: [
          ["Competitors", client.competitors, "full"],
          ["What Competitors Do Better", client.competitorsBetter, "full"],
          ["What You Do Better", client.youBetter, "full"],
          ["Unique Selling Proposition", client.usp, "full"],
        ],
      },
      {
        title: "Goals and Vision",
        description: "Business goals and long-term direction.",
        icon: Goal,
        fields: [
          ["Primary Goal", client.primaryGoal, "full"],
          ["Success in 3 Months", client.winIn3Months, "full"],
          ["Vision in 1 Year", client.visionIn1Year, "full"],
          ["Things to Avoid", client.avoidThis, "full"],
        ],
      },
      {
        title: "Budget and Advertising",
        description: "Marketing budget and advertising preferences.",
        icon: CircleDollarSign,
        fields: [
          ["Budget", client.budget],
          ["Want Paid Ads", client.wantAds],
          ["Budget Flexibility", client.budgetFlexibility, "full"],
        ],
      },
      {
        title: "Content Requirements",
        description: "Content formats, language and available assets.",
        icon: FileText,
        fields: [
          ["Content Types", client.contentTypes, "full"],
          ["Content Language", client.contentLanguage],
          ["Content Assets", client.contentAssets],
          ["No Content Available", client.noContent, "full"],
          ["Inspiration Accounts", client.inspirationAccounts, "full"],
        ],
      },
      {
        title: "Communication",
        description: "Communication and approval preferences.",
        icon: MessageCircle,
        fields: [
          ["Communication Channel", client.communicationChannel],
          ["Update Frequency", client.updateFrequency],
          ["Approval Process", client.approval],
          [
            "Digital Marketing Knowledge",
            client.digitalMarketingKnowledge,
          ],
          ["Anything Else", client.anythingElse, "full"],
        ],
      },
    ];
  }, [client]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />

          <p className="mt-4 text-sm font-medium text-slate-700">
            Loading client details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-slate-100 p-5">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <FileText className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load client
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || "Client details were not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-100 text-slate-900">
      <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
        {/* Top buttons */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-400 hover:text-orange-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            <Printer size={17} />
            Print
          </button>
        </div>

        {/* Client heading */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-900 px-5 py-7 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white sm:h-16 sm:w-16">
                  <Building2 size={30} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-300">
                    Client Onboarding Form
                  </p>

                  <h1 className="mt-1 break-words text-2xl font-bold text-white sm:text-3xl">
                    {client.businessName || "Unnamed Business"}
                  </h1>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                    <UserRound size={16} />

                    <span className="break-words">
                      {client.ownerName || "Owner not provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-fit rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300">
                Submitted
              </div>
            </div>
          </div>

          {/* Contact details */}

          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
            <ContactItem
              icon={Mail}
              label="Email"
              value={client.email}
              href={client.email ? `mailto:${client.email}` : null}
            />

            <ContactItem
              icon={Phone}
              label="Phone"
              value={client.phone}
              href={client.phone ? `tel:${client.phone}` : null}
            />

            <ContactItem
              icon={MapPin}
              label="City"
              value={client.city}
            />

            <ContactItem
              icon={CalendarDays}
              label="Submitted"
              value={formatDate(client.createdAt)}
            />
          </div>
        </section>

        {/* Sections */}

        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <InfoSection
              key={section.title}
              title={section.title}
              description={section.description}
              icon={section.icon}
              fields={section.fields}
            />
          ))}
        </div>

        {/* Footer dates */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Created At
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {formatDate(client.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Last Updated
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {formatDate(client.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const ContactItem = ({ icon: Icon, label, value, href }) => {
  const content = (
    <div className="flex min-w-0 items-center gap-3 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <p className="mt-1 break-all text-sm font-semibold text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      className="block transition hover:bg-orange-50"
    >
      {content}
    </a>
  );
};

const InfoSection = ({
  title,
  description,
  icon: Icon,
  fields,
}) => {
  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2">
        {fields.map(([label, value, type]) => (
          <InfoField
            key={label}
            label={label}
            value={value}
            type={type}
          />
        ))}
      </div>
    </section>
  );
};

const InfoField = ({ label, value, type }) => {
  const hasValue = Array.isArray(value)
    ? value.length > 0
    : value !== undefined &&
      value !== null &&
      String(value).trim() !== "";

  const isFullWidth = type === "full";
  const isWebsite = type === "website";

  return (
    <div
      className={`min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 ${
        isFullWidth ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      {!hasValue ? (
        <p className="mt-2 text-sm italic text-slate-400">
          Not provided
        </p>
      ) : Array.isArray(value) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="max-w-full break-words rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700"
            >
              {item}
            </span>
          ))}
        </div>
      ) : isWebsite ? (
        <a
          href={
            String(value).startsWith("http")
              ? value
              : `https://${value}`
          }
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-orange-600 hover:underline"
        >
          {value}
          <ExternalLink className="shrink-0" size={14} />
        </a>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-700">
          {String(value)}
        </p>
      )}
    </div>
  );
};

export default OnBoardFullPage;