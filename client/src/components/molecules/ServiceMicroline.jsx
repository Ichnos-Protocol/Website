import { Fragment } from "react";

function renderSegment(segment) {
  if (segment.href) {
    return (
      <a href={segment.href} target="_blank" rel="noopener noreferrer">
        {segment.text}
      </a>
    );
  }
  return segment.text;
}

export default function ServiceMicroline({ segments }) {
  if (!segments?.length) {
    return null;
  }

  return (
    <p className="service-card-microline text-muted small mt-3 mb-0">
      In Catena-X terms:{" "}
      {segments.map((segment, index) => (
        <Fragment key={segment.text}>
          {index > 0 && " · "}
          {renderSegment(segment)}
        </Fragment>
      ))}
    </p>
  );
}
