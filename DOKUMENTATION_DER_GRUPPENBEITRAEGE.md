# Dokumentation der Gruppenbeiträge

## Mensa App Projekt

**Projekt:** HTW Berlin Mensa App (Gruppe 4, PMA WiSe 25/26)

**Datum:** 05. Februar 2026

**Gruppenmitglieder:**
Mert Iset, Julius Leander Bollmann, Murad Miller, Mahmoud El-Hassan

---

## Inhaltsverzeichnis

1. [Einleitung](#1-einleitung)
2. [Übersicht der Beiträge](#2-übersicht-der-beiträge)
3. [Detaillierte Aufgabenverteilung](#3-detaillierte-aufgabenverteilung)
   - 3.1 [Erstellung des Designkonzepts](#31-erstellung-des-designkonzepts)
   - 3.2 [Übersicht und Verantwortung für die umgesetzten Features](#32-übersicht-und-verantwortung-für-die-umgesetzten-features)
   - 3.3 [Erstellung der Präsentation](#33-erstellung-der-präsentation)
4. [Interne Rollenverteilung (Scrum)](#4-interne-rollenverteilung-scrum)
5. [Zusammenfassung](#5-zusammenfassung)

---

## 1. Einleitung

Dieses Dokument dient der Aufstellung und detaillierten Analyse der individuellen Beiträge der Gruppenmitglieder zum Projekt "HTW Berlin Mensa App". Die Analyse basiert auf der Auswertung der bereitgestellten Commit-Historie, der Projekt-Dokumentation sowie der Präsentationsunterlagen. Das ebenfalls erwähnte Miro-Board lag für die Analyse nicht vor. Ziel ist es, eine transparente Übersicht über die Verantwortlichkeiten in den Bereichen Design, Feature-Implementierung, Projektmanagement und Präsentationserstellung zu schaffen.

---

## 2. Übersicht der Beiträge

Die Projektarbeit legt eine klare, auf Stärken basierende Verteilung der Hauptverantwortlichkeiten nahe. Die folgende Tabelle fasst die Kernkompetenzen und primären Aufgabenbereiche der einzelnen Mitglieder zusammen.

| Gruppenmitglied | Hauptverantwortung | Kernkompetenzen |
|-----------------|-------------------|-----------------|
| **Mahmoud El-Hassan** | Designkonzept & User Interface (UI/UX) | Redesign, Dark Mode, UI-Komponenten, Frontend-Logik |
| **Mert Iset** | Backend-Integration & Kernfunktionalität | API-Management (Mensa & OpenAI), Offline-Funktion, Push-Notifications |
| **Murad Miller** | Build-Management & Deployment (DevOps) | Environment Setup, Dependency Management, Build-Prozesse, Merge-Konflikte |
| **Julius Leander Bollmann** | Projektstruktur & Feature-Entwicklung (Full-Stack) | Grundarchitektur, KI-Feature-Fixes, UI-Interaktivität, Debugging |

---

## 3. Detaillierte Aufgabenverteilung

### 3.1 Erstellung des Designkonzepts

Das Designkonzept und die visuelle Gestaltung der App wurden maßgeblich von Mahmoud El-Hassan vorangetrieben. Zu seinen wesentlichen Beiträgen in diesem Bereich gehören:

- **Umfassendes Redesign:** Implementierung eines neuen, modernen Designs für die gesamte App.
- **Dark Mode:** Entwicklung und Integration eines Dark-Mode-Schemas zur Verbesserung der Nutzererfahrung bei Nacht.
- **UI-Komponenten:** Gestaltung spezifischer UI-Elemente wie dem Nachhaltigkeits-Feature und der Menü-Ansicht.
- **Frontend-Logik:** Behebung von Fehlern im Frontend (appfix) und Anpassung der Codebasis an das neue Design.

---

### 3.2 Übersicht und Verantwortung für die umgesetzten Features

Die Implementierung der Features wurde vom gesamten Team getragen, wobei sich klare Schwerpunkte erkennen lassen. Die folgende Tabelle ordnet die Kernfeatures den verantwortlichen Entwicklern zu.

| Feature | Hauptverantwortlicher(e) | Beschreibung der Beiträge |
|---------|-------------------------|--------------------------|
| **Mensa API-Integration** | Mert Iset | Implementierung, Debugging und Sicherstellung der Echtzeit-Datenanzeige. |
| **KI-Assistent** | Mahmoud El-Hassan, Julius L. Bollmann | Grundimplementierung (Mahmoud), gefolgt von intensiven Fixes, API-Key-Management und Funktionserweiterung (Julius). |
| **Standortauswahl** | Mert Iset | Erweiterung der Standortauswahl auf verschiedene Campuse und Anpassung der Anzeige. |
| **Preisanzeige** | Mert Iset | Implementierung der differenzierten Preisanzeige für Studenten, Angestellte und Gäste. |
| **Offline-Funktion** | Mert Iset | Implementierung der Caching-Logik für die Offline-Nutzung der App. |
| **Push-Benachrichtigungen** | Mert Iset | Einrichtung und Konfiguration von Push-Benachrichtigungen für iOS. |
| **Favoriten-Funktion** | Julius Leander Bollmann | Implementierung der Logik zum Speichern und Anzeigen von favorisierten Gerichten. |
| **Build & Deployment** | Murad Miller | Konfiguration von EAS Build, Behebung von Bundling-Problemen und Verwaltung der Dependencies. |
| **Projekt-Grundstruktur** | Julius Leander Bollmann | Erstellung des initialen Commits und der grundlegenden Projektarchitektur. |

---

### 3.3 Erstellung der Präsentation

Die bereitgestellte Präsentation (HTWBerlinPMAWiSe25_26Gruppe4.pdf) behandelt den gesamten Prozess des Projekts von der Definition der Problemstellung bis zur Fertigstellung der App. Die Präsentation wurde von Mert Iset in Zusammensprache mit der gesamten Gruppe erstellt.

---

## 4. Interne Rollenverteilung (Scrum)

Obwohl keine formale Rollenverteilung dokumentiert wurde, lassen sich aus den Aktivitäten und Verantwortlichkeiten der Teammitglieder agile Rollen nach dem Scrum-Framework ableiten.

**Product Owner:** Diese Rolle wurde vermutlich von Mahmoud El-Hassan und Julius Leander Bollmann geteilt. Mahmoud El-Hassan trieb die Produktvision aus einer Design- und Nutzerperspektive voran, während Julius Leander Bollmann durch die Definition von Features und die initiale Projektstruktur die funktionalen Anforderungen gestaltete.

**Scrum Master:** Murad Miller agierte in der Praxis als Scrum Master. Seine Aufgaben umfassten die Beseitigung technischer Hindernisse (Merge-Konflikte, Build-Probleme) und die Sicherstellung eines reibungslosen Entwicklungsprozesses, was der dienenden Führungsrolle eines Scrum Masters entspricht.

**Developer:** Alle vier Mitglieder agierten als Developer. Mert Iset und Julius Leander Bollmann übernahmen dabei klassische Full-Stack-Entwicklungsaufgaben, Mahmoud El-Hassan spezialisierte sich auf das Frontend und die UI/UX-Entwicklung, und Murad Miller fokussierte sich auf den Bereich DevOps und die technische Infrastruktur.

---

## 5. Zusammenfassung

Die Analyse der Projektdaten zeigt eine erfolgreiche und ausgewogene Zusammenarbeit im Team der Gruppe 4. Jedes Mitglied brachte seine individuellen Stärken gezielt ein, was zu einer klaren und effektiven Aufgabenverteilung führte.

Mahmoud El-Hassan prägte das Erscheinungsbild der App, Mert Iset sorgte für die technische Funktionalität der Kernfeatures, Murad Miller gewährleistete die Stabilität und Auslieferung des Projekts, und Julius Leander Bollmann legte das Fundament und sicherte die Qualität der KI-Integration. Die Beiträge erscheinen insgesamt gleichverteilt und zeugen von einer hohen Eigenverantwortung und einem gut funktionierenden agilen Prozess.
