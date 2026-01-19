# Anniversary Widget Setup

This guide explains how to set up iOS and Android widgets for the RightyLove app.

## iOS Widget (WidgetKit)

### 1. Create Widget Extension in Xcode

1. Open the project in Xcode: `npx expo prebuild && open ios/rightyLove.xcworkspace`
2. File > New > Target > Widget Extension
3. Name it "AnniversaryWidget"
4. Uncheck "Include Configuration Intent" (we'll use a static widget)

### 2. Configure App Groups

1. Select the main app target > Signing & Capabilities > + Capability > App Groups
2. Add group: `group.com.rightylove.widgets`
3. Select the widget target and add the same App Group

### 3. Widget Implementation (Swift)

Create `AnniversaryWidget.swift`:

```swift
import WidgetKit
import SwiftUI

struct WidgetData: Codable {
    let totalDays: Int
    let durationText: String
    let nextAnniversaryDays: Int
    let nextAnniversaryYears: Int
    let isAnniversaryToday: Bool
    let hasDate: Bool
    let lastUpdated: String
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> AnniversaryEntry {
        AnniversaryEntry(date: Date(), data: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (AnniversaryEntry) -> ()) {
        let data = loadWidgetData()
        let entry = AnniversaryEntry(date: Date(), data: data)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let data = loadWidgetData()
        let currentDate = Date()
        let entry = AnniversaryEntry(date: currentDate, data: data)

        // Refresh at midnight
        let calendar = Calendar.current
        let tomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: currentDate)!)

        let timeline = Timeline(entries: [entry], policy: .after(tomorrow))
        completion(timeline)
    }

    private func loadWidgetData() -> WidgetData? {
        guard let userDefaults = UserDefaults(suiteName: "group.com.rightylove.widgets"),
              let jsonString = userDefaults.string(forKey: "anniversary_widget_data"),
              let jsonData = jsonString.data(using: .utf8) else {
            return nil
        }

        return try? JSONDecoder().decode(WidgetData.self, from: jsonData)
    }
}

struct AnniversaryEntry: TimelineEntry {
    let date: Date
    let data: WidgetData?
}

struct AnniversaryWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if let data = entry.data, data.hasDate {
            VStack(alignment: .leading, spacing: 4) {
                if data.isAnniversaryToday {
                    Text("🎉")
                        .font(.title)
                    Text("Happy Anniversary!")
                        .font(.headline)
                        .foregroundColor(.pink)
                } else {
                    HStack {
                        Text("💕")
                            .font(.title2)
                        VStack(alignment: .leading) {
                            Text("\(data.totalDays)")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.pink)
                            Text("days together")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }

                    if family != .systemSmall && data.nextAnniversaryDays > 0 {
                        Divider()
                        HStack {
                            Image(systemName: "gift")
                                .foregroundColor(.purple)
                            Text("\(data.nextAnniversaryYears) year anniversary in \(data.nextAnniversaryDays) days")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .padding()
        } else {
            VStack {
                Text("💕")
                    .font(.title)
                Text("Set your anniversary date")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
        }
    }
}

@main
struct AnniversaryWidget: Widget {
    let kind: String = "AnniversaryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            AnniversaryWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Anniversary")
        .description("See how long you've been together")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
    }
}
```

---

## Android Widget (AppWidget)

### 1. Create Widget Files

After running `npx expo prebuild`, create these files in `android/app/src/main/`:

### 2. Widget Layout (`res/layout/anniversary_widget.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_background"
    android:gravity="center">

    <TextView
        android:id="@+id/emoji"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="💕"
        android:textSize="28sp" />

    <TextView
        android:id="@+id/days_count"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="32sp"
        android:textStyle="bold"
        android:textColor="#FF6B9D" />

    <TextView
        android:id="@+id/days_label"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="days together"
        android:textSize="12sp"
        android:textColor="#666666" />

</LinearLayout>
```

### 3. Widget Info (`res/xml/anniversary_widget_info.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="110dp"
    android:minHeight="40dp"
    android:updatePeriodMillis="3600000"
    android:initialLayout="@layout/anniversary_widget"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewImage="@drawable/widget_preview">
</appwidget-provider>
```

### 4. Widget Provider (`java/.../AnniversaryWidgetProvider.kt`)

```kotlin
package com.rightylove

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject

class AnniversaryWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        internal fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.anniversary_widget)

            // Read data from SharedPreferences
            val prefs = context.getSharedPreferences("com.rightylove.widgets", Context.MODE_PRIVATE)
            val jsonString = prefs.getString("anniversary_widget_data", null)

            if (jsonString != null) {
                try {
                    val data = JSONObject(jsonString)
                    val totalDays = data.getInt("totalDays")
                    val hasDate = data.getBoolean("hasDate")
                    val isAnniversaryToday = data.getBoolean("isAnniversaryToday")

                    if (hasDate) {
                        if (isAnniversaryToday) {
                            views.setTextViewText(R.id.emoji, "🎉")
                            views.setTextViewText(R.id.days_count, "Happy")
                            views.setTextViewText(R.id.days_label, "Anniversary!")
                        } else {
                            views.setTextViewText(R.id.emoji, "💕")
                            views.setTextViewText(R.id.days_count, totalDays.toString())
                            views.setTextViewText(R.id.days_label, "days together")
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            } else {
                views.setTextViewText(R.id.days_count, "—")
                views.setTextViewText(R.id.days_label, "Set anniversary date")
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
```

### 5. Register Widget in AndroidManifest.xml

Add inside `<application>` tag:

```xml
<receiver
    android:name=".AnniversaryWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/anniversary_widget_info" />
</receiver>
```

---

## Native Module Bridge

To connect React Native with the widgets, create a native module:

### iOS (Swift)

```swift
// WidgetBridge.swift
import Foundation
import WidgetKit

@objc(WidgetBridge)
class WidgetBridge: NSObject {

    @objc
    func setWidgetData(_ jsonString: String) {
        if let userDefaults = UserDefaults(suiteName: "group.com.rightylove.widgets") {
            userDefaults.set(jsonString, forKey: "anniversary_widget_data")
            userDefaults.synchronize()
        }

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
```

### Android (Kotlin)

```kotlin
// WidgetBridgeModule.kt
package com.rightylove

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WidgetBridge"

    @ReactMethod
    fun setWidgetData(jsonString: String) {
        val prefs = reactApplicationContext.getSharedPreferences(
            "com.rightylove.widgets",
            Context.MODE_PRIVATE
        )
        prefs.edit().putString("anniversary_widget_data", jsonString).apply()

        // Update all widget instances
        val manager = AppWidgetManager.getInstance(reactApplicationContext)
        val ids = manager.getAppWidgetIds(
            ComponentName(reactApplicationContext, AnniversaryWidgetProvider::class.java)
        )
        for (id in ids) {
            AnniversaryWidgetProvider.updateAppWidget(reactApplicationContext, manager, id)
        }
    }
}
```

---

## Usage

After setting up the native code, the widget will automatically update when the relationship start date changes. The React Native app updates the widget data through the `widgetBridge` service.

To manually update the widget:

```typescript
import { updateWidgetData, requestWidgetUpdate } from '@/services/widgetBridge';

// Update widget data
await updateWidgetData(relationshipStartDate);

// Request widget refresh
await requestWidgetUpdate();
```
