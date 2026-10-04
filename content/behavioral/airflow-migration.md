---
id: "airflow-migration"
title: "STAR — Job orchestrator to Airflow (MWAA)"
section: "Behavioral"
tags: ["star", "airflow", "aws", "mwaa"]
status: "in-progress"
summary: "S: Automated jobs ran on a deprecated .NET orchestration framework with no UI; diagnosing a failure meant digging through raw logs. T: Move them to a maintainable platform without disrupting production. A: Led the migration to Apache Airflow on Amazon MWAA; designed inbound file processors (S3 → parse → insert into DB) and outbound ones (DB → generate file → S3 for a downstream team), as Python DAG tasks. R: Support now opens the Airflow UI, sees exactly which task failed and its logs, and retries a single failed task instead of rerunning the whole pipeline — diagnosis went from a manual log hunt to a few clicks. [COMPLETAR: número de jobs migrados] [COMPLETAR: tiempo aproximado de diagnóstico antes, ej. \"30–60 min\"]."
interviewLine: "Support now opens the Airflow UI, sees exactly which task failed and its logs, and retries a single failed task instead of rerunning the whole pipeline — diagnosis went from a manual log hunt to a few clicks."
drillQuestions: []
---

**S:** Automated jobs ran on a deprecated .NET orchestration framework with no UI;
diagnosing a failure meant digging through raw logs. **T:** Move them to a maintainable
platform without disrupting production. **A:** Led the migration to Apache Airflow on
Amazon MWAA; designed inbound file processors (S3 → parse → insert into DB) and outbound
ones (DB → generate file → S3 for a downstream team), as Python DAG tasks.
**R:** Support now opens the Airflow UI, sees exactly which task failed and its logs, and
retries a single failed task instead of rerunning the whole pipeline — diagnosis went
from a manual log hunt to a few clicks. [COMPLETAR: número de jobs migrados]
[COMPLETAR: tiempo aproximado de diagnóstico antes, ej. "30–60 min"].

Nota: hablar de impacto para el equipo de soporte, no de features.
