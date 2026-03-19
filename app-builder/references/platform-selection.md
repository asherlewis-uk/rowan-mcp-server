# Platform Selection

Use this reference when the user needs help choosing a delivery path, comparing stacks, or mapping an app request to the right toolchain.

## Decision Inputs

- Does v1 need App Store or Play Store distribution?
- Does the app need one codebase or platform-specific UX?
- Is speed to MVP more important than long-term flexibility?
- Does the app need device APIs, offline support, or high-performance UI?
- Does the user need source code ownership and export?
- Is the app mostly CRUD, forms, dashboards, or directories?

## Recommendation Matrix

| Path | Choose it when | Watch for | Typical tools |
| --- | --- | --- | --- |
| Web app or PWA | Browser delivery is acceptable and speed matters most | Limited app-store presence and some device capabilities | Next.js, React, Supabase, Firebase |
| Native iOS | iPhone-first UX, Apple integrations, or strong iOS polish matters | Separate codebase and higher build cost | Xcode, Swift, SwiftUI |
| Native Android | Android-first reach, hardware integrations, or Android-specific UX matters | Separate codebase and higher build cost | Android Studio, Kotlin, Jetpack Compose |
| Flutter | One codebase for iOS and Android matters more than native specialization | Some platform-specific polish still needs native work | Flutter, Dart, Firebase |
| FlutterFlow | Rapid mobile MVP, visual builder workflow, and possible Flutter export matter | Generated projects may still need cleanup for advanced features | FlutterFlow, Firebase |
| Glide / Adalo / Softr | The app is mostly data-driven CRUD, internal tools, portals, or lightweight marketplaces | Platform limits, customization ceilings, and vendor lock-in | Glide, Adalo, Softr |
| Figma prototype | The user needs concept validation, wireframes, or clickable UX before building | No production runtime or backend | Figma |

## Practical Guidance

- Prefer native when the user explicitly targets one mobile platform and needs the best platform-specific UX or device integration.
- Prefer Flutter when the user wants iOS and Android together and accepts a shared UI layer.
- Prefer web or PWA when the fastest path to usable software is more important than app-store distribution.
- Prefer FlutterFlow over lighter no-code tools when the user wants a visual builder but may later need exported Flutter code.
- Prefer Glide, Adalo, or Softr when the core product is forms, records, dashboards, directories, or approvals and the user values speed over deep customization.
- Use Figma before implementation when the user asks for wireframes, flows, UI concepts, or stakeholder review materials.

## Tool Mapping

- Figma: wireframes, clickable prototypes, visual exploration
- Firebase: auth, database, storage, push notifications, MVP backend
- SwiftUI: native iOS UI
- Kotlin plus Android Studio: native Android app development
- Flutter: coded cross-platform mobile app
- FlutterFlow: visual cross-platform builder with Flutter alignment
- Glide / Adalo / Softr: no-code builders for simpler workflows and admin-heavy products
