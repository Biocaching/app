# Biocaching Mobile App

Code files are found in the `gh-pages` branch, which should be put in the www directory.

## Compiling Android APK

Update the version number in config.xml.

```
cordova platform add android

cordova build --release
```

## Publishing

Open the [Google Play Developer Console](https://play.google.com/apps/publish/), navigate to the application, open the APK menu.

Upload the APK found in platforms/android/build/outputs/apk/android-release.apk.
