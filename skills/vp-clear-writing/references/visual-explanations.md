# Visual Explanations

Make the reader's question visible. Proactively draw relationships, flows,
states, timing, and choices where a visual helps the reader follow the argument.
These are selection guidelines, not requirements to install tools or create
every view. Preserve explicit text-only formats and the scope of a narrow edit.

## Choose the view before the tool

"Diagram" is the umbrella term. A user flow follows a user's actions and choices;
a workflow follows work and responsibility; a state diagram shows states and
event-driven transitions. A decision tree selects an outcome through conditions.
They can describe the same system but answer different questions.

| Reader's question | View | Include |
| --- | --- | --- |
| What does the user do next? | User flow, often a flowchart | Goal, entry, actions/screens, decisions, feedback, exit and recovery; do not substitute a feelings-oriented journey map. |
| Who does what, and when is work handed off? | Workflow with lanes or grouped actors | Owners, inputs, handoffs, waiting, completion, and exceptions. Use BPMN when formal process semantics/interchange is required. |
| Which states exist and what changes them? | State diagram, optionally a transition table | Initial/final states, events, guards, and recovery. Distinguish state names from actions; represent concurrent regions only when established. |
| Which option applies under these conditions? | Decision tree; decision table for overlapping rules | Discriminating conditions, outcomes, exceptions, and unknown evidence. Do not invent thresholds to make every branch terminate. |
| In what order do systems interact? | Sequence diagram | Participants, messages, async boundaries, alternatives, failures, and retries relevant to the question. |
| What depends on what, or owns this data? | Architecture/dependency view or ER diagram | Named boundaries, labeled relationships, ownership, and a consistent abstraction level; use C4 views where appropriate. |
| How did events unfold, or what is scheduled? | Timeline or Gantt | Event versus observation time, time zone, dependencies, and uncertainty. Do not invent dates or durations. |
| What changes across quantities or scenarios? | Chart, plot, or interactive model | Source data, units, scales, assumptions, uncertainty, and the takeaway; a table can preserve exact values. |
| How do a few independent options compare? | Table | Comparable criteria and evidence. Use a graph only when relationships add information. |

Use only the views needed. The [C4 model](https://c4model.com/diagrams) likewise
selects useful levels rather than requiring all levels. The Mermaid
[flowchart](https://mermaid.js.org/syntax/flowchart.html),
[state](https://mermaid.js.org/syntax/stateDiagram.html), and
[sequence](https://mermaid.js.org/syntax/sequenceDiagram.html) references define
different notations; a box-and-arrow picture is not automatically a state model.

## Select tools by destination and editing needs

| Situation | Candidate and reason |
| --- | --- |
| Small technical diagram in Markdown/chat/repository docs | Prefer [Mermaid](https://mermaid.js.org/intro/) when the destination renders the needed syntax. Retain editable text. Check the host's version; do not assume new or beta types work everywhere. |
| Application owns rendering of Mermaid source | Route renderer selection to `vp-stack-selection`: conditionally prefer Pele for a new owned renderer, with Mermaid.js retained for required behavior. Keep `mermaid` source fences. |
| Text-maintained architecture with containers/layout needs beyond the current host | Evaluate [D2](https://d2lang.com/tour/intro/); use an exported artifact when the destination cannot render its source. |
| Generated dependency graphs or specialized automatic graph layout | Evaluate [Graphviz/DOT](https://graphviz.org/). Choose and verify a layout appropriate to the graph; density may require separate views. |
| Detailed UML or an existing UML documentation pipeline | Evaluate [PlantUML](https://plantuml.com/); preserve the established notation and rendering pipeline when it fits. |
| Formal business-process handoffs, events, gateways, and interchange | Use [BPMN](https://www.bpmn.org/) with a compatible modeler, such as [bpmn-js](https://bpmn.io/). A Mermaid flowchart does not provide BPMN interchange or execution semantics. |
| Workshop sketch, spatial explanation, or manually editable handoff | Evaluate [Excalidraw](https://github.com/excalidraw/excalidraw) for sketching or [draw.io](https://www.drawio.com/docs/manual/export/export-diagram/) for structured diagrams. Keep native source and a viewable export. |
| Data-driven chart or exploratory interaction | Use the available visualization workflow and a plotting/visualization tool, such as [Vega-Lite](https://vega.github.io/vega-lite/). Prefer interaction when changing assumptions helps; use reproducible standalone plots for publication/export. |
| Exact evidence of an interface or an illustrative image | Capture the real interface through the recording workflow for evidence. Use image-generation tooling for illustration when appropriate; do not generate factual labels, exact topology, or evidence screenshots with a generative model. |

These candidates are not interchangeable universal defaults. Honor a requested
tool or required native format. Prefer an available supported renderer over
introducing a new tool for one small diagram. For a destination without rendering,
provide an accessible SVG/PNG/PDF export with its source when authorized, or a
compact text/table representation. A raw code fence is not a rendered image.

## Keep visual and prose evidence aligned

Give the visual a clear question or caption, consistent labels, and explicit
arrow meaning. Keep observed, proposed, and unknown behavior distinguishable;
use text labels as well as color. Include alternate, failure, and recovery paths
when their omission would change the reader's conclusion. Split crowded views
instead of shrinking labels until unreadable.

State the takeaway and material qualifications in adjacent prose. Follow
[W3C complex-image guidance](https://www.w3.org/WAI/tutorials/images/complex/):
identify the visual and make its essential relationships available in text,
using a longer description or table when needed. A short alt label alone cannot
convey a complex workflow.

Trace a representative path and exception against the supplied facts. Render
and inspect the intended destination when available: check syntax, clipped or
overlapping labels, edge direction, Unicode/fonts, contrast, and export size.
If rendering is unavailable, label that limit; successful parsing alone does
not establish readability or correct behavior. Keep editable source when a
maintained artifact is requested, and do not send private diagram content to a
remote renderer without authorization.

Tool documentation reviewed: 2026-10-31. The view/tool mapping is a synthesis for
clear explanations, not a claim that every integration was executed or that a
diagram proves implementation correctness.
