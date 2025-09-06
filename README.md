# A Systematic Evaluation of Environmental Flakiness in JavaScript Tests

This repository contains the artifacts for the study on **environmental flakiness in JavaScript projects**, including empirical evidence, datasets, and mitigation results using **js-env-sanitizer**.

---

## Repository Structure

### `empirical-eva/`
This directory contains materials related to the **empirical evaluation** of environmental flakiness in JavaScript.

- **dataset/**  
  - `projectStatistics.csv` — The statistics of projects included in the dataset.

- **results/**  
  - `evaluationResults.csv` — Aggregated results from the empirical evaluation.

---

### `mitigation/`
This directory contains materials related to the **mitigation of environmental flakiness** using our tool.

- **js-env-sanitizer/**  
  Source code and configuration of the mitigation tool.

- **evaluation/**  
  Contains results from applying the tool in practice.  
  - `toolEvaluationResults.csv` — Evaluation results (sanitized test runs across environments).

---

## Notes
- All project-specific CI results from forked repositories are excluded for anonymity.  
- These results will be added once the review process is complete.

