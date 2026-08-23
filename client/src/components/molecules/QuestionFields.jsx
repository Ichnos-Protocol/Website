import Form from "react-bootstrap/Form";

import Button from "../atoms/Button";

const MAX_QUESTIONS = 3;

export default function QuestionFields({
  questions,
  setQuestions,
  canAdd,
  required,
}) {
  const handleQuestionChange = (index, value) =>
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));

  return (
    <>
      {questions.map((q, i) => (
        <Form.Group key={i} className="mb-3" controlId={`question-${i + 1}`}>
          <Form.Label>Question {i + 1}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={q}
            required={required}
            onChange={(e) => handleQuestionChange(i, e.target.value)}
          />
        </Form.Group>
      ))}
      {canAdd && questions.length < MAX_QUESTIONS && (
        <Button
          variant="outline-secondary"
          size="sm"
          className="mb-3"
          onClick={() => setQuestions((prev) => [...prev, ""])}
        >
          Add another question
        </Button>
      )}
    </>
  );
}
