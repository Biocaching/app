# Biocaching Mobile App

Based on Apache Cordova

## Compiling Android APK

Update the version number in config.xml.

```
cordova platform add android

cordova build --release
```

## Publishing

Open the [Google Play Developer Console](https://play.google.com/apps/publish/), navigate to the application, open the APK menu.

Upload the APK found in platforms/android/build/outputs/apk/android-release.apk.
