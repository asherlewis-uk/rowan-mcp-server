---
name: app-builder
description: Plan, scope, and build web, mobile, iOS, Android, and no-code app MVPs. Use when Codex needs to turn an app idea into a practical delivery plan or implementation path, especially for requests such as "build a web app MVP," "generate mobile app wireframes," "create an Android app," "launch an iOS app," "choose between Flutter, SwiftUI, Kotlin, or no-code tools," or "design the screens, flows, and stack for my app."
---

# App Builder

## Overview

Turn an app idea into a buildable plan or implementation path. Start with product framing, choose the right delivery path, then produce scope, screens, flows, stack decisions, and concrete next steps.

## Default Workflow

1. Distill the request into the user, problem, core action, and success metric. If the request is vague, infer a narrow MVP and state the assumption.
2. Classify the target as a web app, cross-platform mobile app, native iOS app, native Android app, or no-code prototype. Load [references/platform-selection.md](./references/platform-selection.md) when choosing or comparing tools.
3. Define v1 scope by separating must-have flows from later phases. Keep the first release small enough to ship quickly.
4. List the key screens and navigation. Describe each screen by user goal, required inputs, and main state changes.
5. Identify the minimum backend and integration needs: auth, data model, notifications, payments, analytics, admin tools, or third-party APIs. Include only what materially affects scope.
6. Recommend the build path and explain the tradeoff in terms of speed, flexibility, platform reach, maintainability, and lock-in.
7. Deliver the artifact that matches the request:
   - product brief
   - MVP feature list
   - screen map or wireframe outline
   - stack recommendation
   - implementation plan
   - repo scaffold or code changes
   - no-code setup checklist

## Output Rules

- Prefer concrete outputs over generic brainstorming.
- When the user asks for no-code, do not default to a custom-coded stack.
- When the user asks for code, do not deflect to no-code unless it clearly reduces risk and still meets the requirements.
- Work within the user's named stack unless there is a strong mismatch between the tool and the requested outcome.
- If the user asks to build inside the current repo, move from planning to implementation after the stack is chosen.
- If the user asks only for UX or wireframes, focus on information architecture, screens, flows, and component notes rather than backend details.

## Discovery Checklist

- Target user and primary job to be done
- Platforms required for v1
- Core flows that must work end to end
- Data captured, stored, or synced
- External services and device capabilities
- Monetization, if relevant
- Timeline, budget, and skill constraints
- Whether the user wants a prototype, an MVP, or production-ready code

## Common Request Shapes

- "Build a web app MVP for SaaS without code"
- "Generate UI/UX wireframes for a mobile app"
- "Create a simple Android app for my startup idea"
- "Help me launch an iOS app without coding"
- "Choose between Flutter, SwiftUI, Kotlin, FlutterFlow, and Glide for this app idea"

## Reference Usage

Load [references/platform-selection.md](./references/platform-selection.md) when the user needs help choosing between native, cross-platform, web, or no-code delivery paths, or when mapping a request to tools such as Figma, Firebase, SwiftUI, Kotlin, Flutter, FlutterFlow, Glide, Adalo, or Softr.
