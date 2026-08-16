// Objective target extraction for the protocol dossier.
//
// Contract: rendering must be lossless. A delimiter prefix (— : ;) is only
// lifted out as the visible short target label when it is short enough to
// render as one; in that case both the label and the remainder stay visible.
// In every other case the reader-visible body keeps the FULL objective text —
// a delimiter must never silently discard the clause that identifies the
// intervention, subject, evidence lane, or attribution.
export function splitObjective(text, index) {
  const delimiterAt = text.search(/—|:|;/);
  const rawTarget = delimiterAt === -1 ? '' : text.slice(0, delimiterAt);
  const body = delimiterAt === -1 ? text : text.slice(delimiterAt + 1);
  const useTargetLabel =
    delimiterAt !== -1 && rawTarget.trim().length > 0 && body.trim().length > 0 && rawTarget.length <= 34;

  return {
    target: useTargetLabel ? rawTarget.trim() : `target ${String(index).padStart(2, '0')}`,
    text: useTargetLabel ? body.trim() : text,
  };
}
