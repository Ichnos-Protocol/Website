import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

import { useGetMeQuery } from "../../features/auth/authApi";
import { openAuthModal } from "../../features/auth/authSlice";
import {
  useSubmitContactMutation,
  useAddQuestionMutation,
} from "../../features/contact/contactApi";
import { setFormData } from "../../features/contact/contactSlice";
import { useConsortiumForm } from "../../hooks/useConsortiumForm";
import { useResumeAfterAuth } from "../../hooks/useResumeAfterAuth";
import Button from "../atoms/Button";
import ContactFormProfile from "../molecules/ContactFormProfile";
import QuestionFields from "../molecules/QuestionFields";
import ContactFormChecks from "../molecules/ContactFormChecks";
import InquirySuccess from "../molecules/InquirySuccess";

export default function ContactRequestForm({
  mode = "inquiry",
  requestId,
  onBook,
  onSuccess,
}) {
  // Adding a follow-up question to an existing request is its own mode: the
  // question is the whole submission, so it stays required and none of the
  // registration controls take part in it.
  const isFollowUp = Boolean(requestId);
  const dispatch = useDispatch();
  const savedFormData = useSelector((s) => s.contact.formData);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const { data: meData } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [submitContact, { isLoading: isSubmitting }] =
    useSubmitContactMutation();
  const [addQuestion, { isLoading: isAdding }] = useAddQuestionMutation();
  const consortium = useConsortiumForm(isFollowUp ? "inquiry" : mode);
  const [questions, setQuestions] = useState([""]);
  const [consent, setConsent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const isLoading = isSubmitting || isAdding;

  const doSubmit = async (qs) => {
    setError("");
    const filtered = qs.filter((t) => t.trim()).map((text) => ({ text }));
    // A consortium registration is a valid submission on its own.
    if (!filtered.length && !consortium.interest) return;
    try {
      if (isFollowUp) {
        await addQuestion({
          id: requestId,
          question: filtered[0].text,
        }).unwrap();
      } else {
        await submitContact({
          questions: filtered,
          consentTimestamp: new Date().toISOString(),
          consentVersion: "v1",
          ...consortium.submitFields(),
        }).unwrap();
        consortium.invalidate();
      }
      setSuccess(true);
      // The caller decides what a successful submit leads to: the inquiry flow
      // stays on the confirmation, the consortium flow moves on to the tiers.
      onSuccess?.();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const setPendingSubmit = useResumeAfterAuth(() =>
    doSubmit(savedFormData.questions || questions),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!consent) return;
    if (!isAuthenticated) {
      dispatch(setFormData({ questions, consent }));
      setPendingSubmit(true);
      dispatch(openAuthModal(consortium.authMode));
      return;
    }
    doSubmit(questions);
  };

  if (success) return <InquirySuccess onBook={onBook} />;

  return (
    <Form onSubmit={handleSubmit}>
      <ContactFormProfile profile={meData?.data?.user} />
      {error && <Alert variant="danger">{error}</Alert>}
      <QuestionFields
        questions={questions}
        setQuestions={setQuestions}
        canAdd={!isFollowUp}
        required={isFollowUp || !consortium.interest}
      />
      <ContactFormChecks
        consent={consent}
        onConsentChange={setConsent}
        showConsortium={!isFollowUp}
        interestProps={consortium.toggleProps}
        fieldsProps={consortium.fieldsProps}
      />
      <Button type="submit" disabled={isLoading || !consent}>
        {isLoading && <Spinner size="sm" animation="border" className="me-2" />}
        {isFollowUp ? "Add Question" : consortium.submitLabel}
      </Button>
    </Form>
  );
}
