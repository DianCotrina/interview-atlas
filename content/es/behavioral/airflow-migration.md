---
id: "airflow-migration"
title: "STAR — Del orquestador de jobs a Airflow (MWAA)"
section: "Behavioral"
tags: ["star", "airflow", "aws", "mwaa"]
status: "in-progress"
summary: "S: Los jobs automatizados se ejecutaban en un framework de orquestación .NET obsoleto y sin interfaz; diagnosticar un fallo requería buscar entre logs sin procesar. T: Moverlos a una plataforma mantenible sin interrumpir producción. A: Lideré la migración a Apache Airflow en Amazon MWAA; diseñé procesadores de archivos de entrada (S3 → parsear → insertar en BD) y de salida (BD → generar archivo → S3 para otro equipo), como tareas de DAG en Python. R: Soporte ahora abre la interfaz de Airflow, ve exactamente qué tarea falló y sus logs, y reintenta una sola tarea en vez de ejecutar todo el pipeline — el diagnóstico pasó de buscar manualmente entre logs a unos pocos clics. [COMPLETAR: número de jobs migrados] [COMPLETAR: tiempo aproximado de diagnóstico antes, ej. \"30–60 min\"]."
interviewLine: "Support now opens the Airflow UI, sees exactly which task failed and its logs, and retries a single failed task instead of rerunning the whole pipeline — diagnosis went from a manual log hunt to a few clicks."
drillQuestions: []
---

**S:** Los jobs automatizados se ejecutaban en un framework de orquestación .NET
obsoleto y sin interfaz; diagnosticar un fallo requería buscar entre logs sin procesar.
**T:** Moverlos a una plataforma mantenible sin interrumpir producción.
**A:** Lideré la migración a Apache Airflow en Amazon MWAA; diseñé procesadores de
archivos de entrada (S3 → parsear → insertar en BD) y de salida (BD → generar archivo
→ S3 para otro equipo), como tareas de DAG en Python.
**R:** Soporte ahora abre la interfaz de Airflow, ve exactamente qué tarea falló y sus
logs, y reintenta una sola tarea en vez de ejecutar todo el pipeline — el diagnóstico
pasó de buscar manualmente entre logs a unos pocos clics. [COMPLETAR: número de jobs migrados]
[COMPLETAR: tiempo aproximado de diagnóstico antes, ej. "30–60 min"].

Nota: hablar de impacto para el equipo de soporte, no de features.
