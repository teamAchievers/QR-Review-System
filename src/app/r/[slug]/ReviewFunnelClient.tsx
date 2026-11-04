"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Star, CheckCircle, Copy, ExternalLink, Sparkles, AlertCircle, ArrowLeft, HeartHandshake, ShieldCheck } from "lucide-react";
import { getBusinessQuickTags } from "@/lib/niches";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  category: string | null;
  city: string | null;
  primaryColor: string;
  minGoogleStar: number;
  googleReviewUrl: string;
  googlePlaceId: string | null;
  keywords: string;
  subscriptionStatus?: string;
  isSuspended?: boolean;
}

export default function ReviewFunnelClient({ business }: { business: BusinessData }) {
  // Step tracking:
  // "RATE" -> initial 1-5 star selection
  // "LOW_FEEDBACK" -> <= 3 stars written feedback form
  // "LOW_THANKS" -> <= 3 stars thank you page
  // "HIGH_INPUT" -> >= 4 stars quick feedback input
  // "HIGH_ENHANCED" -> keyword enriched review ready to copy & post to Google
  const [step, setStep] = useState<"RATE" | "LOW_FEEDBACK" | "LOW_THANKS" | "HIGH_INPUT" | "HIGH_ENHANCED">("RATE");

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Negative feedback form state
  const [negativeComment, setNegativeComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [submittingNegative, setSubmittingNegative] = useState(false);

  // Positive feedback form state
  const [positiveComment, setPositiveComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [enhancedOptions, setEnhancedOptions] = useState<string[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [finalReviewText, setFinalReviewText] = useState("");
  const [googleUrl, setGoogleUrl] = useState(business.googleReviewUrl || "");
  const [copiedModalOpen, setCopiedModalOpen] = useState(false);

  // Track initial QR scan on mount
  useEffect(() => {
    fetch("/api/review/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: business.slug }),
    }).catch(() => {});
  }, [business.slug]);

  // Handle star click
  const handleSelectStar = (stars: number) => {
    setRating(stars);
    if (stars <= 3) {
      setStep("LOW_FEEDBACK");
    } else {
      setStep("HIGH_INPUT");
    }
  };

  // Submit negative / private feedback
  const handleSubmitNegative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negativeComment.trim()) return;

    setSubmittingNegative(true);
    try {
      const res = await fetch("/api/review/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: business.slug,
          rating,
          comment: negativeComment,
          customerName,
          customerContact,
        }),
      });
      if (res.ok) {
        setStep("LOW_THANKS");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNegative(false);
    }
  };

  // Dynamic quick tags and placeholder tailored to business category/niche
  const { tags: quickTags, placeholder: nichePlaceholder } = useMemo(() => {
    return getBusinessQuickTags(business.category, business.keywords);
  }, [business.category, business.keywords]);

  const handleToggleTag = (tag: string) => {
    let nextTags: string[];
    if (selectedTags.includes(tag)) {
      nextTags = selectedTags.filter((t) => t !== tag);
    } else {
      nextTags = [...selectedTags, tag];
    }
    setSelectedTags(nextTags);
  };

  // Enhance positive review with business keywords & selected niche tags
  const handleEnhanceReview = async () => {
    // Merge user written input with any selected niche tags in lowercase
    let rawComment = positiveComment.trim().toLowerCase();
    if (selectedTags.length > 0) {
      const tagsNote = `particularly impressed by the ${selectedTags.map((t) => t.toLowerCase()).join(" and ")}.`;
      if (rawComment) {
        rawComment = `${rawComment} ${tagsNote}`;
      } else {
        rawComment = `great experience! ${tagsNote}`;
      }
    } else if (!rawComment) {
      rawComment = "everything was wonderful, loved the quality, service and atmosphere!";
    }

    setGeneratingAI(true);
    try {
      const res = await fetch("/api/review/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: business.slug,
          rating,
          comment: rawComment,
        }),
      });

      const data = await res.json();
      if (data.options && data.options.length > 0) {
        const lowerOptions = data.options.map((opt: string) => opt.toLowerCase());
        setEnhancedOptions(lowerOptions);
        setSelectedOptionIndex(0);
        setFinalReviewText(lowerOptions[0]);
      } else {
        setFinalReviewText(rawComment.toLowerCase());
      }
      if (data.googleReviewUrl) {
        setGoogleUrl(data.googleReviewUrl);
      }
      setStep("HIGH_ENHANCED");
    } catch (err) {
      console.error(err);
      setFinalReviewText(rawComment.toLowerCase());
      setStep("HIGH_ENHANCED");
    } finally {
      setGeneratingAI(false);
    }
  };

  // Copy to clipboard & open Google
  const handleCopyAndOpenGoogle = async () => {
    try {
      await navigator.clipboard.writeText(finalReviewText);
    } catch {
      // Fallback copy
      const textArea = document.createElement("textarea");
      textArea.value = finalReviewText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    // Track Google conversion
    fetch("/api/review/track-google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: business.slug }),
    }).catch(() => {});

    // Open guidance modal and launch Google window
    setCopiedModalOpen(true);
    window.open(googleUrl, "_blank", "noopener,noreferrer");
  };

  const starLabels: Record<number, string> = {
    1: "Very Unsatisfied",
    2: "Needs Improvement",
    3: "Average Experience",
    4: "Very Good!",
    5: "Outstanding!",
  };

  const activeStarIndex = hoverRating || rating;

  // Suspension Guard: Prevent reviews if subscription is SUSPENDED or past due
  if (business.isSuspended || business.subscriptionStatus === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6">
        <div className="max-w-md w-full mx-auto text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md font-bold text-2xl mb-3 opacity-60"
            style={{ backgroundColor: business.primaryColor || "#2563eb" }}
          >
            {business.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{business.name}</h1>
          
          <div className="mt-8 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Review Page Temporarily Inactive</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              This feedback portal is currently paused by management. Please check back later or speak directly with our team during your visit.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-400">
              Thank you for visiting {business.name}.
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          Powered by <strong className="text-slate-600">Unbox Studio</strong> • Reputation &amp; Local SEO System
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        {/* Business Header Card */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md font-bold text-2xl mb-3"
            style={{ backgroundColor: business.primaryColor || "#2563eb" }}
          >
            {business.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{business.name}</h1>
          {business.tagline && <p className="text-sm text-slate-500 mt-1">{business.tagline}</p>}
          {business.city && (
            <span className="inline-block mt-1 text-xs text-slate-400 font-medium">
              📍 {business.city} {business.category ? `• ${business.category}` : ""}
            </span>
          )}
        </div>

        {/* Main Interactive Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 transition-all">
          {/* ================= STEP 1: RATING ================= */}
          {step === "RATE" && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-2">How was your experience today?</h2>
              <p className="text-sm text-slate-500 mb-8">Tap a star to rate your visit</p>

              {/* Stars */}
              <div className="flex justify-center items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleSelectStar(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 sm:p-2 rounded-xl transition-transform active:scale-90 hover:scale-110 focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                        star <= activeStarIndex
                          ? "fill-amber-400 text-amber-400 filter drop-shadow-sm"
                          : "text-slate-200 fill-slate-50"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic Label */}
              <div className="h-6">
                {activeStarIndex > 0 ? (
                  <span className="text-sm font-semibold text-amber-600 animate-fadeIn">
                    {starLabels[activeStarIndex]}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">1 to 5 Stars</span>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified Customer Feedback System
              </div>
            </div>
          )}

          {/* ================= STEP 2: LOW RATING (<= 3 STARS) ================= */}
          {step === "LOW_FEEDBACK" && (
            <div>
              <button
                type="button"
                onClick={() => setStep("RATE")}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-500">({rating} of 5 stars)</span>
              </div>

              <h2 className="text-lg font-bold text-slate-800 mb-1">We are sorry we didn&apos;t meet expectations</h2>
              <p className="text-xs text-slate-500 mb-5">
                Your satisfaction is our priority. Please tell our management team what happened so we can resolve this right away.
              </p>

              <form onSubmit={handleSubmitNegative} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    What could we have done better? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={negativeComment}
                    onChange={(e) => setNegativeComment(e.target.value)}
                    placeholder="Tell us what went wrong (e.g., wait time, service, quality)..."
                    className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                  />
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-3">
                  <p className="text-xs font-medium text-slate-600">
                    Want our management team to contact you to make things right? (Optional)
                  </p>
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Phone or Email"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingNegative || !negativeComment.trim()}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submittingNegative ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Submit Private Feedback"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ================= STEP 3: LOW RATING THANK YOU ================= */}
          {step === "LOW_THANKS" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Thank you for your feedback</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your comments have been directly sent to our management team. We take every customer&apos;s experience seriously and are actively taking steps to improve our service.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 text-left">
                <strong>What happens next:</strong>
                <p className="mt-1">
                  Our general manager reviews internal feedback daily. If you provided your contact information, someone will reach out to you shortly.
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 4: HIGH RATING INPUT (>= 4 STARS) ================= */}
          {step === "HIGH_INPUT" && (
            <div>
              <button
                type="button"
                onClick={() => setStep("RATE")}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-emerald-600">Great Experience!</span>
              </div>

              <h2 className="text-lg font-bold text-slate-800 mb-1">What did you enjoy most?</h2>
              <p className="text-xs text-slate-500 mb-4">Tap any highlights or write your thoughts below:</p>

              {/* Quick Tags - Dynamically styled & customized by niche */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quickTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`text-xs sm:text-[13px] px-3.5 py-2 rounded-full border transition-all text-left flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                          : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 font-medium"
                      }`}
                    >
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mb-5">
                <textarea
                  rows={3}
                  value={positiveComment}
                  onChange={(e) => setPositiveComment(e.target.value)}
                  placeholder={nichePlaceholder}
                  className="w-full text-sm rounded-2xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 shadow-2xs leading-relaxed resize-y"
                />
              </div>

              <button
                type="button"
                onClick={handleEnhanceReview}
                disabled={generatingAI}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {generatingAI ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Preparing Google Review...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate &amp; Post on Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ================= STEP 5: KEYWORD-ENHANCED REVIEW READY ================= */}
          {step === "HIGH_ENHANCED" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Keyword Optimized Review
                </span>
                <button
                  type="button"
                  onClick={() => setStep("HIGH_INPUT")}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Edit details
                </button>
              </div>

              {/* Option Selector if multiple options */}
              {enhancedOptions.length > 1 && (
                <div className="flex gap-2 mb-3">
                  {enhancedOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedOptionIndex(i);
                        setFinalReviewText(opt);
                      }}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                        selectedOptionIndex === i
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Variation {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Editable Review Box */}
              <div className="relative mb-5">
                <textarea
                  rows={5}
                  value={finalReviewText}
                  onChange={(e) => setFinalReviewText(e.target.value)}
                  className="w-full text-sm leading-relaxed rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-slate-400">
                  Editable before posting
                </span>
              </div>

              {/* How it works banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Next Step:</strong> Tapping the button below copies your review and opens Google. Just <strong>Paste</strong> into the review box and hit <strong>Post</strong>!
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleCopyAndOpenGoogle}
                className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                <span>Copy &amp; Post on Google Reviews (5★)</span>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </button>

              <p className="text-center text-[11px] text-slate-400 mt-3">
                Opens directly in Google Maps / Google Reviews
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Powered by <strong className="text-slate-600">Unbox Studio</strong> • Reputation &amp; Local SEO System
        </div>
      </div>

      {/* ================= HIGH-CONVERTING ANIMATED PASTE GUIDE MODAL ================= */}
      {copiedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Copied Success Badge */}
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-200 shadow-xs relative">
              <CheckCircle className="w-9 h-9" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">Review Copied to Clipboard!</h3>
            <p className="text-xs text-slate-500 mb-4">
              Google Review is open. Follow these quick steps to paste your review:
            </p>

            {/* Visual Step-by-Step Graphic */}
            <div className="bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-2xl p-4 text-left border border-slate-200/90 mb-4 space-y-3">
              {/* Graphic Mockup of Long-Press -> Paste */}
              <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>How to Paste on Google:</span>
                  <span className="text-blue-600 font-semibold">1-Second Action</span>
                </div>

                <div className="relative bg-slate-50 rounded-lg p-2.5 border border-dashed border-slate-300 text-center my-2">
                  <div className="text-xs text-slate-400 italic mb-1.5">
                    &quot;Describe your experience...&quot;
                  </div>
                  
                  {/* Floating simulated Paste Tooltip */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-md text-[11px] font-bold shadow-md animate-bounce">
                    <span>👆 Tap &amp; Hold</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-emerald-400 underline">Tap &quot;Paste&quot;</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-tight text-center">
                  <strong>On Mobile:</strong> Press &amp; hold the box, then tap <strong>Paste</strong>.<br />
                  <strong>On Desktop:</strong> Press <strong>Ctrl + V</strong> (or <strong>Cmd + V</strong>).
                </p>
              </div>

              {/* Copied Text Snippet Preview */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5 flex items-center justify-between">
                  <span>Your Prepared Review:</span>
                  <span className="text-[10px] text-emerald-600 lowercase font-mono">5 stars ready</span>
                </div>
                <p className="text-xs text-slate-700 italic line-clamp-2 leading-relaxed">
                  &ldquo;{finalReviewText}&rdquo;
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Go to Google Review Box &amp; Paste</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(finalReviewText);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copy Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCopiedModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
